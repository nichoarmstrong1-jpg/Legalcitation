import { v4 as uuid } from 'uuid';
import type { ValidationIssue, SocialMediaComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 18.10 — Social Media (22nd Edition).
 *
 * Covers social media platforms (18.10.1) and communication services (18.10.2).
 *
 * Platform content subtypes:
 *   (a) Visual and audio content — "Video posted by…" / "Image posted by…"
 *   (b) Textual content — no content-type prefix
 *   (c) Profiles — no date, no post title
 *   (d) Reposts — must indicate original poster in parenthetical
 *   (e) Federated social media — full handle includes instance
 */
export function validateSocialMedia(components: SocialMediaComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkPlatform(components, issues);
  checkPosterIdentity(components, rawText, issues);
  checkArchiveOrOnFile(components, rawText, issues);

  switch (components.subtype) {
    case 'visual_audio':
      checkVisualAudioContent(components, rawText, issues);
      checkUrl(components, issues);
      checkDate(components, issues);
      break;
    case 'textual':
      checkTextualContent(components, issues);
      checkUrl(components, issues);
      checkDate(components, issues);
      break;
    case 'profile':
      checkProfile(components, issues);
      checkUrl(components, issues);
      break;
    case 'repost':
      checkRepost(components, rawText, issues);
      checkUrl(components, issues);
      checkDate(components, issues);
      break;
    case 'federated':
      checkFederated(components, rawText, issues);
      checkUrl(components, issues);
      checkDate(components, issues);
      break;
  }

  return issues;
}

function checkPlatform(components: SocialMediaComponents, issues: ValidationIssue[]): void {
  if (!components.platform) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Social media citation must include the name of the platform.',
      suggestion: 'Add the platform name (e.g., "X", "Instagram", "Reddit", "TikTok").',
    });
  }
}

function checkPosterIdentity(components: SocialMediaComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.posterName && !components.handle) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Social media citation must include the poster\'s name or handle.',
      suggestion: 'Add the poster\'s real name with handle in parentheses, or just the handle if the name is unavailable.',
    });
    return;
  }

  // R. 18.10.1: "Handles should always be cited in the format used by the underlying platform"
  if (components.handle) {
    const platformHandleFormats: Record<string, RegExp> = {
      'X': /^@/,
      'Twitter': /^@/,
      'Instagram': /^@/,
      'TikTok': /^@/,
      'Reddit': /^u\//,
      'Mastodon': /^@.*@/,
    };

    const expectedFormat = platformHandleFormats[components.platform];
    if (expectedFormat && !expectedFormat.test(components.handle)) {
      const formatHints: Record<string, string> = {
        'X': '@username',
        'Twitter': '@username',
        'Instagram': '@username',
        'TikTok': '@username',
        'Reddit': 'u/username',
        'Mastodon': '@user@instance.social',
      };
      issues.push({
        id: uuid(),
        rule: 'R. 18.10.1',
        source: 'Bluebook',
        severity: 'warning',
        message: `Handle format "${components.handle}" does not match the expected format for ${components.platform}.`,
        suggestion: `Use the platform's handle format: ${formatHints[components.platform] ?? '@username'}.`,
      });
    }
  }

  // R. 18.10.1: When name is available, handle should be in parentheses
  if (components.posterName && components.handle && rawText) {
    const handleInParens = rawText.includes(`(${components.handle})`);
    if (!handleInParens) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.10.1',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'When the poster\'s real name is known, the handle should appear in parentheses after the name.',
        suggestion: `Format as: ${components.posterName} (${components.handle}).`,
      });
    }
  }
}

function checkVisualAudioContent(components: SocialMediaComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 18.10.1(a): Must begin with content type prefix
  if (!components.contentType) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Visual or audio social media content must specify the type of content (e.g., "Video", "Image").',
      suggestion: 'Begin the citation with the content type: "Video posted by…" or "Image posted by…".',
    });
  } else if (rawText) {
    const expectedPrefix = `${components.contentType} posted by`;
    if (!rawText.startsWith(expectedPrefix)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.10.1(a)',
        source: 'Bluebook',
        severity: 'warning',
        message: `Visual/audio content citation should begin with "${expectedPrefix}".`,
        suggestion: `Start the citation with "${expectedPrefix} ${components.posterName ?? components.handle ?? '...'}".`,
      });
    }
  }

  // R. 18.10.1(a): On-file required for visual/audio content
  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Visual or audio social media content must include "(on file with [repository])" to indicate permanent storage.',
      suggestion: 'Add "(on file with the [journal name])" at the end of the citation.',
    });
  }
}

