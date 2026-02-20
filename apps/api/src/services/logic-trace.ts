/**
 * Builds detailed, user-facing logic traces for every citation type.
 * Shared across analyze, build, and spading routes to ensure consistent output.
 */
import type {
  ParsedCitation,
  ValidationIssue,
  ResolutionResult,
  CaseComponents,
  StatuteComponents,
  ConstitutionComponents,
  RegulationComponents,
  ArticleComponents,
  BookComponents,
  RestatementComponents,
  InternetComponents,
  AiSourceComponents,
  UnpublishedComponents,
  ShortFormComponents,
} from '@legalcitation/shared';
import { REPORTER_MAP, SCOTUS_REPORTERS } from '@legalcitation/shared';

/**
 * Build a comprehensive logic trace describing how a citation was analyzed.
 * Every citation type gets component-level detail, rule analysis summary,
 * and resolution trace when available.
 */
export function buildLogicTrace(
  citation: ParsedCitation,
  issues: ValidationIssue[],
  resolution?: ResolutionResult
): string[] {
  const trace: string[] = [];

  trace.push(`Identified as a ${formatTypeName(citation.type)} citation.`);

  switch (citation.type) {
    case 'case':
      traceCaseComponents(citation.components as CaseComponents, trace);
      break;
    case 'statute':
      traceStatuteComponents(citation.components as StatuteComponents, trace);
      break;
    case 'constitution':
      traceConstitutionComponents(citation.components as ConstitutionComponents, trace);
      break;
    case 'regulation':
      traceRegulationComponents(citation.components as RegulationComponents, trace);
      break;
    case 'article':
      traceArticleComponents(citation.components as ArticleComponents, trace);
      break;
    case 'book':
      traceBookComponents(citation.components as BookComponents, trace);
      break;
    case 'restatement':
      traceRestatementComponents(citation.components as RestatementComponents, trace);
      break;
    case 'internet':
      traceInternetComponents(citation.components as InternetComponents, trace);
      break;
    case 'ai_source':
      traceAiSourceComponents(citation.components as AiSourceComponents, trace);
      break;
    case 'unpublished':
      traceUnpublishedComponents(citation.components as UnpublishedComponents, trace);
      break;
    case 'id':
    case 'supra':
    case 'infra':
    case 'short_form':
      traceShortFormComponents(citation, trace);
      break;
  }

  traceResolution(citation, resolution, trace);
  traceIssueSummary(issues, trace);

  return trace;
}

function formatTypeName(type: string): string {
  const names: Record<string, string> = {
    case: 'case',
    statute: 'statute',
    constitution: 'constitutional',
    regulation: 'regulation',
    article: 'law review article',
    book: 'book/treatise',
    restatement: 'restatement',
    internet: 'internet/electronic',
    ai_source: 'AI-generated content',
    unpublished: 'unpublished source',
    id: 'Id.',
    supra: 'supra',
    infra: 'infra',
    short_form: 'short form',
  };
  return names[type] || type;
}

// ---- Per-type component traces ----

function traceCaseComponents(comp: CaseComponents, trace: string[]): void {
  const reporterEntry = REPORTER_MAP.get(comp.reporter);
  if (reporterEntry) {
    trace.push(`Reporter: ${comp.reporter} (${reporterEntry.fullName}, ${reporterEntry.court}).`);
  } else if (comp.reporter) {
    trace.push(`Reporter: ${comp.reporter}.`);
  }

  if (SCOTUS_REPORTERS.has(comp.reporter)) {
    trace.push('Court designation not required — reporter implies U.S. Supreme Court.');
  } else if (comp.court) {
    trace.push(`Court designation: ${comp.court}.`);
  } else if (comp.reporter && !SCOTUS_REPORTERS.has(comp.reporter)) {
    trace.push('Warning: no court designation detected — required for non-SCOTUS reporters (R. 10.4).');
  }

  if (comp.pinCite) {
    trace.push(`Pinpoint citation to page ${comp.pinCite}.`);
  }

  if (comp.firstPage === '') {
    trace.push('Page number is a placeholder (___) — case not yet reported in official reporter.');
  }

  if (comp.subsequentHistory) {
    trace.push(`Subsequent history detected: ${comp.subsequentHistory}.`);
  }

  if (comp.parentheticals && comp.parentheticals.length > 0) {
    trace.push(`${comp.parentheticals.length} parenthetical${comp.parentheticals.length > 1 ? 's' : ''} detected.`);
  }

  if (comp.database) {
    trace.push(`Electronic database citation: ${comp.database}.`);
  }
}

