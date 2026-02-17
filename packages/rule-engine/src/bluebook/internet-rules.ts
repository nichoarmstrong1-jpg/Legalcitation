import { v4 as uuid } from 'uuid';
import type { ValidationIssue, InternetComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 18 — Internet, Electronic, and Other Nonprint Resources.
 * Validates internet/electronic source citation formatting per the 22nd Edition.
 *
 * The 22nd Edition's biggest change: ALL online citations must include
 * a permanent archive link (perma.cc) or state "(on file with [journal])".
 */
export function validateInternet(components: InternetComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkUrl(components, issues);
  checkArchive(components, rawText, issues);
  checkDate(components, issues);
  checkTitle(components, issues);
  checkAvailableAt(rawText, issues);

  return issues;
}

function checkUrl(components: InternetComponents, issues: ValidationIssue[]): void {
  if (!components.url) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(d)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Internet citation must include a URL.',
      suggestion: 'Add the direct URL to the cited content.',
    });
    return;
  }

  // Warn if URL starts with http:// instead of https://
  if (components.url.startsWith('http://')) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(d)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'URL uses HTTP instead of HTTPS. Prefer HTTPS when available.',
      suggestion: 'Use the HTTPS version of the URL if available.',
    });
  }

  // Warn if URL looks like a homepage (no path after domain)
  const urlPath = components.url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (/^[^/]+\/?$/.test(urlPath)) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.1(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'URL appears to be a homepage rather than a link to the specific cited content.',
      suggestion: 'Use a URL that links directly to the cited material, not the site homepage.',
    });
  }
}

function checkArchive(components: InternetComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 18.2.1(d) — 22nd Edition: archival requirement is MANDATORY
  const hasArchive = !!components.archiveUrl;
  const hasOnFileWith = rawText ? /\(on file with\s+[^)]+\)/i.test(rawText) : false;

  if (!hasArchive && !hasOnFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.1(d)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Online sources must include a permanent archive link (e.g., https://perma.cc/XXXX-XXXX) or state "(on file with [your journal])" per R. 18.2.1(d). This is required by the 22nd Edition for ALL online citations.',
      suggestion: 'Add a perma.cc archive URL in brackets after the main URL, or add "(on file with [journal name])".',
    });
  }

  // Validate archive URL format if present
  if (components.archiveUrl) {
    if (!/^https?:\/\/(?:perma\.cc|web\.archive\.org)\//.test(components.archiveUrl)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.1(d)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Archive URL should typically be from perma.cc or web.archive.org.',
        suggestion: 'Use https://perma.cc/ to create a permanent archive of the cited page.',
      });
    }

    // Archive URL should be in brackets
    if (rawText && !rawText.includes(`[${components.archiveUrl}]`) && !rawText.includes(`[${components.archiveUrl}`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.1(d)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Archive URL should be enclosed in brackets.',
        suggestion: `Format as: [${components.archiveUrl}].`,
      });
    }
  }
}

function checkDate(components: InternetComponents, issues: ValidationIssue[]): void {
  const hasDate = !!components.date;
  const hasLastVisited = !!components.lastVisited;

  if (!hasDate && !hasLastVisited) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Internet citation should include either a publication date or a "last visited" date.',
      suggestion: 'Add a publication date (e.g., "Jan. 15, 2024") or "(last visited Feb. 10, 2024)".',
    });
  }
}

function checkTitle(components: InternetComponents, issues: ValidationIssue[]): void {
  if (!components.title || components.title.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Internet citation must include a title.',
      suggestion: 'Add the page or article title.',
    });
  }
}

function checkAvailableAt(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // "available at" is ONLY permitted when there is a parallel print citation
  if (/\bavailable at\b/i.test(rawText)) {
    // Check if there's a parallel print citation before "available at"
    const beforeAvailable = rawText.split(/\bavailable at\b/i)[0];
    const hasParallelCitation = /\d+\s+[A-Z]/.test(beforeAvailable || '');

    if (!hasParallelCitation) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.1(b)',
        source: 'Bluebook',
        severity: 'error',
        message: '"Available at" may only be used when a parallel print citation exists. For direct online sources, cite the URL without "available at".',
        suggestion: 'Remove "available at" and cite the URL directly, or add the parallel print citation before "available at".',
      });
    }
  }
}
