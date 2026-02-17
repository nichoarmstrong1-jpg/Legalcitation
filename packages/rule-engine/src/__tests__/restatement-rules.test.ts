import { describe, it, expect } from 'vitest';
import { validateRestatement } from '../bluebook/restatement-rules.js';
import type { RestatementComponents } from '@legalcitation/shared';

function makeRestatementComponents(overrides: Partial<RestatementComponents> = {}): RestatementComponents {
  return {
    series: 'Second',
    subject: 'Torts',
    section: '402A',
    year: '1965',
    ...overrides,
  } as RestatementComponents;
}

describe('R. 15.8 — Restatement Rules', () => {
  it('passes a well-formed Restatement citation', () => {
    const components = makeRestatementComponents({ organization: 'Am. L. Inst.' });
    const issues = validateRestatement(components, 'Restatement (Second) of Torts § 402A (Am. L. Inst. 1965).');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing series', () => {
    const components = makeRestatementComponents({ series: '' });
    const issues = validateRestatement(components);
    const seriesErrors = issues.filter(i => i.message.includes('series'));
    expect(seriesErrors.length).toBeGreaterThan(0);
  });

  it('flags invalid series', () => {
    const components = makeRestatementComponents({ series: 'Fifth' });
    const issues = validateRestatement(components);
    const seriesErrors = issues.filter(i => i.message.includes('not a valid'));
    expect(seriesErrors.length).toBeGreaterThan(0);
  });

  it('flags missing subject', () => {
    const components = makeRestatementComponents({ subject: '' });
    const issues = validateRestatement(components);
    const subjectErrors = issues.filter(i => i.message.includes('subject'));
    expect(subjectErrors.length).toBeGreaterThan(0);
  });

  it('flags missing section', () => {
    const components = makeRestatementComponents({ section: '' });
    const issues = validateRestatement(components);
    const sectionErrors = issues.filter(i => i.message.includes('section'));
    expect(sectionErrors.length).toBeGreaterThan(0);
  });

  it('flags missing year', () => {
    const components = makeRestatementComponents({ year: '' });
    const issues = validateRestatement(components);
    const yearErrors = issues.filter(i => i.message.includes('year'));
    expect(yearErrors.length).toBeGreaterThan(0);
  });

  it('suggests Am. L. Inst. when organization is missing', () => {
    const components = makeRestatementComponents();
    const issues = validateRestatement(components);
    const orgIssues = issues.filter(i => i.message.includes('Am. L. Inst.'));
    expect(orgIssues.length).toBeGreaterThan(0);
  });

  it('flags "section" spelled out instead of §', () => {
    const components = makeRestatementComponents();
    const issues = validateRestatement(components, 'Restatement (Second) of Torts section 402A (1965).');
    const secErrors = issues.filter(i => i.rule === 'R. 3.3');
    expect(secErrors.length).toBeGreaterThan(0);
  });

  it('validates comment pinpoint format', () => {
    const components = makeRestatementComponents({ pinCite: 'cmt. A' });
    const issues = validateRestatement(components);
    const cmtIssues = issues.filter(i => i.message.includes('Comment pinpoint'));
    expect(cmtIssues.length).toBeGreaterThan(0);
  });

  it('accepts valid comment pinpoint', () => {
    const components = makeRestatementComponents({ pinCite: 'cmt. a' });
    const issues = validateRestatement(components);
    const cmtIssues = issues.filter(i => i.message.includes('Comment pinpoint'));
    expect(cmtIssues.length).toBe(0);
  });
});
