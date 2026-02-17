/**
 * Document text extraction service.
 * Preserves italic and underline formatting using *asterisk* markers.
 * Supports PDF, DOCX, TXT, and images (via placeholder for OCR).
 */

export interface PageMapping {
  pageNumber: number;
  startOffset: number;
  endOffset: number;
  text: string;
}

export interface ExtractedDocument {
  text: string;
  pageMapping?: PageMapping[];
  pageCount?: number;
}

export interface ExtractionError {
  message: string;
  suggestion: string;
  code: 'SCANNED_PDF' | 'ENCRYPTED_PDF' | 'CORRUPTED_FILE' | 'EMPTY_EXTRACTION' | 'UNSUPPORTED_FORMAT' | 'OCR_UNAVAILABLE' | 'FILE_TOO_LARGE' | 'UNKNOWN';
}

export class DocumentExtractionError extends Error {
  public readonly suggestion: string;
  public readonly code: ExtractionError['code'];

  constructor({ message, suggestion, code }: ExtractionError) {
    super(message);
    this.name = 'DocumentExtractionError';
    this.suggestion = suggestion;
    this.code = code;
  }

  toJSON() {
    return {
      error: this.message,
      suggestion: this.suggestion,
      code: this.code,
    };
  }
}

function classifyExtractionError(error: unknown, fileName: string): DocumentExtractionError {
  const msg = error instanceof Error ? error.message.toLowerCase() : '';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (msg.includes('password') || msg.includes('encrypt') || msg.includes('protected')) {
    return new DocumentExtractionError({
      message: 'This PDF is password-protected.',
      suggestion: 'Try opening it first, then saving an unprotected copy, or paste the text directly.',
      code: 'ENCRYPTED_PDF',
    });
  }

  if (msg.includes('invalid pdf') || msg.includes('not a pdf') || msg.includes('bad pdf') || msg.includes('startxref')) {
    return new DocumentExtractionError({
      message: "We couldn't read this file. It may be corrupted or not a valid PDF.",
      suggestion: 'Try re-downloading the file from your research database, or copy and paste the text directly.',
      code: 'CORRUPTED_FILE',
    });
  }

  if (msg.includes('ocr') || msg.includes('tesseract') || msg.includes('image')) {
    return new DocumentExtractionError({
      message: 'This file appears to be an image. Text extraction from images is not yet supported.',
      suggestion: 'Try downloading a text-based version from your research database, or copy and paste the text directly.',
      code: 'OCR_UNAVAILABLE',
    });
  }

  const supportedExts = ['pdf', 'docx', 'doc', 'rtf', 'txt', 'csv', 'tsv', 'html', 'htm', 'text', 'log'];
  if (!supportedExts.includes(ext)) {
    return new DocumentExtractionError({
      message: `The file format ".${ext}" isn't supported yet.`,
      suggestion: 'We accept PDF, DOCX, DOC, RTF, and TXT files. You can also paste text directly.',
      code: 'UNSUPPORTED_FORMAT',
    });
  }

  return new DocumentExtractionError({
    message: "We couldn't process this file.",
    suggestion: 'Try re-downloading it from your research database, or copy and paste the relevant text instead.',
    code: 'UNKNOWN',
  });
}

function validateExtractedText(text: string, fileName: string): void {
  if (!text || text.trim().length === 0) {
    throw new DocumentExtractionError({
      message: 'No text was found in this document.',
      suggestion: "If it's a scanned document, try downloading a text-based version. You can also paste text directly.",
      code: 'EMPTY_EXTRACTION',
    });
  }

  // Detect scanned/image PDFs: very short text relative to what's expected, or mostly garbled characters
  const trimmed = text.trim();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf' && trimmed.length < 50) {
    const nonAsciiRatio = (trimmed.replace(/[\x20-\x7E\n\r\t]/g, '').length) / trimmed.length;
    if (nonAsciiRatio > 0.5 || trimmed.length < 20) {
      throw new DocumentExtractionError({
        message: 'This PDF appears to be a scanned image with little readable text.',
        suggestion: 'Try downloading a text-based version from your research database, or copy and paste the text directly.',
        code: 'SCANNED_PDF',
      });
    }
  }
}