function checkTextualContent(components: SocialMediaComponents, issues: ValidationIssue[]): void {
  // R. 18.10.1(b): Textual content omits the content-type prefix
  // Title/caption is optional but encouraged for identification
  if (!components.title && !components.caption) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(b)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Textual social media content should include a title or caption if one would aid in identifying the post or establishing its relevance.',
      suggestion: 'Add the post text or a summary if it aids identification.',
    });
  }
}

function checkProfile(components: SocialMediaComponents, issues: ValidationIssue[]): void {
  // R. 18.10.1(c): Profiles omit post titles and date parentheticals
  if (components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Profile citations omit the date parenthetical.',
      suggestion: 'Remove the date from the citation when citing a profile page.',
    });
  }

  if (components.title) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Profile citations omit post titles.',
      suggestion: 'Remove the post title when citing a social media profile.',
    });
  }
}

function checkRepost(components: SocialMediaComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 18.10.1(d): Must indicate original poster in parenthetical
  if (!components.originalPoster && !components.originalHandle) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(d)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Reposted content must indicate the original poster in a parenthetical.',
      suggestion: 'Add "(reposted from [Original Poster Name], [Handle])" after the URL.',
    });
  }

  // Validate the parenthetical format in raw text
  if (rawText && (components.originalPoster || components.originalHandle)) {
    if (!/\(reposted from\b/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.10.1(d)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Repost parenthetical should use the format "(reposted from [Name], [Handle])".',
        suggestion: `Use "(reposted from ${components.originalPoster ?? ''}, ${components.originalHandle ?? ''})".`,
      });
    }
  }
}

function checkFederated(components: SocialMediaComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 18.10.1(e): Full handle must indicate the instance
  if (!components.handle) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(e)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Federated social media citation must include the full handle with instance.',
      suggestion: 'Use the full handle format (e.g., "@Gargron@mastodon.social").',
    });
  } else if (components.handle && !components.handle.includes('@', 1) && !components.fedInstance) {
    // Handle doesn't include instance and no separate instance field
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1(e)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Federated social media handle must include the instance, or the instance must be provided separately.',
      suggestion: 'Include the instance in the handle (e.g., "@user@mastodon.social") or indicate it in a parenthetical after the platform name.',
    });
  }

  // R. 18.10.1(e): If handle doesn't indicate instance, provide in parenthetical
  if (components.fedInstance && rawText) {
    const instanceParenPattern = new RegExp(`\\(${components.fedInstance.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'i');
    const platformInstancePattern = new RegExp(`${components.platform}\\s*\\(${components.fedInstance.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'i');
    if (!instanceParenPattern.test(rawText) && !platformInstancePattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.10.1(e)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'When the handle does not indicate the instance, provide the instance name in a parenthetical following the platform name.',
        suggestion: `Format as: ${components.platform} (${components.fedInstance}).`,
      });
    }
  }
}

function checkUrl(components: SocialMediaComponents, issues: ValidationIssue[]): void {
  if (!components.url) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Social media citation must include a permalink to the post.',
      suggestion: 'Add the URL to the specific post.',
    });
  }
}

function checkArchiveOrOnFile(components: SocialMediaComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  const hasArchive = !!components.archiveUrl;
  const hasOnFileWith = !!components.onFileWith;
  const hasOnFileInText = rawText ? /\(on file with\s+[^)]+\)/i.test(rawText) : false;

  // R. 18.2.1(d) applies to all online citations — archive or on-file required
  if (!hasArchive && !hasOnFileWith && !hasOnFileInText) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.1(d)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Social media citation must include a permanent archive link (e.g., perma.cc) or "(on file with [repository])".',
      suggestion: 'Add a perma.cc archive URL in brackets after the main URL, or add "(on file with [journal name])".',
    });
  }

  // Validate archive URL format
  if (components.archiveUrl) {
    if (!/^https?:\/\/(?:perma\.cc|web\.archive\.org)\//.test(components.archiveUrl)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.1(d)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Archive URL should typically be from perma.cc or web.archive.org.',
        suggestion: 'Use https://perma.cc/ to create a permanent archive.',
      });
    }
  }
}

function checkDate(components: SocialMediaComponents, issues: ValidationIssue[]): void {
  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Social media citation must include the date of the post.',
      suggestion: 'Add the date in T.12 format (e.g., "Mar. 14, 2024").',
    });
  }

  // R. 18.10.1: Time and timezone should be included "to the extent of detail possible"
  if (components.date && !components.time) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Social media citation should include the time of posting when available.',
      suggestion: 'Add the time (e.g., "at 06:59 ET").',
    });
  }

  if (components.time && !components.timezone) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.10.1',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Include the timezone when providing the time of a social media post.',
      suggestion: 'Add the timezone abbreviation (e.g., "ET", "PT", "UTC").',
    });
  }
}
