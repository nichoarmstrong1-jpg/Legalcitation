import type {
  ParsedCitation,
  CaseComponents,
  StatuteComponents,
  BookComponents,
  ArticleComponents,
  ShortFormEntry,
  ShortFormSuggestion,
  AnalyzedCitation,
} from '@legalcitation/shared';

/**
 * Generate the available short form entries for a single citation
 * based on its type and parsed components.
 */
export function generateShortForms(citation: ParsedCitation): ShortFormEntry[] {
  switch (citation.type) {
    case 'case':
      return generateCaseShortForms(citation.components as CaseComponents);
    case 'statute':
      return generateStatuteShortForms(citation.components as StatuteComponents);
    case 'book':
      return generateBookShortForms(citation.components as BookComponents);
    case 'article':
      return generateArticleShortForms(citation.components as ArticleComponents);
    case 'regulation':
      return generateRegulationShortForms();
    case 'constitution':
      return generateConstitutionShortForms();
    default:
      return [];
  }
}

function generateCaseShortForms(comp: CaseComponents): ShortFormEntry[] {
  const shortParty = comp.partyOne;
  const shortForms: ShortFormEntry[] = [
    {
      form: '*Id.*',
      type: 'id',
      label: 'Id. Citation',
      whenToUse: 'Use when citing the EXACT same source as the immediately preceding citation, with no other citations in between. The preceding citation must cite only ONE authority (no semicolons).',
      whereToPlace: `Use this immediately after the full citation of ${shortParty} appears, as long as no other source is cited between them.`,
      warnings: [
        'Never use Id. if the preceding citation contains multiple sources separated by semicolons.',
        'Id. must be italicized, including the period.',
        'Capitalize "Id." only when it begins a citation sentence.',
      ],
    },
    {
      form: '*Id.* at [pinpoint page]',
      type: 'id_pinpoint',
      label: 'Id. with Pinpoint',
      whenToUse: 'Use when citing the same source as the immediately preceding citation but referencing a DIFFERENT specific page. Replace [pinpoint page] with the actual page number.',
      whereToPlace: `Use after the full citation of ${shortParty} when you need to reference a specific page different from the one in the full citation.`,
      warnings: [
        'Use "at" before page numbers but NOT before § or ¶ symbols.',
        'Do not create a double period: "Id. at 205." is correct, not "Id.. at 205."',
      ],
    },
  ];

  if (comp.volume && comp.reporter) {
    shortForms.push({
      form: `*${shortParty}*, ${comp.volume} ${comp.reporter} at [pinpoint page]`,
      type: 'short_case',
      label: 'Short Case Form',
      whenToUse: 'Use after the full citation has been given once AND there are intervening citations to other sources (making Id. unavailable). Use only the first party name.',
      whereToPlace: `Use for any subsequent reference to this case when other citations appear between this reference and the last citation to ${shortParty}.`,
      warnings: [
        'Only use after the full citation has appeared at least once in the same document.',
        'The short form must appear within approximately 5 citations of the most recent full citation to this source.',
      ],
    });
  }

  return shortForms;
}

function generateStatuteShortForms(comp: StatuteComponents): ShortFormEntry[] {
  return [
    {
      form: '*Id.*',
      type: 'id',
      label: 'Id. Citation',
      whenToUse: 'Use when citing the EXACT same statute as the immediately preceding citation.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
      warnings: ['Id. must be italicized, including the period.'],
    },
    {
      form: `*Id.* § ${comp.section || '[section]'}`,
      type: 'id_pinpoint',
      label: 'Id. with Section',
      whenToUse: 'Use when citing the same statute but a different section.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
      warnings: ['Use § (not "at") before section numbers for statutes.'],
    },
  ];
}

function generateBookShortForms(comp: BookComponents): ShortFormEntry[] {
  const author = comp.authors?.[0] || 'Author';
  return [
    {
      form: '*Id.*',
      type: 'id',
      label: 'Id. Citation',
      whenToUse: 'Use when citing the EXACT same source as the immediately preceding citation.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
      warnings: ['Id. must be italicized, including the period.'],
    },
    {
      form: '*Id.* at [page]',
      type: 'id_pinpoint',
      label: 'Id. with Page',
      whenToUse: 'Use when citing the same source but a different page.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
    },
    {
      form: `${author}, *supra* note [N], at [page]`,
      type: 'supra',
      label: 'Supra Form',
      whenToUse: 'Use after the full citation has been given once AND there are intervening citations (making Id. unavailable).',
      whereToPlace: `Replace [N] with the footnote number where ${author} was first cited in full.`,
      warnings: ['Only use in footnotes, not in main text.'],
    },
  ];
}

