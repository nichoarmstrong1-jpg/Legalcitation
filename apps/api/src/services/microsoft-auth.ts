import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const MICROSOFT_JWKS_URL = 'https://login.microsoftonline.com/common/discovery/v2.0/keys';
const MICROSOFT_ISSUER_REGEX = /^https:\/\/login\.microsoftonline\.com\/[a-f0-9-]+\/v2\.0$/;

interface MicrosoftJWK {
  kty: string;
  kid: string;
  use: string;
  n: string;
  e: string;
}

interface MicrosoftJWKSResponse {
  keys: MicrosoftJWK[];
}

export interface MicrosoftTokenPayload {
  sub: string;
  email: string;
  name?: string;
}

let cachedKeys: MicrosoftJWK[] | null = null;
let keysCachedAt = 0;
const KEY_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchMicrosoftPublicKeys(): Promise<MicrosoftJWK[]> {
  const now = Date.now();
  if (cachedKeys && now - keysCachedAt < KEY_CACHE_TTL) {
    return cachedKeys;
  }

  const response = await fetch(MICROSOFT_JWKS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Microsoft public keys: ${response.status}`);
  }

  const data = (await response.json()) as MicrosoftJWKSResponse;
  cachedKeys = data.keys;
  keysCachedAt = now;
  return data.keys;
}

function jwkToPem(jwk: MicrosoftJWK): string {
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

export async function verifyMicrosoftToken(idToken: string, clientId: string): Promise<MicrosoftTokenPayload> {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid Microsoft ID token');
  }

  const kid = decoded.header.kid;
  if (!kid) {
    throw new Error('Microsoft ID token missing kid header');
  }

  const keys = await fetchMicrosoftPublicKeys();
  const matchingKey = keys.find(k => k.kid === kid);
  if (!matchingKey) {
    throw new Error('No matching Microsoft public key found');
  }

  const pem = jwkToPem(matchingKey);

  const payload = jwt.verify(idToken, pem, {
    algorithms: ['RS256'],
    audience: clientId,
  }) as Record<string, unknown>;

  // Validate issuer matches Microsoft pattern
  const issuer = payload.iss as string;
  if (!issuer || !MICROSOFT_ISSUER_REGEX.test(issuer)) {
    throw new Error('Invalid Microsoft token issuer');
  }

  const email = (payload.email || payload.preferred_username) as string | undefined;
  const sub = (payload.oid || payload.sub) as string | undefined;

  if (!sub || !email) {
    throw new Error('Microsoft token missing required claims');
  }

  return {
    sub,
    email,
    name: payload.name as string | undefined,
  };
}