function traceStatuteComponents(comp: StatuteComponents, trace: string[]): void {
  trace.push(`Title ${comp.title}, ${comp.code} § ${comp.section}.`);
  if (comp.year) {
    trace.push(`Year: ${comp.year}.`);
  }
  if (comp.supplement) {
    trace.push(`Supplement: ${comp.supplement}.`);
  }
}

function traceConstitutionComponents(comp: ConstitutionComponents, trace: string[]): void {
  const parts: string[] = [comp.jurisdiction];
  if (comp.article) parts.push(`art. ${comp.article}`);
  if (comp.amendment) parts.push(`amend. ${comp.amendment}`);
  if (comp.section) parts.push(`§ ${comp.section}`);
  if (comp.clause) parts.push(`cl. ${comp.clause}`);
  trace.push(`Provision: ${parts.join(', ')}.`);
}

function traceRegulationComponents(comp: RegulationComponents, trace: string[]): void {
  trace.push(`Title ${comp.title}, ${comp.source} § ${comp.section}.`);
  if (comp.year) {
    trace.push(`Year: ${comp.year}.`);
  }
}

function traceArticleComponents(comp: ArticleComponents, trace: string[]): void {
  if (comp.authors.length > 0) {
    trace.push(`Author${comp.authors.length > 1 ? 's' : ''}: ${comp.authors.join(', ')}.`);
  }
  if (comp.journal) {
    trace.push(`Journal: ${comp.volume} ${comp.journal} ${comp.firstPage} (${comp.year}).`);
  }
  if (comp.studentDesignator) {
    trace.push(`Student-written piece: ${comp.studentDesignator}.`);
  }
  if (comp.forthcoming) {
    trace.push('Article is forthcoming — not yet published.');
  }
}

function traceBookComponents(comp: BookComponents, trace: string[]): void {
  if (comp.authors.length > 0) {
    trace.push(`Author${comp.authors.length > 1 ? 's' : ''}: ${comp.authors.join(', ')}.`);
  }
  if (comp.edition) {
    trace.push(`Edition: ${comp.edition}.`);
  }
  if (comp.publisher) {
    trace.push(`Publisher: ${comp.publisher}.`);
  }
  if (comp.editor) {
    trace.push(`Editor: ${comp.editor}.`);
  }
  trace.push(`Year: ${comp.year}.`);
}

function traceRestatementComponents(comp: RestatementComponents, trace: string[]): void {
  trace.push(`Restatement (${comp.series}) of ${comp.subject} § ${comp.section}.`);
  if (comp.organization) {
    trace.push(`Organization: ${comp.organization}.`);
  }
  trace.push(`Year: ${comp.year}.`);
}

function traceInternetComponents(comp: InternetComponents, trace: string[]): void {
  if (comp.author) {
    trace.push(`Author: ${comp.author}.`);
  }
  if (comp.websiteName) {
    trace.push(`Source: ${comp.websiteName}.`);
  }
  trace.push(`URL: ${comp.url.slice(0, 80)}${comp.url.length > 80 ? '...' : ''}`);
  if (comp.lastVisited) {
    trace.push(`Last visited: ${comp.lastVisited}.`);
  }
  if (comp.archiveUrl) {
    trace.push('Archived URL provided (R. 18.2.1(d) compliance).');
  } else {
    trace.push('No archived URL detected — R. 18.2.1(d) requires archiving internet sources.');
  }
}