/**
 * Normalize formatting markers in extracted text:
 * - Merge adjacent markers: *a* *b* → *a b*
 * - Remove empty markers: ** → (nothing)
 * - Trim whitespace inside markers: * foo * → *foo*
 */
function normalizeMarkers(text: string): string {
  // Merge adjacent italic markers separated by whitespace
  text = text.replace(/\*([^*]+)\*\s+\*([^*]+)\*/g, '*$1 $2*');
  // Merge adjacent underline markers
  text = text.replace(/_([^_]+)_\s+_([^_]+)_/g, '_$1 $2_');
  // Remove empty markers
  text = text.replace(/\*\*/g, '');
  text = text.replace(/__/g, '');
  // Trim whitespace inside markers
  text = text.replace(/\*\s+([^*]+?)\s+\*/g, '*$1*');
  text = text.replace(/_\s+([^_]+?)\s+_/g, '_$1_');
  return text;
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  let text: string;

  try {
    text = await extractTextRaw(buffer, mimeType, fileName);
  } catch (error) {
    if (error instanceof DocumentExtractionError) throw error;
    throw classifyExtractionError(error, fileName);
  }

  validateExtractedText(text, fileName);
  return text;
}

async function extractTextRaw(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  // Normalize mime type and also check file extension as a fallback
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  switch (mimeType) {
    case 'application/pdf':
      return extractFromPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractFromDocx(buffer);
    case 'application/msword':
      // Legacy .doc — try treating as DOCX (mammoth handles some .doc files)
      return extractFromDocx(buffer);
    case 'application/rtf':
    case 'text/rtf':
      return extractFromRtf(buffer);
    case 'text/plain':
    case 'text/csv':
    case 'text/tab-separated-values':
      return buffer.toString('utf-8');
    case 'text/html':
    case 'application/xhtml+xml':
      return extractFromHtml(buffer);
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'image/webp':
    case 'image/tiff':
    case 'image/bmp':
      return extractFromImage(buffer, fileName);
    default:
      // Fallback: try to handle by file extension
      if (ext === 'doc' || ext === 'docx') return extractFromDocx(buffer);
      if (ext === 'pdf') return extractFromPdf(buffer);
      if (ext === 'rtf') return extractFromRtf(buffer);
      if (ext === 'html' || ext === 'htm') return extractFromHtml(buffer);
      if (['txt', 'csv', 'tsv', 'text', 'log'].includes(ext)) return buffer.toString('utf-8');
      // Last resort: try to read as plain text
      return buffer.toString('utf-8');
  }
}

/**
 * Extract text from DOCX preserving italics and underlines.
 * mammoth can convert to HTML which preserves <em> and <u> tags.
 * We convert those to *asterisk* markers for our citation system.
 */
