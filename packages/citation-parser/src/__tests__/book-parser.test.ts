import { describe, it, expect } from 'vitest';
import { extractAndParseCitations } from '../index.js';
import type { BookComponents } from '@legalcitation/shared';

describe('Book citation detection and parsing', () => {
  it('parses a single-author book with page', () => {
    const results = extractAndParseCitations(
      'Erwin Chemerinsky, Constitutional Law: Principles and Policies 42 (7th ed. 2023).'
    );
    const bookResults = results.filter(r => r.type === 'book');
    expect(bookResults.length).toBeGreaterThanOrEqual(1);
    const comp = bookResults[0].components as BookComponents;
    expect(comp.authors).toContain('Erwin Chemerinsky');
    expect(comp.title).toContain('Constitutional Law');
    expect(comp.page).toBe('42');
    expect(comp.edition).toContain('7th');
    expect(comp.year).toBe('2023');
  });

  it('parses a single-author book with section', () => {
    const results = extractAndParseCitations(
      'Erwin Chemerinsky, Constitutional Law § 6.4 (7th ed. 2023).'
    );
    const bookResults = results.filter(r => r.type === 'book');
    expect(bookResults.length).toBeGreaterThanOrEqual(1);
    const comp = bookResults[0].components as BookComponents;
    expect(comp.section).toBe('6.4');
  });

  it('parses a multi-volume treatise', () => {
    const results = extractAndParseCitations(
      '5 Ronald D. Rotunda & John E. Nowak, Treatise on Constitutional Law § 23.5 (5th ed. 2012).'
    );
    const bookResults = results.filter(r => r.type === 'book');
    expect(bookResults.length).toBeGreaterThanOrEqual(1);
    const comp = bookResults[0].components as BookComponents;
    expect(comp.volume).toBe('5');
    expect(comp.authors.length).toBeGreaterThanOrEqual(1);
    expect(comp.section).toBe('23.5');
  });

  it('parses a book with editor', () => {
    const results = extractAndParseCitations(
      'John Rawls, A Theory of Justice 42 (Samuel Freeman ed., 2009).'
    );
    const bookResults = results.filter(r => r.type === 'book');
    expect(bookResults.length).toBeGreaterThanOrEqual(1);
    const comp = bookResults[0].components as BookComponents;
    expect(comp.year).toBe('2009');
    expect(comp.editor).toContain('Samuel Freeman');
  });

  it('parses a two-author book joined with &', () => {
    const results = extractAndParseCitations(
      'Richard H. Fallon & Daniel J. Meltzer, Hart and Wechsler\'s The Federal Courts and the Federal System 100 (7th ed. 2015).'
    );
    const bookResults = results.filter(r => r.type === 'book');
    expect(bookResults.length).toBeGreaterThanOrEqual(1);
    const comp = bookResults[0].components as BookComponents;
    expect(comp.authors.length).toBeGreaterThanOrEqual(2);
  });
});
