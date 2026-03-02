/**
 * Citation Type Registry — all 18 Bluebook citation types,
 * blocked domain list, and category metadata.
 */

import type { CitationTypeId } from '../types/citation.js';

export type CitationCategoryId = 'primary' | 'secondary' | 'online' | 'court_docs' | 'international';

export interface CitationTypeConfig {
  id: CitationTypeId;
  label: string;
  icon: string;
  bluebookRule: string;
  description: string;
  examples: string[];
  categoryId: CitationCategoryId;
  placeholder: string;
  pasteHint: string;
  requiredFields: string[];
  optionalFields: string[];
  popular: boolean;
  parserSupported: boolean;
  rulesSupported: boolean;
}

export interface CitationCategory {
  id: CitationCategoryId;
  label: string;
  description: string;
}

export interface BlockedDomainInfo {
  domain: string;
  label: string;
  suggestion: string;
}

// ─── Blocked Domains ─────────────────────────────────────────────

export const BLOCKED_DOMAINS: BlockedDomainInfo[] = [
  { domain: 'westlaw.com', label: 'Westlaw', suggestion: 'Copy the case header text and paste it directly into the search bar above' },
  { domain: 'next.westlaw.com', label: 'Westlaw', suggestion: 'Copy the case header text and paste it directly into the search bar above' },
  { domain: 'lexisnexis.com', label: 'LexisNexis', suggestion: 'Copy the case text and paste it directly into the search bar above' },
  { domain: 'lexis.com', label: 'LexisNexis', suggestion: 'Copy the case text and paste it directly into the search bar above' },
  { domain: 'advance.lexis.com', label: 'LexisNexis', suggestion: 'Copy the case text and paste it directly into the search bar above' },
  { domain: 'heinonline.org', label: 'HeinOnline', suggestion: 'Copy the article text and paste it directly into the search bar above' },
  { domain: 'bloomberglaw.com', label: 'Bloomberg Law', suggestion: 'Copy the document text and paste it directly into the search bar above' },
  { domain: 'casetext.com', label: 'Casetext', suggestion: 'Copy the case text and paste it directly into the search bar above' },
  { domain: 'fastcase.com', label: 'Fastcase', suggestion: 'Copy the case text and paste it directly into the search bar above' },
  { domain: 'vlex.com', label: 'vLex', suggestion: 'Copy the document text and paste it directly into the search bar above' },
  { domain: 'jstor.org', label: 'JSTOR', suggestion: 'Copy the article abstract/text and paste it directly into the search bar above' },
];

export function checkBlockedDomain(url: string): BlockedDomainInfo | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return BLOCKED_DOMAINS.find(b => hostname === b.domain || hostname.endsWith('.' + b.domain)) ?? null;
  } catch {
    return null;
  }
}

// ─── Citation Types (all 18 Bluebook types) ──────────────────────

