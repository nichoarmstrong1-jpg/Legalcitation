import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateEmail } from '../email-validator.js';
import { promises as dns } from 'dns';

vi.mock('dns', () => ({
  promises: {
    resolveMx: vi.fn(),
  },
}));

const mockResolveMx = vi.mocked(dns.resolveMx);

describe('validateEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('format validation', () => {
    it('rejects empty email', async () => {
      const result = await validateEmail('');
      expect(result.valid).toBe(false);
    });

    it('rejects email without @', async () => {
      const result = await validateEmail('notanemail');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('format');
    });

    it('rejects overly long email', async () => {
      const long = 'a'.repeat(250) + '@test.com';
      const result = await validateEmail(long);
      expect(result.valid).toBe(false);
    });
  });

  describe('disposable domain detection', () => {
    it('rejects mailinator.com', async () => {
      const result = await validateEmail('test@mailinator.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Disposable');
    });

    it('rejects yopmail.com', async () => {
      const result = await validateEmail('test@yopmail.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Disposable');
    });

    it('rejects tempmail.com', async () => {
      const result = await validateEmail('test@tempmail.com');
      expect(result.valid).toBe(false);
    });
  });

  describe('MX record check', () => {
    it('passes with valid MX records', async () => {
      mockResolveMx.mockResolvedValue([{ exchange: 'mx.example.com', priority: 10 }]);
      const result = await validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('rejects domain with no MX records', async () => {
      mockResolveMx.mockResolvedValue([]);
      const result = await validateEmail('user@nodomain.invalid');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('does not accept mail');
    });

    it('rejects domain with DNS failure', async () => {
      mockResolveMx.mockRejectedValue(new Error('ENOTFOUND'));
      const result = await validateEmail('user@nonexistent.tld');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('could not be verified');
    });
  });
});
