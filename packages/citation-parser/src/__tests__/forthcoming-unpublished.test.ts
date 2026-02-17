import { describe, it, expect } from 'vitest';
import { extractAndParseCitations } from '../index.js';
import type { ArticleComponents, UnpublishedComponents } from '@legalcitation/shared';

describe('Forthcoming article citation detection and parsing', () => {
  it('parses a forthcoming article citation', () => {
    const results = extractAndParseCitations(
      'Eduardo Peñalver, Land Virtues, 94 Corn. L. Rev. (forthcoming May 2009).'
    );
    const articleResults = results.filter(r => r.type === 'article');
    expect(articleResults.length).toBeGreaterThanOrEqual(1);
    const comp = articleResults[0].components as ArticleComponents;
    expect(comp.forthcoming).toBe(true);
    expect(comp.forthcomingYear).toContain('2009');
  });

  it('parses a forthcoming article without volume', () => {
    const results = extractAndParseCitations(
      'Jane Doe, The Future of AI Law, Stan. L. Rev. (forthcoming 2026).'
    );
    const articleResults = results.filter(r => r.type === 'article');
    expect(articleResults.length).toBeGreaterThanOrEqual(1);
    const comp = articleResults[0].components as ArticleComponents;
    expect(comp.forthcoming).toBe(true);
  });
});

describe('Unpublished manuscript citation detection and parsing', () => {
  it('parses an unpublished manuscript citation', () => {
    const results = extractAndParseCitations(
      'Jennifer Arlen, Public Versus Private Enforcement of Securities Fraud 12–19 (June 22, 2007) (unpublished manuscript) (on file with the Columbia Law Review).'
    );
    const unpubResults = results.filter(r => r.type === 'unpublished');
    expect(unpubResults.length).toBeGreaterThanOrEqual(1);
    const comp = unpubResults[0].components as UnpublishedComponents;
    expect(comp.subtype).toBe('manuscript');
    expect(comp.onFileWith).toBeTruthy();
  });

  it('parses a working paper citation', () => {
    const results = extractAndParseCitations(
      'Alan J. Auerbach & Laurence J. Kotlikoff, National Savings 24–33 (Nat\'l Bureau of Econ. Rsch., Working Paper No. 729, 1981).'
    );
    const unpubResults = results.filter(r => r.type === 'unpublished');
    expect(unpubResults.length).toBeGreaterThanOrEqual(1);
    const comp = unpubResults[0].components as UnpublishedComponents;
    expect(comp.subtype).toBe('working_paper');
    expect(comp.workingPaperNumber).toContain('729');
  });

  it('parses a dissertation citation', () => {
    const results = extractAndParseCitations(
      'David M. Golove, The New Confederalism 22 (2003) (Ph.D. dissertation, Yale University) (on file with the Yale Law Journal).'
    );
    const unpubResults = results.filter(r => r.type === 'unpublished');
    expect(unpubResults.length).toBeGreaterThanOrEqual(1);
    const comp = unpubResults[0].components as UnpublishedComponents;
    expect(comp.subtype).toBe('dissertation');
  });
});
