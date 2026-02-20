import { describe, it, expect } from 'vitest';
import { extractParseAndResolve, extractAndParseCitations } from '../index.js';
import { resolveCitations } from '../resolver.js';
import type { ShortFormComponents, CaseComponents } from '@legalcitation/shared';

describe('resolveCitations', () => {
  it('resolves Id. after a single full citation', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Id. at 490.';
    const { citations, resolution } = extractParseAndResolve(text);

    const fullCite = citations.find(c => c.type === 'case');
    const idCite = citations.find(c => c.type === 'id');

    expect(fullCite).toBeDefined();
    expect(idCite).toBeDefined();
    expect(idCite?.resolvedResourceId).toBeDefined();
    expect(resolution.unresolvedCitations).not.toContain(idCite?.id);

    // Both should resolve to the same resource
    const fullResource = fullCite?.resolvedResourceId;
    const idResource = idCite?.resolvedResourceId;
    expect(fullResource).toBeDefined();
    expect(idResource).toBe(fullResource);
  });

  it('does not resolve Id. when pin cite is > 150 pages from antecedent', () => {
    const text = 'Smith v. Jones, 100 F.3d 50 (5th Cir. 1996). Id. at 500.';
    const { citations, resolution } = extractParseAndResolve(text);

    const idCite = citations.find(c => c.type === 'id');
    expect(idCite).toBeDefined();
    // Pin cite 500 is > 150 pages from page 50
    expect(idCite?.resolvedResourceId).toBeUndefined();
    expect(resolution.unresolvedCitations).toContain(idCite?.id);
  });

  it('resolves supra citation by matching party name', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Brown, supra note 5, at 490.';
    const { citations, resolution } = extractParseAndResolve(text);

    const supraCite = citations.find(c => c.type === 'supra');
    expect(supraCite).toBeDefined();
    expect(supraCite?.resolvedResourceId).toBeDefined();
    expect(resolution.unresolvedCitations).not.toContain(supraCite?.id);
  });

  it('creates resources for multiple full citations', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954); Roe v. Wade, 410 U.S. 113 (1973).';
    const { resolution } = extractParseAndResolve(text);

    expect(resolution.resources.size).toBeGreaterThanOrEqual(2);
  });

  it('does not resolve Id. when antecedent has placeholder page', () => {
    const text = 'Smith v. Jones, 585 U.S. ___ (2018). Id. at 5.';
    const { citations, resolution } = extractParseAndResolve(text);

    const idCite = citations.find(c => c.type === 'id');
    expect(idCite).toBeDefined();
    expect(idCite?.resolvedResourceId).toBeUndefined();
  });

  it('does not resolve infra citations (forward-looking)', () => {
    const text = 'see infra note 12. Brown v. Board of Education, 347 U.S. 483 (1954).';
    const { citations, resolution } = extractParseAndResolve(text);

    const infraCite = citations.find(c => c.type === 'infra');
    if (infraCite) {
      expect(infraCite.resolvedResourceId).toBeUndefined();
      expect(resolution.unresolvedCitations).not.toContain(infraCite.id);
    }
  });

  it('handles empty citation list', () => {
    const result = resolveCitations([]);
    expect(result.resources.size).toBe(0);
    expect(result.citationToResource.size).toBe(0);
    expect(result.unresolvedCitations).toEqual([]);
  });

  it('chains Id. through multiple resolutions', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Id. at 490. Id. at 492.';
    const { citations, resolution } = extractParseAndResolve(text);

    const ids = citations.filter(c => c.type === 'id');
    expect(ids.length).toBe(2);

    // Both Id. citations should resolve to Brown
    for (const idCite of ids) {
      expect(idCite.resolvedResourceId).toBeDefined();
      expect(resolution.citationToResource.get(idCite.id)).toBeDefined();
    }
  });
});
