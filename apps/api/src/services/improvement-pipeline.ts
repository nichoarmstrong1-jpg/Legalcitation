import { sql } from 'drizzle-orm';
import { getDb, schema } from '../db/index.js';

type InsightRow = Record<string, unknown> & {
  rule_id: string;
  pattern: string;
  occurrences: number;
  negative_rate: number;
  sample_text: string;
};

/**
 * Analyze feedback + citation history to compute improvement insights.
 * Groups negative feedback by rule patterns and computes occurrence rates.
 */
export async function computeImprovementInsights(): Promise<number> {
  const db = getDb();

  // Find rules that correlate with negative feedback
  const rows = await db.execute<InsightRow>(sql`
    WITH negative_feedback AS (
      SELECT
        f.citation_text,
        f.expected_output,
        f.rating,
        ch.results
      FROM ${schema.feedback} f
      LEFT JOIN ${schema.citationHistory} ch ON f.citation_history_id = ch.id
      WHERE f.rating <= 2
        AND f.citation_text IS NOT NULL
    )
    SELECT
      'low_rated_pattern' as rule_id,
      LEFT(nf.citation_text, 200) as pattern,
      COUNT(*)::int as occurrences,
      ROUND(AVG(nf.rating)::numeric, 1)::int as negative_rate,
      LEFT(COALESCE(nf.expected_output, nf.citation_text), 500) as sample_text
    FROM negative_feedback nf
    GROUP BY LEFT(nf.citation_text, 200), LEFT(COALESCE(nf.expected_output, nf.citation_text), 500)
    HAVING COUNT(*) >= 2
    ORDER BY COUNT(*) DESC
    LIMIT 100
  `);

  let insertedCount = 0;

  for (const row of rows.rows) {
    await db.insert(schema.improvementInsights)
      .values({
        ruleId: row.rule_id,
        pattern: row.pattern,
        occurrences: row.occurrences,
        negativeFeedbackRate: row.negative_rate,
        sampleCitations: { samples: [row.sample_text] },
        status: 'new',
      })
      .onConflictDoNothing();
    insertedCount++;
  }

  return insertedCount;
}