function traceAiSourceComponents(comp: AiSourceComponents, trace: string[]): void {
  trace.push(`AI model: ${comp.modelName}${comp.modelVersion ? ` (${comp.modelVersion})` : ''}.`);
  trace.push(`Source subtype: ${comp.subtype}.`);
  if (comp.prompt) {
    trace.push(`Prompt provided: "${comp.prompt.slice(0, 60)}${comp.prompt.length > 60 ? '...' : ''}".`);
  }
  trace.push(`Date: ${comp.date}.`);
  if (comp.onFileWith) {
    trace.push(`On file with: ${comp.onFileWith}.`);
  } else {
    trace.push('No "on file with" information — R. 18.3 requires this for AI citations.');
  }
}

function traceUnpublishedComponents(comp: UnpublishedComponents, trace: string[]): void {
  trace.push(`Subtype: ${comp.subtype}.`);
  trace.push(`Author: ${comp.author}.`);
  if (comp.institution) {
    trace.push(`Institution: ${comp.institution}.`);
  }
  trace.push(`Date: ${comp.date}.`);
  if (comp.onFileWith) {
    trace.push(`On file with: ${comp.onFileWith}.`);
  }
}

function traceShortFormComponents(citation: ParsedCitation, trace: string[]): void {
  const comp = citation.components as ShortFormComponents;
  if (comp.pinCite) {
    trace.push(`Pinpoint: ${comp.pinCite}.`);
  }
  if (citation.type === 'supra' && comp.supraNoteNumber !== undefined) {
    trace.push(`References note ${comp.supraNoteNumber}.`);
  }
  if (citation.type === 'infra' && comp.infraNoteNumber !== undefined) {
    trace.push(`Forward reference to note ${comp.infraNoteNumber}.`);
  }
  if (comp.partyName) {
    trace.push(`Party name anchor: "${comp.partyName}".`);
  }
}

// ---- Resolution trace ----

function traceResolution(
  citation: ParsedCitation,
  resolution: ResolutionResult | undefined,
  trace: string[]
): void {
  if (!resolution) return;

  if (citation.resolvedResourceId) {
    const resource = resolution.resources.get(citation.resolvedResourceId);
    if (resource) {
      const displayName = resource.plaintiff
        ? (resource.defendant ? `${resource.plaintiff} v. ${resource.defendant}` : resource.plaintiff)
        : resource.canonicalCitation.slice(0, 60);
      const locationInfo = resource.volume && resource.reporter
        ? `, ${resource.volume} ${resource.reporter}${resource.page ? ` ${resource.page}` : ''}`
        : '';

      if (citation.type === 'id') {
        trace.push(`Resolved: "Id." refers to ${displayName}${locationInfo}.`);
      } else if (citation.type === 'supra') {
        trace.push(`Resolved: "supra" reference links to ${displayName}${locationInfo}.`);
      } else if (citation.type === 'short_form') {
        trace.push(`Resolved: short form links to ${displayName}${locationInfo}.`);
      }
    }
  } else if (['id', 'supra', 'short_form'].includes(citation.type)) {
    trace.push('Could not resolve the antecedent for this reference — the chain may be ambiguous or the pinpoint too distant.');
  }
}

// ---- Issue summary trace ----

function traceIssueSummary(issues: ValidationIssue[], trace: string[]): void {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const suggestionCount = issues.filter(i => i.severity === 'suggestion').length;

  trace.push(`Checked against ${issues.length} Bluebook and Indigo Book rules.`);

  if (errorCount > 0 || warningCount > 0) {
    const parts: string[] = [];
    if (errorCount > 0) parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    if (warningCount > 0) parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
    if (suggestionCount > 0) parts.push(`${suggestionCount} suggestion${suggestionCount !== 1 ? 's' : ''}`);
    trace.push(`Found ${parts.join(', ')}.`);
  } else if (suggestionCount > 0) {
    trace.push(`No errors — ${suggestionCount} suggestion${suggestionCount !== 1 ? 's' : ''} for improvement.`);
  } else {
    trace.push('No formatting issues found — citation format looks correct.');
  }
}
