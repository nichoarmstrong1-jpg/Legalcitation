import { describe, it, expect } from 'vitest';
import { validateInternet } from '../bluebook/internet-rules.js';
import type { InternetComponents } from '@legalcitation/shared';

function makeInternetComponents(overrides: Partial<InternetComponents> = {}): InternetComponents {
  return {
    title: 'About Us',
    url: 'https://www.example.com/about',
    date: 'Jan. 15, 2025',
    archiveUrl: 'https://perma.cc/XXXX-YYYY',
    ...overrides,
  } as InternetComponents;
}

describe('R. 18 — Internet Rules', () => {
  it('passes a well-formed internet citation with archive', () => {
    const components = makeInternetComponents();
    const raw = 'About Us, Example, https://www.example.com/about [https://perma.cc/XXXX-YYYY] (Jan. 15, 2025).';
    const issues = validateInternet(components, raw);
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing archive URL (R. 18.2.1(d))', () => {
    const components = makeInternetComponents({ archiveUrl: undefined });
    const raw = 'About Us, Example, https://www.example.com/about (Jan. 15, 2025).';
    const issues = validateInternet(components, raw);
    const archiveErrors = issues.filter(i => i.rule === 'R. 18.2.1(d)' && i.severity === 'error');
    expect(archiveErrors.length).toBeGreaterThan(0);
  });

  it('accepts "on file with" as alternative to archive URL', () => {
    const components = makeInternetComponents({ archiveUrl: undefined });
    const raw = 'About Us, Example, https://www.example.com/about (Jan. 15, 2025) (on file with the Harvard Law Review).';
    const issues = validateInternet(components, raw);
    const archiveErrors = issues.filter(i => i.rule === 'R. 18.2.1(d)' && i.severity === 'error');
    expect(archiveErrors.length).toBe(0);
  });

  it('flags missing URL', () => {
    const components = makeInternetComponents({ url: '' });
    const issues = validateInternet(components);
    const urlErrors = issues.filter(i => i.message.includes('URL'));
    expect(urlErrors.length).toBeGreaterThan(0);
  });

  it('flags missing title', () => {
    const components = makeInternetComponents({ title: '' });
    const issues = validateInternet(components);
    const titleErrors = issues.filter(i => i.message.includes('title'));
    expect(titleErrors.length).toBeGreaterThan(0);
  });

  it('warns about HTTP instead of HTTPS', () => {
    const components = makeInternetComponents({ url: 'http://www.example.com/about' });
    const issues = validateInternet(components);
    const httpIssues = issues.filter(i => i.message.includes('HTTP'));
    expect(httpIssues.length).toBeGreaterThan(0);
  });

  it('warns about homepage URL', () => {
    const components = makeInternetComponents({ url: 'https://www.example.com/' });
    const issues = validateInternet(components);
    const homepageIssues = issues.filter(i => i.message.includes('homepage'));
    expect(homepageIssues.length).toBeGreaterThan(0);
  });

  it('flags "available at" without parallel print citation', () => {
    const components = makeInternetComponents();
    const raw = 'About Us, available at https://www.example.com/about [https://perma.cc/XXXX-YYYY].';
    const issues = validateInternet(components, raw);
    const availErrors = issues.filter(i => i.rule === 'R. 18.2.1(b)');
    expect(availErrors.length).toBeGreaterThan(0);
  });

  it('warns when no date or last visited is provided', () => {
    const components = makeInternetComponents({ date: undefined });
    const issues = validateInternet(components);
    const dateIssues = issues.filter(i => i.message.includes('date'));
    expect(dateIssues.length).toBeGreaterThan(0);
  });

  it('suggests non-standard archive URL', () => {
    const components = makeInternetComponents({ archiveUrl: 'https://archive.today/abc123' });
    const issues = validateInternet(components);
    const archiveSuggestions = issues.filter(i => i.message.includes('perma.cc or web.archive.org'));
    expect(archiveSuggestions.length).toBeGreaterThan(0);
  });
});
