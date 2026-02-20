/**
 * SpanMapper — translates character positions between cleaned text and
 * original source text. Works with the SpanMapping produced by cleanText().
 *
 * Inspired by eyecite's SpanUpdater using fast_diff_match_patch.
 */
import type { SpanMapping } from './cleaners.js';

export class SpanMapper {
  private readonly offsets: number[];
  private readonly originalLength: number;
  private readonly cleanedLength: number;

  constructor(spanMap: SpanMapping) {
    this.offsets = spanMap.offsets;
    this.originalLength = spanMap.originalLength;
    this.cleanedLength = spanMap.cleanedLength;
  }

  /**
   * Translate a span from cleaned-text coordinates to original-text coordinates.
   */
  toOriginal(cleanedStart: number, cleanedEnd: number): { start: number; end: number } {
    const start = cleanedStart < this.offsets.length
      ? this.offsets[cleanedStart]
      : this.originalLength;
    const end = cleanedEnd > 0 && cleanedEnd <= this.offsets.length
      ? this.offsets[cleanedEnd - 1] + 1
      : this.originalLength;
    return { start, end };
  }

  /**
   * Translate a span from original-text coordinates to cleaned-text coordinates.
   * Uses binary search for efficiency.
   */
  toCleaned(originalStart: number, originalEnd: number): { start: number; end: number } {
    let cleanedStart = this.cleanedLength;
    let cleanedEnd = 0;

    // Find the first cleaned index whose original offset >= originalStart
    for (let i = 0; i < this.offsets.length; i++) {
      if (this.offsets[i] >= originalStart) {
        cleanedStart = i;
        break;
      }
    }

    // Find the last cleaned index whose original offset < originalEnd
    for (let i = this.offsets.length - 1; i >= 0; i--) {
      if (this.offsets[i] < originalEnd) {
        cleanedEnd = i + 1;
        break;
      }
    }

    return { start: cleanedStart, end: cleanedEnd };
  }

  /**
   * Create an identity mapper (no cleaning was applied).
   */
  static identity(length: number): SpanMapper {
    return new SpanMapper({
      originalLength: length,
      cleanedLength: length,
      offsets: Array.from({ length }, (_, i) => i),
    });
  }
}
