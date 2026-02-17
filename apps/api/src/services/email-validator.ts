import { promises as dns } from 'dns';

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'guerrillamailblock.com',
  'grr.la',
  'sharklasers.com',
  'guerrillamail.info',
  'guerrillamail.de',
  'tmail.ws',
  'dispostable.com',
  'trashmail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'tempail.com',
  'mohmal.com',
  'getnada.com',
  'maildrop.cc',
  '10minutemail.com',
  'guerrillamail.net',
  'mailnesia.com',
  'tempr.email',
  'discard.email',
  'mailcatch.com',
  'throwam.com',
  'mytemp.email',
  'emailondeck.com',
  'mintemail.com',
  'tempinbox.com',
]);

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  if (trimmed.length > 254) {
    return { valid: false, reason: 'Email address is too long' };
  }

  const atIndex = trimmed.indexOf('@');
  const domain = trimmed.slice(atIndex + 1);

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' };
  }

  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) {
      return { valid: false, reason: 'Email domain does not accept mail' };
    }
  } catch {
    return { valid: false, reason: 'Email domain could not be verified' };
  }

  return { valid: true };
}