export const CITATION_TYPES: CitationTypeConfig[] = [
  // ── Primary Sources ──
  {
    id: 'case',
    label: 'Case',
    icon: 'Scale',
    categoryId: 'primary',
    bluebookRule: 'R. 10',
    description: 'Federal & state court opinions',
    placeholder: 'Search by case name, topic, or paste full case text from Westlaw/Lexis...',
    pasteHint: 'Paste the full case header — party names, citation, court, and date. We\'ll extract everything.',
    examples: ['Brown v. Bd. of Educ., 347 U.S. 483 (1954)'],
    requiredFields: ['partyOne', 'partyTwo', 'volume', 'reporter', 'firstPage', 'year'],
    optionalFields: ['pinCite', 'court', 'parallelCitations', 'subsequentHistory'],
    popular: true,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'statute',
    label: 'Statute',
    icon: 'ScrollText',
    categoryId: 'primary',
    bluebookRule: 'R. 12',
    description: 'Federal & state statutory codes',
    placeholder: 'Search by statute name, code section, or paste statute text...',
    pasteHint: 'Paste the statute text including the code name, title number, and section number.',
    examples: ['42 U.S.C. § 1983 (2018)'],
    requiredFields: ['title', 'code', 'section'],
    optionalFields: ['year', 'supplement', 'subsection'],
    popular: true,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'constitution',
    label: 'Constitution',
    icon: 'Landmark',
    categoryId: 'primary',
    bluebookRule: 'R. 11',
    description: 'U.S. & state constitutions',
    placeholder: 'Enter the article, amendment, and section...',
    pasteHint: 'Enter the jurisdiction, article or amendment number, and section.',
    examples: ['U.S. Const. amend. XIV, § 1'],
    requiredFields: ['jurisdiction', 'article_or_amendment', 'section'],
    optionalFields: ['clause'],
    popular: false,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'regulation',
    label: 'Regulation',
    icon: 'ClipboardList',
    categoryId: 'primary',
    bluebookRule: 'R. 14',
    description: 'C.F.R., Federal Register, executive orders',
    placeholder: 'Search by regulation number, agency, or paste regulation text...',
    pasteHint: 'Paste the regulation header or text including the title, C.F.R. section, and date.',
    examples: ['40 C.F.R. § 60.1 (2023)'],
    requiredFields: ['title', 'source', 'section'],
    optionalFields: ['year', 'subsection'],
    popular: true,
    parserSupported: true,
    rulesSupported: true,
  },

  // ── Secondary Sources ──
  {
    id: 'journal_article',
    label: 'Journal / Law Review',
    icon: 'Newspaper',
    categoryId: 'secondary',
    bluebookRule: 'R. 16',
    description: 'Law review articles, journal essays, comments, notes',
    placeholder: 'Search by article title, author, or paste from HeinOnline/SSRN...',
    pasteHint: 'Paste the article\'s title, author, journal name, volume, page numbers, and year. Or paste the abstract page from SSRN or HeinOnline.',
    examples: ['John Smith, The Future of Privacy, 120 Colum. L. Rev. 345 (2024).'],
    requiredFields: ['author', 'title', 'volume', 'journal', 'firstPage', 'year'],
    optionalFields: ['lastPage', 'doi', 'url'],
    popular: true,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'book',
    label: 'Book / Treatise',
    icon: 'BookOpen',
    categoryId: 'secondary',
    bluebookRule: 'R. 15',
    description: 'Monographs, treatises, and bound volumes',
    placeholder: 'Search by book title, author, or paste from a library catalog...',
    pasteHint: 'Paste the book\'s title page info: author, title, edition, publisher, year.',
    examples: ['1 Laurence H. Tribe, American Constitutional Law § 16-7 (3d ed. 2000).'],
    requiredFields: ['author', 'title', 'pageOrSection', 'edition', 'year'],
    optionalFields: ['volume', 'publisher', 'editor', 'translator'],
    popular: true,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'report',
    label: 'Report / Institutional',
    icon: 'BarChart3',
    categoryId: 'secondary',
    bluebookRule: 'R. 14.2',
    description: 'Government reports, institutional publications',
    placeholder: 'Search by report title, agency, or paste report header...',
    pasteHint: 'Paste the report cover page or header with the issuing body, report number, title, and date.',
    examples: ['U.S. Gov\'t Accountability Off., GAO-24-106, Report Title (2024).'],
    requiredFields: ['author', 'title', 'reportNumber', 'year'],
    optionalFields: ['url', 'publisher'],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },
  {
    id: 'restatement',
    label: 'Restatement',
    icon: 'FileText',
    categoryId: 'secondary',
    bluebookRule: 'R. 12.9.5',
    description: 'ALI Restatements of the Law',
    placeholder: 'Enter the restatement series, subject, and section...',
    pasteHint: 'Paste the restatement section header including the series (Second, Third), subject area, and section number.',
    examples: ['Restatement (Third) of Torts: Liab. for Physical & Emotional Harm § 7 (Am. L. Inst. 2010).'],
    requiredFields: ['series', 'subject', 'section', 'year'],
    optionalFields: ['comment', 'illustration'],
    popular: false,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'legislative',
    label: 'Legislative Materials',
    icon: 'Building2',
    categoryId: 'secondary',
    bluebookRule: 'R. 13',
    description: 'Bills, hearings, committee reports, floor debates',
    placeholder: 'Search by bill number, hearing title, or paste from congress.gov...',
    pasteHint: 'Paste the legislative document header or text from congress.gov, including document type, number, congress, and date.',
    examples: ['S. Rep. No. 94-455, at 12 (1975).'],
    requiredFields: ['documentType', 'congress', 'year'],
    optionalFields: ['page', 'title'],
    popular: false,
    parserSupported: false,
    rulesSupported: true,
  },

  // ── Online & Other Sources ──
  {
    id: 'website',
    label: 'Website / Blog',
    icon: 'Globe',
    categoryId: 'online',
    bluebookRule: 'R. 18.2.2',
    description: 'Web pages, blog posts, online-only content',
    placeholder: 'Paste the URL or search by page title...',
    pasteHint: 'Paste the webpage content including the title, author, site name, and publication date.',
    examples: ['Jane Doe, Post Title, Blog Name (Jan. 1, 2024), https://example.com.'],
    requiredFields: ['author', 'title', 'websiteName', 'date', 'url'],
    optionalFields: ['lastVisited', 'archiveUrl'],
    popular: true,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'newspaper',
    label: 'Newspaper Article',
    icon: 'FileWarning',
    categoryId: 'online',
    bluebookRule: 'R. 16.6',
    description: 'Print and online newspaper reporting',
    placeholder: 'Paste the URL, search by headline, or paste article text...',
    pasteHint: 'Paste the article text or headline including the author, newspaper name, and date.',
    examples: ['Adam Liptak, Title, N.Y. Times, Jan. 1, 2024, at A1.'],
    requiredFields: ['author', 'title', 'newspaper', 'date'],
    optionalFields: ['page', 'url'],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },
  {
    id: 'unpublished',
    label: 'Unpublished / Working Paper',
    icon: 'PenLine',
    categoryId: 'online',
    bluebookRule: 'R. 17',
    description: 'Working papers, dissertations, manuscripts',
    placeholder: 'Paste SSRN link, search by title, or paste abstract page...',
    pasteHint: 'Paste the working paper cover page or abstract page with author, title, paper number, and institution.',
    examples: ['John Doe, Title (Working Paper No. 123, 2024).'],
    requiredFields: ['author', 'title', 'year'],
    optionalFields: ['institution', 'paperNumber', 'url'],
    popular: false,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'ai_source',
    label: 'AI-Generated Content',
    icon: 'Bot',
    categoryId: 'online',
    bluebookRule: 'R. 18.8',
    description: 'ChatGPT, Claude, Gemini outputs',
    placeholder: 'Enter the AI model, prompt description, and date...',
    pasteHint: 'Paste the AI\'s response along with the model name and your prompt description.',
    examples: ['ChatGPT, Response to prompt (Mar. 1, 2024) (on file with author).'],
    requiredFields: ['model', 'promptDescription', 'date'],
    optionalFields: ['version', 'onFileWith'],
    popular: false,
    parserSupported: true,
    rulesSupported: true,
  },
  {
    id: 'social_media',
    label: 'Social Media',
    icon: 'MessageCircle',
    categoryId: 'online',
    bluebookRule: 'R. 18.2.4',
    description: 'Twitter/X, Reddit, forum posts',
    placeholder: 'Paste the post URL or search by author/content...',
    pasteHint: 'Paste the post content including the author/handle, platform, date, and URL.',
    examples: ['@username, Twitter (Jan. 1, 2024, 10:00 AM), https://twitter.com/...'],
    requiredFields: ['author', 'platform', 'date', 'url'],
    optionalFields: ['time', 'content'],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },
  {
    id: 'audio_video',
    label: 'Audio / Video',
    icon: 'Film',
    categoryId: 'online',
    bluebookRule: 'R. 18.7',
    description: 'Podcasts, recordings, documentaries',
    placeholder: 'Paste the URL or search by title, show, or episode...',
    pasteHint: 'Paste the video/podcast description including the title, network/platform, and air date.',
    examples: ['Title (Network television broadcast Jan. 1, 2024).'],
    requiredFields: ['title', 'medium', 'date'],
    optionalFields: ['author', 'publisher', 'url'],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },

  // ── Court Documents ──
  {
    id: 'brief',
    label: 'Brief / Court Filing',
    icon: 'FolderOpen',
    categoryId: 'court_docs',
    bluebookRule: 'R. 10.8.3',
    description: 'Briefs, motions, petitions, complaints',
    placeholder: 'Paste brief caption or filing header text...',
    pasteHint: 'Paste the brief\'s cover page or caption including the document type, case name, docket number, court, and filing date.',
    examples: ['Brief for Petitioner at 12, Case Name, No. 22-123 (S. Ct. filed Jan. 1, 2024).'],
    requiredFields: ['documentType', 'page', 'caseName', 'docketNumber', 'court', 'date'],
    optionalFields: ['author', 'url'],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },
  {
    id: 'record',
    label: 'Record / Transcript',
    icon: 'Mic',
    categoryId: 'court_docs',
    bluebookRule: 'R. 10.8.3',
    description: 'Trial transcripts, appendices, record excerpts',
    placeholder: 'Paste transcript header or record page info...',
    pasteHint: 'Paste the transcript header with the document type, case name, docket number, and court.',
    examples: ['Trial Tr. at 45, Case Name, No. 22-123 (D. Ct. Jan. 1, 2024).'],
    requiredFields: ['documentType', 'page', 'caseName', 'docketNumber', 'court', 'date'],
    optionalFields: [],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },

  // ── International ──
  {
    id: 'treaty',
    label: "Treaty / Int'l Agreement",
    icon: 'Earth',
    categoryId: 'international',
    bluebookRule: 'R. 21',
    description: 'Treaties, conventions, international agreements',
    placeholder: 'Search by treaty name or paste treaty text...',
    pasteHint: 'Paste the treaty text header including the treaty name, date signed, and source.',
    examples: ['Convention on the Rights of the Child, Nov. 20, 1989, 1577 U.N.T.S. 3.'],
    requiredFields: ['name', 'date', 'source'],
    optionalFields: ['parties', 'url'],
    popular: false,
    parserSupported: false,
    rulesSupported: false,
  },
];

// ─── Derived Exports ─────────────────────────────────────────────

export const POPULAR_TYPES: CitationTypeConfig[] = CITATION_TYPES.filter(t => t.popular);

export const CATEGORIES: CitationCategory[] = [
  { id: 'primary', label: 'Primary Sources', description: 'Court opinions, statutes, constitutions, and regulations' },
  { id: 'secondary', label: 'Secondary Sources', description: 'Law reviews, books, reports, restatements, and legislative materials' },
  { id: 'online', label: 'Online & Other Sources', description: 'Websites, newspapers, working papers, AI content, social media, and audio/video' },
  { id: 'court_docs', label: 'Court Documents', description: 'Briefs, motions, transcripts, and record excerpts' },
  { id: 'international', label: 'International & Foreign', description: 'Treaties, conventions, and international agreements' },
];