async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');

    // Convert to HTML to preserve formatting
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const html = htmlResult.value;

    // Convert HTML formatting to our marker format:
    // <em>text</em> or <i>text</i> → *text*
    // <u>text</u> → _text_
    let text = html;

    // Remove <style> and <script> blocks entirely (content + tags)
    text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    text = text.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');

    text = text
      // Replace italic tags with asterisk markers
      .replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
      // Replace underline tags with underscore markers
      .replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '_$1_')
      // Handle spans with font-style: italic or text-decoration: underline
      .replace(/<span\b[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*')
      .replace(/<span\b[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '_$1_')
      // Replace strong/bold (useful context)
      .replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '$1')
      // Convert paragraphs and line breaks to newlines
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Clean up excessive whitespace but preserve newlines
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PDF.
 * pdf-parse doesn't preserve font style info, so we do the best we can.
 * Case names in legal PDFs often use italic fonts — we try to detect
 * common citation patterns and wrap them in markers.
 */
async function extractFromPdf(buffer: Buffer): Promise<string> {
  const result = await extractFromPdfWithPages(buffer);
  return result.text;
}

/**
 * Extract text from PDF with page-by-page mapping.
 * Returns the full text along with page boundaries for pinpoint citation support.
 */
export async function extractFromPdfWithPages(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const pdfParse = (await import('pdf-parse')).default;

    const pageTexts: string[] = [];

    // Use pdf-parse's pagerender to extract text page by page with font metadata
    const options = {
      pagerender: (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          let lastY: number | null = null;
          let pageText = '';
          let italicCount = 0;
          let totalCount = 0;

          for (const item of textContent.items) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
              pageText += '\n';
            }

            const str = item.str as string;
            if (!str.trim()) {
              pageText += str;
              lastY = item.transform[5];
              continue;
            }

            totalCount++;
            const fontName = (item.fontName || '') as string;
            const isItalic = /italic|oblique|(?:^|-)i$/i.test(fontName);

            if (isItalic) {
              italicCount++;
              pageText += `*${str}*`;
            } else {
              pageText += str;
            }
            lastY = item.transform[5];
          }

          // If >80% of items are italic, font metadata is unreliable — strip markers
          if (totalCount > 0 && italicCount / totalCount > 0.8) {
            pageText = pageText.replace(/\*([^*]+)\*/g, '$1');
          } else {
            // Merge adjacent markers: *foo* *bar* → *foo bar*
            pageText = normalizeMarkers(pageText);
          }

          pageTexts.push(pageText);
          return pageText;
        });
      },
    };

    const data = await (pdfParse as any)(buffer, options);

    // Build page mapping with character offsets
    const pageMapping: PageMapping[] = [];
    let offset = 0;

    for (let i = 0; i < pageTexts.length; i++) {
      let pageText = pageTexts[i];

      // Apply legal italic heuristic to each page (case names, signals, Id., supra)
      // Case names: Party v. Party before a volume number
      pageText = pageText.replace(
        /(?<!\*)([A-Z][a-zA-Z'.]+(?:\s+(?:of|the|ex rel\.|in re)\s+)?(?:\s+[A-Z][a-zA-Z'.]+)*\s+v\.\s+[A-Z][a-zA-Z'.]+(?:\s+(?:of|the)\s+)?(?:\s+[A-Z][a-zA-Z'.]+)*)(?=,?\s*\d)/g,
        '*$1*'
      );
      // In re / Ex parte case names
      pageText = pageText.replace(/(?<!\*)\b(In re\s+[A-Z][a-zA-Z'.]+(?:\s+[A-Z][a-zA-Z'.]+)*)/g, '*$1*');
      pageText = pageText.replace(/(?<!\*)\b(Ex parte\s+[A-Z][a-zA-Z'.]+(?:\s+[A-Z][a-zA-Z'.]+)*)/g, '*$1*');
      // Signals
      pageText = pageText.replace(
        /(?<!\*)\b(See also|See,?\s*e\.g\.,?|See|Cf\.|But see|But cf\.|Accord|Contra|E\.g\.,)\b/g,
        '*$1*'
      );
      // Id.
      pageText = pageText.replace(/(?<!\*)\b(Id\.)/g, '*$1*');
      // supra, infra
      pageText = pageText.replace(/(?<!\*)\b(supra|infra)\b/g, '*$1*');
      pageText = normalizeMarkers(pageText);

      pageMapping.push({
        pageNumber: i + 1,
        startOffset: offset,
        endOffset: offset + pageText.length,
        text: pageText,
      });
      offset += pageText.length + 1; // +1 for page separator newline
    }

    // Build full text from processed pages (case name markers already applied per-page)
    const fullText = pageMapping.map(p => p.text).join('\n');

    return {
      text: fullText,
      pageMapping,
      pageCount: pageTexts.length,
    };
  } catch (error) {
    if (error instanceof DocumentExtractionError) throw error;
    throw classifyExtractionError(error, 'document.pdf');
  }
}

