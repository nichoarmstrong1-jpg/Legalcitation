import { describe, it, expect } from 'vitest';
import { extractAndParseCitations } from '../index.js';
import type { InternetComponents } from '@legalcitation/shared';

describe('Internet citation detection and parsing', () => {
  it('parses a blog post with archive URL', () => {
    const results = extractAndParseCitations(
      'Randy E. Barnett, What the Declaration of Independence Said and Meant, Reason: Volokh Conspiracy (July 4, 2024), https://reason.com/volokh/2024/07/04/ [https://perma.cc/C32D-SH5C].'
    );
    const netResults = results.filter(r => r.type === 'internet');
    expect(netResults.length).toBeGreaterThanOrEqual(1);
    const comp = netResults[0].components as InternetComponents;
    expect(comp.url).toContain('reason.com');
    expect(comp.archiveUrl).toContain('perma.cc');
  });

  it('parses an undated website with last visited', () => {
    const results = extractAndParseCitations(
      'Ben & Jerry\'s, https://www.benjerry.com [https://perma.cc/A3QG-UT8G] (last visited July 21, 2024).'
    );
    const netResults = results.filter(r => r.type === 'internet');
    expect(netResults.length).toBeGreaterThanOrEqual(1);
    const comp = netResults[0].components as InternetComponents;
    expect(comp.lastVisited).toBeTruthy();
  });

  it('parses a citation with perma.cc archive URL', () => {
    const results = extractAndParseCitations(
      'About Us, EFF, https://www.eff.org/about (last visited Jan. 15, 2025) [https://perma.cc/ABCD-1234].'
    );
    const netResults = results.filter(r => r.type === 'internet');
    expect(netResults.length).toBeGreaterThanOrEqual(1);
    const comp = netResults[0].components as InternetComponents;
    expect(comp.archiveUrl).toContain('perma.cc');
  });

  it('detects internet citations with URLs in text', () => {
    const results = extractAndParseCitations(
      'For more information, see https://www.law.cornell.edu/supct/html/historics/USSC_CR_0347_0483_ZO.html [https://perma.cc/XXXX-XXXX].'
    );
    const netResults = results.filter(r => r.type === 'internet');
    expect(netResults.length).toBeGreaterThanOrEqual(1);
  });
});
