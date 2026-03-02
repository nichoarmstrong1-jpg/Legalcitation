import { v4 as uuid } from 'uuid';
import type { ValidationIssue, AudioVideoComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 18.7 (Videographic Media) + R. 18.8 (Audio Recordings and Streaming).
 *
 * Video subtypes (R. 18.7):
 *   18.7.1 — Films (commercial and noncommercial)
 *   18.7.2 — Television Series
 *   18.7.3 — Live Streaming Media Services
 *   18.7.4 — Web-Based Videos
 *
 * Audio subtypes (R. 18.8):
 *   18.8.1 — Physical Media (commercial, noncommercial, episodic)
 *   18.8.2 — Audio Streaming Services
 *   18.8.3 — Unpublished Audio Recordings
 *   18.8.4 — Websites Containing Audio Recordings
 */
export function validateAudioVideo(components: AudioVideoComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkTitle(components, issues);
  checkTimestamp(components, rawText, issues);

  switch (components.subtype) {
    case 'film':
      checkFilm(components, issues);
      break;
    case 'tv_series':
      checkTvSeries(components, issues);
      break;
    case 'live_stream':
      checkLiveStream(components, issues);
      break;
    case 'web_video':
      checkWebVideo(components, issues);
      break;
    case 'physical_audio':
      checkPhysicalAudio(components, rawText, issues);
      break;
    case 'streaming_audio':
      checkStreamingAudio(components, issues);
      break;
    case 'unpublished_audio':
      checkUnpublishedAudio(components, issues);
      break;
    case 'web_audio':
      checkWebAudio(components, issues);
      break;
    case 'episodic':
      checkEpisodic(components, issues);
      break;
  }

  return issues;
}

// ── Shared Checks ──────────────────────────────────────────────────

function checkTitle(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  if (!components.title) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7',
      source: 'Bluebook',
      severity: 'error',
      message: 'Audio/video citation must include a title.',
      suggestion: 'Add the title of the work.',
    });
  }
}

