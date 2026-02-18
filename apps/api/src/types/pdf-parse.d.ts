declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
  }
  interface PDFOptions {
    pagerender?: (pageData: { getTextContent(): Promise<{ items: Array<{ str: string; transform: number[]; fontName?: string; width?: number }> }> }) => Promise<string>;
    max?: number;
  }
  function pdfParse(buffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  export default pdfParse;
}