/**
 * Extract text from raw HTML content, stripping all tags and preserving formatting markers.
 */
function extractFromHtml(buffer: Buffer): string {
  let text = buffer.toString('utf-8');

  // Remove <style> and <script> blocks entirely
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');

  // Convert formatting to markers
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  text = text.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '_$1_');
  text = text.replace(/<span\b[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '*$1*');
  text = text.replace(/<span\b[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '_$1_');

  // Paragraphs and line breaks
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip all remaining HTML
  text = text.replace(/<[^>]+>/g, '');

  // Decode entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

/**
 * Extract text from RTF files, preserving italic and underline formatting.
 * Uses a stateful parser to track \i (italic) and \ul (underline) control words.
 */
function extractFromRtf(buffer: Buffer): string {
  const rtf = buffer.toString('utf-8');
  let result = '';
  let inItalic = false;
  let inUnderline = false;
  const stateStack: Array<{ italic: boolean; underline: boolean }> = [];
  let pos = 0;

  while (pos < rtf.length) {
    const ch = rtf[pos];

    if (ch === '{') {
      // Push current formatting state before entering group
      stateStack.push({ italic: inItalic, underline: inUnderline });
      pos++;
      continue;
    }

    if (ch === '}') {
      // Close any open markers before restoring state
      if (inItalic) { result += '*'; inItalic = false; }
      if (inUnderline) { result += '_'; inUnderline = false; }
      // Restore state from before this group
      const prev = stateStack.pop();
      if (prev) {
        inItalic = prev.italic;
        inUnderline = prev.underline;
        if (inItalic) result += '*';
        if (inUnderline) result += '_';
      }
      pos++;
      continue;
    }

    if (ch === '\\') {
      // Parse control word
      pos++;
      if (pos >= rtf.length) break;

      // Escaped characters
      if (rtf[pos] === '\\' || rtf[pos] === '{' || rtf[pos] === '}') {
        result += rtf[pos];
        pos++;
        continue;
      }

      // Read control word name
      let word = '';
      while (pos < rtf.length && /[a-zA-Z]/.test(rtf[pos])) {
        word += rtf[pos];
        pos++;
      }

      // Read optional numeric parameter
      let param = '';
      if (pos < rtf.length && (rtf[pos] === '-' || /\d/.test(rtf[pos]))) {
        if (rtf[pos] === '-') { param += '-'; pos++; }
        while (pos < rtf.length && /\d/.test(rtf[pos])) {
          param += rtf[pos];
          pos++;
        }
      }

      // Consume optional trailing space
      if (pos < rtf.length && rtf[pos] === ' ') pos++;

      const paramNum = param ? parseInt(param, 10) : undefined;

      switch (word) {
        case 'i':
          if (paramNum === 0) {
            if (inItalic) { result += '*'; inItalic = false; }
          } else {
            if (!inItalic) { result += '*'; inItalic = true; }
          }
          break;
        case 'ul':
          if (paramNum === 0) {
            if (inUnderline) { result += '_'; inUnderline = false; }
          } else {
            if (!inUnderline) { result += '_'; inUnderline = true; }
          }
          break;
        case 'ulnone':
          if (inUnderline) { result += '_'; inUnderline = false; }
          break;
        case 'par':
        case 'line':
          result += '\n';
          break;
        case 'tab':
          result += '\t';
          break;
        default:
          // Skip unknown control words
          break;
      }
      continue;
    }

    // Regular text character
    result += ch;
    pos++;
  }

  // Close any remaining open markers
  if (inItalic) result += '*';
  if (inUnderline) result += '_';

  let text = normalizeMarkers(result);
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

async function extractFromImage(_buffer: Buffer, fileName: string): Promise<string> {
  // OCR placeholder — in production, use Tesseract.js or a cloud OCR service
  throw new Error(
    `OCR for image files (${fileName}) requires Tesseract.js setup. ` +
    'Please convert the image to text manually or install tesseract.js.'
  );
}
