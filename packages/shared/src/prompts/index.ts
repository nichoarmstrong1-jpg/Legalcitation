import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { CitationTypeId } from '../types/citation';
import { BASE_PROMPT } from './base-prompt';

const __filename_esm = fileURLToPath(import.meta.url);
const __dirname_esm = dirname(__filename_esm);

const TYPE_RULE_MAP: Record<string, { file: string; rule: string; bRule: string; title: string }> = {
  case: { file: 'case.md', rule: 'R. 10', bRule: 'B10', title: 'Cases' },
  statute: { file: 'statute.md', rule: 'R. 12', bRule: 'B12', title: 'Statutes' },
  constitution: { file: 'constitution.md', rule: 'R. 11', bRule: 'B11', title: 'Constitutions' },
  regulation: { file: 'regulation.md', rule: 'R. 14', bRule: 'B14', title: 'Administrative & Executive Materials' },
  journal_article: { file: 'journal-article.md', rule: 'R. 16', bRule: 'B16', title: 'Periodical Materials' },
  book: { file: 'book.md', rule: 'R. 15', bRule: 'B15', title: 'Books & Nonperiodic Materials' },
  report: { file: 'report.md', rule: 'R. 14.2', bRule: 'B14', title: 'Reports' },
  restatement: { file: 'restatement.md', rule: 'R. 12.9.5', bRule: 'B12', title: 'Restatements' },
  legislative: { file: 'legislative.md', rule: 'R. 13', bRule: 'B13', title: 'Legislative Materials' },
  website: { file: 'website.md', rule: 'R. 18.2', bRule: 'B18', title: 'Internet Sources' },
  newspaper: { file: 'newspaper.md', rule: 'R. 16.6', bRule: 'B16', title: 'Newspapers' },
  unpublished: { file: 'unpublished.md', rule: 'R. 17', bRule: 'B17', title: 'Unpublished Sources' },
  ai_source: { file: 'ai-source.md', rule: 'R. 18.3', bRule: 'B18', title: 'AI-Generated Content' },
  social_media: { file: 'social-media.md', rule: 'R. 18.10', bRule: 'B18', title: 'Social Media' },
  audio_video: { file: 'audio-video.md', rule: 'R. 18.7', bRule: 'B18', title: 'Audio/Video' },
  brief: { file: 'brief.md', rule: 'R. 10.8.3', bRule: 'B17', title: 'Court Documents: Briefs' },
  record: { file: 'record.md', rule: 'R. 10.8.3', bRule: 'B17', title: 'Records & Transcripts' },
  treaty: { file: 'treaty.md', rule: 'R. 21', bRule: 'B21', title: 'International Materials' },
};

const RULES_DIR = join(__dirname_esm, '../data/bluebook-rules');

function loadRuleText(typeId: CitationTypeId): string {
  const info = TYPE_RULE_MAP[typeId];
  if (!info) return '';
  const filePath = join(RULES_DIR, info.file);
  if (!existsSync(filePath)) return '';
  const content = readFileSync(filePath, 'utf-8');
  if (content.includes('[Paste') || content.includes('[paste text]')) return '';
  return content;
}

export function buildPrompt(
  typeId: CitationTypeId,
  input: string,
  mode: 'extract' | 'format' | 'check',
  style: 'law_review' | 'court_doc' = 'court_doc'
): string {
  const info = TYPE_RULE_MAP[typeId];
  if (!info) throw new Error(`Unknown citation type: ${typeId}`);

  const ruleText = loadRuleText(typeId);
  const ruleSection = ruleText
    ? `\n\nHere is the FULL TEXT of the relevant Bluebook rules (both Bluepages and White Pages):\n\n<bluebook_rules>\n${ruleText}\n</bluebook_rules>\n\nYou must follow these rules EXACTLY. For court_doc style, prioritize the Bluepages rules. For law_review style, prioritize the White Pages rules.`
    : `\n\n(Bluebook rule text not yet loaded for ${info.bRule} + ${info.rule}. Use your training knowledge of Bluebook ${info.rule} — ${info.title}.)`;

  const styleInstruction = style === 'court_doc'
    ? 'FORMAT FOR: Court document / practitioner style (Bluepages rules take priority).'
    : 'FORMAT FOR: Law review / academic style (White Pages rules take priority).';

  const typeContext = `You are specializing in ${info.title} citations (${info.bRule} + ${info.rule}).\n${styleInstruction}${ruleSection}`;

  if (mode === 'extract') {
    return `${BASE_PROMPT}\n${typeContext}\n\nTASK: Extract citation components from the following input. Return a JSON object with the extracted fields, a "confidence" number (0-1), and a "missingFields" array.\n\nINPUT:\n${input}`;
  }

  if (mode === 'format') {
    return `${BASE_PROMPT}\n${typeContext}\n\nTASK: Format the following components into a proper Bluebook citation. Return JSON with "citation" (full string), "shortForm" (or null), "footnote" (law review variant), "courtDoc" (practitioner variant), and "corrections" (array of applied corrections with rule references).\n\nCOMPONENTS:\n${input}`;
  }

  if (mode === 'check') {
    return `${BASE_PROMPT}\n${typeContext}\n\nTASK: Check this citation for Bluebook compliance. Return a JSON array where each item has: "field", "rule" (Bluebook reference), "issue", "suggestion", and "severity" ("error" | "warning" | "suggestion").\n\nCITATION:\n${input}`;
  }

  throw new Error(`Unknown mode: ${mode}`);
}
