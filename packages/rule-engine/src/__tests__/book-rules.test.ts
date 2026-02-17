import { describe, it, expect } from 'vitest';
import { validateBook } from '../bluebook/book-rules.js';
import type { BookComponents } from '@legalcitation/shared';

function makeBookComponents(overrides: Partial<BookComponents> = {}): BookComponents {
  return {
    authors: ['Erwin Chemerinsky'],
    title: 'Constitutional Law: Principles and Policies',
    year: '2023',
    edition: '7th ed.',
    ...overrides,
  } as BookComponents;
}

describe('R. 15 — Book Rules', () => {
  it('passes a well-formed book citation', () => {
    const components = makeBookComponents({ page: '42' });
    const issues = validateBook(components, 'Erwin Chemerinsky, Constitutional Law: Principles and Policies 42 (7th ed. 2023).');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing author', () => {
    const components = makeBookComponents({ authors: [] });
    const issues = validateBook(components);
    const authorErrors = issues.filter(i => i.message.includes('author'));
    expect(authorErrors.length).toBeGreaterThan(0);
  });

  it('flags missing title', () => {
    const components = makeBookComponents({ title: '' });
    const issues = validateBook(components);
    const titleErrors = issues.filter(i => i.message.includes('title'));
    expect(titleErrors.length).toBeGreaterThan(0);
  });

  it('flags missing year', () => {
    const components = makeBookComponents({ year: '' });
    const issues = validateBook(components);
    const yearErrors = issues.filter(i => i.message.includes('year'));
    expect(yearErrors.length).toBeGreaterThan(0);
  });

  it('flags ALL CAPS author name', () => {
    const components = makeBookComponents({ authors: ['ERWIN CHEMERINSKY'] });
    const issues = validateBook(components);
    const capsIssues = issues.filter(i => i.message.includes('all caps'));
    expect(capsIssues.length).toBeGreaterThan(0);
  });

  it('flags "p." or "pp." in raw text', () => {
    const components = makeBookComponents({ page: '42' });
    const issues = validateBook(components, 'Chemerinsky, Constitutional Law p. 42 (7th ed. 2023).');
    const pErrors = issues.filter(i => i.rule === 'R. 3.2(b)');
    expect(pErrors.length).toBeGreaterThan(0);
  });

  it('flags "section" spelled out instead of §', () => {
    const components = makeBookComponents({ section: '6.4' });
    const issues = validateBook(components, 'Chemerinsky, Constitutional Law section 6.4 (7th ed. 2023).');
    const secErrors = issues.filter(i => i.rule === 'R. 3.3');
    expect(secErrors.length).toBeGreaterThan(0);
  });

  it('flags non-numeric volume', () => {
    const components = makeBookComponents({ volume: 'five' });
    const issues = validateBook(components);
    const volErrors = issues.filter(i => i.message.includes('Volume'));
    expect(volErrors.length).toBeGreaterThan(0);
  });

  it('validates edition format', () => {
    const components = makeBookComponents({ edition: 'seventh edition' });
    const issues = validateBook(components);
    const edErrors = issues.filter(i => i.message.includes('Edition'));
    expect(edErrors.length).toBeGreaterThan(0);
  });
});
