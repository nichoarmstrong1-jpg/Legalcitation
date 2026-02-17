import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';

interface AppleJWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface AppleJWKSResponse {
  keys: AppleJWK[];
}

export interface AppleTokenPayload {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

let cachedKeys: AppleJWK[] | null = null;
let keysCachedAt = 0;
const KEY_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchApplePublicKeys(): Promise<AppleJWK[]> {
  const now = Date.now();
  if (cachedKeys && now - keysCachedAt < KEY_CACHE_TTL) {
    return cachedKeys;
  }

  const response = await fetch(APPLE_JWKS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Apple public keys: ${response.status}`);
  }

  const data = (await response.json()) as AppleJWKSResponse;
  cachedKeys = data.keys;
  keysCachedAt = now;
  return data.keys;
}

function jwkToPem(jwk: AppleJWK): string {
  const key = crypto.createPublicKey({
    key: {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
    },
    format: 'jwk',
  });
  return key.export({ type: 'spki', format: 'pem' }).toString();
}

export async function verifyAppleToken(idToken: string, clientId: string): Promise<AppleTokenPayload> {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid Apple ID token');
  }

  const kid = decoded.header.kid;
  if (!kid) {
    throw new Error('Apple ID token missing kid header');
  }

  const keys = await fetchApplePublicKeys();
  const matchingKey = keys.find(k => k.kid === kid);
  if (!matchingKey) {
    throw new Error('No matching Apple public key found');
  }

  const pem = jwkToPem(matchingKey);

  const payload = jwt.verify(idToken, pem, {
    algorithms: ['RS256'],
    issuer: APPLE_ISSUER,
    audience: clientId,
  }) as Record<string, unknown>;

  if (!payload.sub || !payload.email) {
    throw new Error('Apple token missing required claims');
  }

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
  };
}