function generateArticleShortForms(comp: ArticleComponents): ShortFormEntry[] {
  const author = comp.authors?.[0] || 'Author';
  return [
    {
      form: '*Id.*',
      type: 'id',
      label: 'Id. Citation',
      whenToUse: 'Use when citing the EXACT same article as the immediately preceding citation.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
      warnings: ['Id. must be italicized, including the period.'],
    },
    {
      form: '*Id.* at [page]',
      type: 'id_pinpoint',
      label: 'Id. with Page',
      whenToUse: 'Use when citing the same article but a different page.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
    },
    {
      form: `${author}, *supra* note [N], at [page]`,
      type: 'supra',
      label: 'Supra Form',
      whenToUse: 'Use after the full citation has been given once AND there are intervening citations.',
      whereToPlace: `Replace [N] with the footnote number where ${author} was first cited in full.`,
      warnings: ['Only use in footnotes, not in main text.'],
    },
  ];
}

function generateRegulationShortForms(): ShortFormEntry[] {
  return [
    {
      form: '*Id.*',
      type: 'id',
      label: 'Id. Citation',
      whenToUse: 'Use when citing the EXACT same regulation as the immediately preceding citation.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
    },
    {
      form: '*Id.* § [section]',
      type: 'id_pinpoint',
      label: 'Id. with Section',
      whenToUse: 'Use when citing the same regulation but a different section.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
      warnings: ['Use § (not "at") before section numbers for regulations.'],
    },
  ];
}

function generateConstitutionShortForms(): ShortFormEntry[] {
  return [
    {
      form: '*Id.*',
      type: 'id',
      label: 'Id. Citation',
      whenToUse: 'Use when citing the EXACT same constitutional provision as the immediately preceding citation.',
      whereToPlace: 'Use immediately after the full citation with no intervening citations.',
    },
  ];
}

/**
 * Detect duplicate case citations in the analyzed results and generate
 * natural-language suggestions for where to use short forms.
 */
export function generateShortFormSuggestions(
  results: AnalyzedCitation[],
  fullText: string
): ShortFormSuggestion[] {
  const suggestions: ShortFormSuggestion[] = [];

  const caseOccurrences = new Map<string, number[]>();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.parsed?.type !== 'case') continue;

    const comp = result.parsed.components as CaseComponents;
    const key = `${comp.partyOne}|${comp.volume}|${comp.reporter}`.toLowerCase();

    if (!caseOccurrences.has(key)) {
      caseOccurrences.set(key, []);
    }
    caseOccurrences.get(key)!.push(i);
  }

  for (const [, indices] of caseOccurrences) {
    if (indices.length < 2) continue;

    const firstIdx = indices[0];
    const firstResult = results[firstIdx];
    const firstComp = firstResult.parsed.components as CaseComponents;
    const caseName = firstComp.partyTwo
      ? `${firstComp.partyOne} v. ${firstComp.partyTwo}`
      : firstComp.partyOne;

    for (let j = 1; j < indices.length; j++) {
      const dupIdx = indices[j];
      const dupResult = results[dupIdx];
      const pos = dupResult.parsed?.position;

      let contextSnippet = '';
      if (pos) {
        const snippetStart = Math.max(0, pos.start - 80);
        const rawSnippet = fullText.slice(snippetStart, pos.start).trim();
        const lastSentence = rawSnippet.split(/[.!?]\s+/).pop() || rawSnippet;
        contextSnippet = lastSentence.slice(0, 60);
        if (lastSentence.length > 60) contextSnippet += '...';
      }

      const prevIdx = dupIdx - 1;
      const prevIsSameCase =
        prevIdx >= 0 &&
        results[prevIdx].parsed?.type === 'case' &&
        (() => {
          const prevComp = results[prevIdx].parsed.components as CaseComponents;
          return prevComp.partyOne.toLowerCase() === firstComp.partyOne.toLowerCase() &&
                 prevComp.volume === firstComp.volume;
        })();

      if (prevIsSameCase) {
        suggestions.push({
          citationIndex: dupIdx,
          suggestedForm: '*Id.*',
          reason: `This is the same case as the immediately preceding citation. Use Id. instead of repeating the full citation to ${caseName}.`,
          contextSnippet: contextSnippet
            ? `After the text "${contextSnippet}", replace the full citation with *Id.*`
            : `Replace this repeated citation to ${caseName} with *Id.*`,
        });
      } else {
        const shortForm = firstComp.volume && firstComp.reporter
          ? `*${firstComp.partyOne}*, ${firstComp.volume} ${firstComp.reporter} at [page]`
          : `*${firstComp.partyOne}*`;

        suggestions.push({
          citationIndex: dupIdx,
          suggestedForm: shortForm,
          reason: `You already cited ${caseName} in full earlier. Since other sources were cited in between, use the short case form.`,
          contextSnippet: contextSnippet
            ? `After the text "${contextSnippet}", replace the full citation with the short form: ${shortForm}`
            : `Replace this citation to ${caseName} with: ${shortForm}`,
        });
      }
    }
  }

  return suggestions;
}
