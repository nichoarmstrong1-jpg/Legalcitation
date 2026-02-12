/**
 * Document text extraction service.
 * Preserves italic and underline formatting using *asterisk* markers.
 * Supports PDF, DOCX, TXT, and images (via placeholder for OCR).
 */

export async function extractTextFromFile(
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
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

    // pdf-parse loses italic/underline info. Apply heuristic:
    // Detect case name patterns (Party v. Party) that should be italicized
    // and wrap them with asterisk markers for downstream processing.
    let text = data.text;

    // Match "Party v. Party," patterns and wrap in italics markers
    // This catches the common legal citation case name pattern
    text = text.replace(
      /(?<!\*)([A-Z][a-zA-Z'.]+(?:\s+(?:of|the|ex rel\.|in re)\s+)?(?:\s+[A-Z][a-zA-Z'.]+)*\s+v\.\s+[A-Z][a-zA-Z'.]+(?:\s+(?:of|the)\s+)?(?:\s+[A-Z][a-zA-Z'.]+)*)(?=,\s*\d)/g,
      '*$1*'
    );

    return text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
 * Extract text from RTF files by stripping RTF control words.
 */
function extractFromRtf(buffer: Buffer): string {
  let text = buffer.toString('utf-8');

  // Remove RTF header/groups
  text = text.replace(/\{\\[^{}]*\}/g, '');
  // Remove RTF control words (e.g., \par, \b, \i, \f0, etc.)
  text = text.replace(/\\[a-z]+\d*\s?/gi, ' ');
  // Remove remaining braces
  text = text.replace(/[{}]/g, '');
  // Clean up whitespace
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
