export interface UrlResolverResult {
  source: string;
  identifier: string;
  metadata: Record<string, string>;
  accessible: boolean;
  resolveTimeMs: number;
}

export interface SourceIdentification {
  source: string;
  identifier: string;
}

interface ResolverConfig {
  source: string;
  pattern: RegExp;
  resolve: (matches: RegExpMatchArray, url: string) => Promise<Record<string, string>>;
  timeoutMs: number;
}

const RESOLVERS: ResolverConfig[] = [
  {
    source: 'courtlistener',
    pattern: /courtlistener\.com\/opinion\/(\d+)\//,
    timeoutMs: 3000,
    resolve: async (matches) => {
      const id = matches[1];
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch(
          `https://www.courtlistener.com/api/rest/v4/opinions/${id}/`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`CourtListener API ${res.status}`);
        const data = await res.json();
        return {
          case_name: String(data.case_name ?? ''),
          date_filed: String(data.date_filed ?? ''),
          court: String(data.court ?? ''),
          citation: String(data.citation ?? ''),
        };
      } finally {
        clearTimeout(timer);
      }
    },
  },
  {
    source: 'google_scholar',
    pattern: /scholar\.google\.com\/scholar_case\?case=(\d+)/,
    timeoutMs: 5000,
    resolve: async (_matches, url) => {
      return extractMetaTags(url, 5000);
    },
  },
  {
    source: 'congress_gov',
    pattern: /congress\.gov\/bill\/(\d+).*?\/([a-z]+)\/(\d+)/,
    timeoutMs: 3000,
    resolve: async (matches) => {
      const [, congress, type, num] = matches;
      const apiKey = process.env.CONGRESS_API_KEY;
      if (!apiKey) throw new Error('CONGRESS_API_KEY not configured');

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch(
          `https://api.congress.gov/v3/bill/${congress}/${type}/${num}`,
          {
            headers: { 'X-Api-Key': apiKey },
            signal: controller.signal,
          },
        );
        if (!res.ok) throw new Error(`Congress.gov API ${res.status}`);
        const data = await res.json();
        const bill = data.bill ?? data;
        return {
          title: String(bill.title ?? ''),
          congress: String(bill.congress ?? congress),
          type: String(bill.type ?? type),
          number: String(bill.number ?? num),
          origin_chamber: String(bill.originChamber ?? ''),
          latest_action: String(bill.latestAction?.text ?? ''),
          introduced_date: String(bill.introducedDate ?? ''),
        };
      } finally {
        clearTimeout(timer);
      }
    },
  },
  {
    source: 'doi',
    pattern: /doi\.org\/(10\.\d{4,}\/\S+)/,
    timeoutMs: 3000,
    resolve: async (matches) => {
      const doi = matches[1];
      return resolveCrossRef(doi, 3000);
    },
  },
  {
    source: 'ssrn',
    pattern: /ssrn\.com\/abstract=(\d+)/,
    timeoutMs: 5000,
    resolve: async (matches, url) => {
      const id = matches[1];
      try {
        return await resolveCrossRef(`10.2139/ssrn.${id}`, 3000);
      } catch {
        return extractMetaTags(url, 5000);
      }
    },
  },
];

async function resolveCrossRef(doi: string, timeoutMs: number): Promise<Record<string, string>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`CrossRef API ${res.status}`);
    const data = await res.json();
    const msg = data.message;
    const authors = (msg.author as Array<{ given?: string; family?: string }> | undefined)
      ?.map((a) => `${a.given ?? ''} ${a.family ?? ''}`.trim())
      .join(', ');
    const year = (msg.published?.['date-parts'] as number[][] | undefined)?.[0]?.[0];
    return {
      title: String((msg.title as string[] | undefined)?.[0] ?? ''),
      author: authors ?? '',
      journal: String((msg['container-title'] as string[] | undefined)?.[0] ?? ''),
      volume: String(msg.volume ?? ''),
      page: String(msg.page ?? ''),
      year: String(year ?? ''),
      doi,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function extractMetaTags(url: string, timeoutMs: number): Promise<Record<string, string>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headRes = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!headRes.ok) throw new Error(`HEAD ${headRes.status}`);

    const getRes = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!getRes.ok) throw new Error(`GET ${getRes.status}`);

    const html = await getRes.text();
    return parseMetaTags(html);
  } finally {
    clearTimeout(timer);
  }
}

function parseMetaTags(html: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const metaPattern = /<meta\s+(?:[^>]*?\s+)?(?:property|name)=["']([^"']+)["']\s+content=["']([^"']*?)["'][^>]*\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaPattern.exec(html)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2];
    if (!value) continue;

    switch (key) {
      case 'og:title':
        metadata.title ??= value;
        break;
      case 'og:description':
        metadata.description ??= value;
        break;
      case 'article:author':
        metadata.author ??= value;
        break;
      case 'article:published_time':
        metadata.published_date ??= value;
        break;
      case 'citation_title':
        metadata.title = value;
        break;
      case 'citation_author':
        if (metadata.author) {
          metadata.author += ', ' + value;
        } else {
          metadata.author = value;
        }
        break;
      case 'citation_date':
      case 'citation_publication_date':
        metadata.published_date = value;
        break;
      case 'citation_journal_title':
        metadata.journal ??= value;
        break;
      case 'citation_volume':
        metadata.volume ??= value;
        break;
      case 'citation_firstpage':
        metadata.page ??= value;
        break;
      case 'citation_doi':
        metadata.doi ??= value;
        break;
    }
  }

  if (!metadata.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
  }

  return metadata;
}

export function identifySource(url: string): SourceIdentification | null {
  for (const resolver of RESOLVERS) {
    const match = url.match(resolver.pattern);
    if (match) {
      return { source: resolver.source, identifier: match[1] };
    }
  }
  return null;
}

export async function resolveUrl(url: string): Promise<UrlResolverResult> {
  const start = performance.now();

  for (const resolver of RESOLVERS) {
    const match = url.match(resolver.pattern);
    if (!match) continue;

    try {
      const metadata = await resolver.resolve(match, url);
      const elapsed = performance.now() - start;
      console.log(`[url-resolver] ${resolver.source} resolved in ${elapsed.toFixed(0)}ms`);
      return {
        source: resolver.source,
        identifier: match[1],
        metadata,
        accessible: true,
        resolveTimeMs: Math.round(elapsed),
      };
    } catch (err) {
      console.warn(`[url-resolver] ${resolver.source} failed, falling through to generic:`, err);
    }
  }

  // Generic fallback
  try {
    const metadata = await extractMetaTags(url, 8000);
    const elapsed = performance.now() - start;
    console.log(`[url-resolver] generic resolved in ${elapsed.toFixed(0)}ms`);
    return {
      source: 'generic',
      identifier: url,
      metadata,
      accessible: true,
      resolveTimeMs: Math.round(elapsed),
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    console.warn('[url-resolver] generic fallback failed:', err);
    return {
      source: 'generic',
      identifier: url,
      metadata: {},
      accessible: false,
      resolveTimeMs: Math.round(elapsed),
    };
  }
}
