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
  switch (mimeType) {
    case 'application/pdf':
      return extractFromPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractFromDocx(buffer);
    case 'text/plain':
    case 'text/csv':
      return buffer.toString('utf-8');
    case 'image/png':
    case 'image/jpeg':
      return extractFromImage(buffer, fileName);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
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
    let text = html
      // Replace italic tags with asterisk markers
      .replace(/<(?:em|i)>(.*?)<\/(?:em|i)>/gi, '*$1*')
      // Replace underline tags with underscore markers
      .replace(/<u>(.*?)<\/u>/gi, '_$1_')
      // Replace strong/bold (useful context)
      .replace(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/gi, '$1')
      // Convert paragraphs and line breaks to newlines
      .replace(/<\/p>\s*<p>/gi, '\n\n')
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

async function extractFromImage(_buffer: Buffer, fileName: string): Promise<string> {
  // OCR placeholder — in production, use Tesseract.js or a cloud OCR service
  throw new Error(
    `OCR for image files (${fileName}) requires Tesseract.js setup. ` +
    'Please convert the image to text manually or install tesseract.js.'
  );
}