function checkTimestamp(components: AudioVideoComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.timestamp) return;

  // R. 18.7.1: Timestamps use ", at XX:XX" or ", at XX:XX–XX:XX"
  const validTimestamp = /^\d{1,2}:\d{2}(:\d{2})?([–-]\d{1,2}:\d{2}(:\d{2})?)?$/;
  if (!validTimestamp.test(components.timestamp)) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.1',
      source: 'Bluebook',
      severity: 'warning',
      message: `Timestamp "${components.timestamp}" should be in the format "XX:XX" or "XX:XX–XX:XX".`,
      suggestion: 'Use the format "at 1:00:25" or "at 34:19–35:00".',
    });
  }

  // Check that ", at " prefix is used in the raw text
  if (rawText && components.timestamp) {
    const atPrefixPattern = new RegExp(`,\\s*at\\s+${components.timestamp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    if (!atPrefixPattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.7.1',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Pinpoint timestamp citations should use ", at XX:XX" format.',
        suggestion: `Use ", at ${components.timestamp}" immediately after the title.`,
      });
    }
  }
}

// ── R. 18.7.1 — Films ─────────────────────────────────────────────

function checkFilm(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.7.1: Access medium required
  if (!components.medium) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Film citation must include the access medium.',
      suggestion: 'Add the medium (e.g., "Blu-ray", "DVD", "Amazon Prime"). If no medium is available, store the film on file.',
    });
  }

  // R. 18.7.1: Producer/company and year in parenthetical
  if (!components.publisher && !components.recordingCompany) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Film citation must include the production company or individual that produced the film.',
      suggestion: 'Add the producer in a parenthetical (e.g., "(Gordon Company 1989)").',
    });
  }

  if (!components.year) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Film citation must include the year of release.',
      suggestion: 'Add the year in the parenthetical (e.g., "(Utopia 2023)").',
    });
  }

  // R. 18.7.1(b): Noncommercial films need on-file
  if (components.isCommercial === false && !components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.1(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Noncommercial film citation must include "(on file with [repository])" when no access medium is publicly available.',
      suggestion: 'Add "(on file with the [journal name])".',
    });
  }
}

// ── R. 18.7.2 — Television Series ─────────────────────────────────

function checkTvSeries(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.7.2: Medium parenthetical with date required
  if (!components.medium && !components.platform && !components.network) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Television series citation must include the access medium, platform, or network in a parenthetical.',
      suggestion: 'Add the medium (e.g., "(Netflix, accessed Nov. 7, 2024)" or "(NBC television broadcast, aired Oct. 13, 2011)").',
    });
  }

  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Television series citation must include the broadcast date, release date, or access date.',
      suggestion: 'Add the date in the medium parenthetical.',
    });
  }
}

// ── R. 18.7.3 — Live Streaming Media ──────────────────────────────

function checkLiveStream(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.7.3: On-file required for all live streams
  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Live stream citation must include "(on file with [repository])". A recording of the live stream must be stored on file.',
      suggestion: 'Save a recording and add "(on file with the [journal name])".',
    });
  }

  // R. 18.7.3: Platform required
  if (!components.platform) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Live stream citation must indicate the platform on which the video was streamed.',
      suggestion: 'Add the platform (e.g., "Fubo", "Twitch", "YouTube").',
    });
  }

  // R. 18.7.3: Date and start time
  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Live stream citation must include the original date of the stream.',
      suggestion: 'Add the date (e.g., "aired Apr. 7, 2024" or "streamed Apr. 12, 2024").',
    });
  }

  // R. 18.7.3(b): Noncommercial live streams cite account name in small caps + stream name in italics
  if (components.isCommercial === false && !components.creator) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.3(b)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Noncommercial live stream citation should include the name of the account that streamed the video.',
      suggestion: 'Add the streamer\'s account name.',
    });
  }
}

// ── R. 18.7.4 — Web-Based Videos ──────────────────────────────────

function checkWebVideo(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.7.4: Account name required
  if (!components.creator) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-based video citation must include the name of the account that posted the video.',
      suggestion: 'Add the account/channel name in small caps.',
    });
  }

  // R. 18.7.4: Platform + upload date required
  if (!components.platform) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-based video citation must indicate the platform where the video was uploaded.',
      suggestion: 'Add the platform in a parenthetical (e.g., "(YouTube, Dec. 2, 2023)").',
    });
  }

  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-based video citation must include the date and time of upload when possible.',
      suggestion: 'Add the upload date in the platform parenthetical.',
    });
  }

  // R. 18.7.4: URL required
  if (!components.url) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-based video citation should include a URL.',
      suggestion: 'Add the URL to the video.',
    });
  }

  // R. 18.7.4: On-file required per examples in rule text
  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.7.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-based video citation must include "(on file with [repository])".',
      suggestion: 'Add "(on file with the [journal name])".',
    });
  }
}

// ── R. 18.8.1 — Physical Audio Media ──────────────────────────────

function checkPhysicalAudio(components: AudioVideoComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 18.8.1(a): Medium, recording company, date
  if (!components.medium) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Physical audio citation must include the access medium.',
      suggestion: 'Add the medium (e.g., "CD", "Vinyl Record", "Cassette").',
    });
  }

  if (!components.recordingCompany && !components.publisher) {
    // R. 18.8.1(a): "independently recorded" if no company
    const hasIndependent = rawText ? /independently recorded/i.test(rawText) : false;
    if (!hasIndependent) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.8.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Physical audio citation must include the recording company or publisher. Use "independently recorded" if released independently.',
        suggestion: 'Add the recording company (e.g., "Dead Oceans") or "independently recorded".',
      });
    }
  }

  if (!components.year && !components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Physical audio citation should include the date of release if available.',
      suggestion: 'Add the release date (e.g., "Aug. 17, 2018").',
    });
  }

  // R. 18.8.1(a): Song on collection uses "on" format
  if (components.collectionTitle && rawText) {
    if (!rawText.includes(`, on ${components.collectionTitle}`) && !rawText.includes(`, on *${components.collectionTitle}`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.8.1(a)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'When citing a specific song from a collection, use "on" before the collection title.',
        suggestion: `Format as: Song Title, on ${components.collectionTitle}.`,
      });
    }
  }

  // R. 18.8.1(a): Singles use bracket notation
  if (components.isSingle && rawText && !/\[Single\]/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Standalone singles should include "[Single]" after the collection title.',
      suggestion: 'Add "[Single]" after the title (e.g., "on Can\'t Get It out of My Head [Single]").',
    });
  }

  // R. 18.8.1(b): Noncommercial recordings need on-file
  if (components.isCommercial === false && !components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Noncommercial audio recording must include "(on file with [repository])".',
      suggestion: 'Add "(on file with author)" or "(on file with the [journal name])".',
    });
  }
}

// ── R. 18.8.2 — Audio Streaming Services ──────────────────────────

function checkStreamingAudio(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.8.2: "cited to an audio streaming service only when it has not been published
  // in a physical medium, or if the version available on audio streaming services contains
  // a difference in content relevant to the citation"
  if (!components.platform && !components.medium) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Streaming audio citation must include the name of the audio streaming service.',
      suggestion: 'Add the streaming platform (e.g., "Spotify", "Apple Music", "Bandcamp").',
    });
  }

  if (!components.recordingCompany && !components.publisher) {
    // Check if independently recorded
    const isIndependent = components.title && /independently/i.test(components.title);
    if (!isIndependent) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.8.2',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Streaming audio citation should include the recording company or indicate "independently recorded".',
        suggestion: 'Add the label (e.g., "RCA Recs.") or "independently recorded".',
      });
    }
  }

  if (!components.date && !components.year) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.2',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Streaming audio citation should include the release date. If unavailable, use the date the work was last streamed.',
      suggestion: 'Add the date (e.g., "May 6, 2018") or "(last streamed [date])".',
    });
  }
}

// ── R. 18.8.3 — Unpublished Audio Recordings ─────────────────────

function checkUnpublishedAudio(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.8.3: Nature of the recording
  if (!components.title) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished audio citation must identify the nature of the recording.',
      suggestion: 'Describe the recording (e.g., "Voice Memo", "Voice Message from...").',
    });
  }

  // R. 18.8.3: Recorder identity
  if (!components.creator) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Unpublished audio citation should indicate the recorder or producer by name, title, and/or institutional affiliation when possible.',
      suggestion: 'Add the recorder\'s name and affiliation.',
    });
  }

  // R. 18.8.3: On-file required
  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished audio citation must include "(on file with [repository])".',
      suggestion: 'Add "(on file with author)" or "(on file with the [journal name])".',
    });
  }

  // R. 18.8.3: Date with "recorded" prefix
  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished audio citation must include the date of the recording.',
      suggestion: 'Add the date in a parenthetical (e.g., "(recorded Apr. 17, 2024, at 08:02 ET)").',
    });
  }
}

// ── R. 18.8.4 — Websites Containing Audio Recordings ──────────────

function checkWebAudio(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.8.4: Cite using R. 18.2.2 principles — URL required
  if (!components.url) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-embedded audio citation must include a URL per R. 18.2.2 principles.',
      suggestion: 'Add the URL to the webpage containing the audio.',
    });
  }

  // R. 18.8.4: On-file per internet source rules
  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Web-embedded audio citation must include "(on file with [repository])".',
      suggestion: 'Add "(on file with the [journal name])".',
    });
  }

  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.4',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Web-embedded audio citation should include the publication date.',
      suggestion: 'Add the date in a parenthetical.',
    });
  }
}

// ── R. 18.8.1(c) — Episodic Recordings ───────────────────────────

function checkEpisodic(components: AudioVideoComponents, issues: ValidationIssue[]): void {
  // R. 18.8.1(c): Title of the recording in small caps, episode name in italics
  if (!components.episodeTitle) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(c)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Episodic recording citation should include the episode name in italics if applicable.',
      suggestion: 'Add the episode name (e.g., "A Kind of Stopwatch").',
    });
  }

  // Medium + date required
  if (!components.medium && !components.platform) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Episodic recording citation must include the access medium or streaming platform in a parenthetical.',
      suggestion: 'Add the medium (e.g., "(CD, Aug. 26, 2002)" or "(Spotify, Jan. 15, 2024)").',
    });
  }

  if (!components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.8.1(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Episodic recording citation must include the date of release.',
      suggestion: 'Add the release date in the medium parenthetical.',
    });
  }
}
