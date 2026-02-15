import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { eq, desc } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { extractFromPdfWithPages, extractTextFromFile, DocumentExtractionError } from '../services/document-processor.js';
import { extractAndParseCitations } from '@legalcitation/citation-parser';

export const caseDocumentsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

/**
 * POST /api/case-documents — Upload one or more case PDFs/documents.
 * Extracts text, detects case citations, stores in database.
 * Requires authentication.
 */
caseDocumentsRouter.post(
  '/',
  requireAuth,
  upload.array('files', 10),
  async (req: Request, res: Response) => {
    try {
      if (!isDatabaseConfigured()) {
        res.status(503).json({ error: 'Database not configured' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const db = getDb();
      const userId = req.user!.userId;
      const results = [];

      for (const file of files) {
        const { originalname, mimetype, buffer, size } = file;
        const isPdf = mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');

        let extractedText: string;
        let pageMapping: any[] | null = null;
        let pageCount: number | null = null;

        if (isPdf) {
          const pdfResult = await extractFromPdfWithPages(buffer);
          extractedText = pdfResult.text;
          pageMapping = pdfResult.pageMapping || null;
          pageCount = pdfResult.pageCount || null;
        } else {
          extractedText = await extractTextFromFile(buffer, mimetype, originalname);
        }

        // Try to detect a case citation from the extracted text
        let caseName: string | null = null;
        let citation: string | null = null;

        const parsed = extractAndParseCitations(extractedText.slice(0, 5000), 'citation_sentence');
        if (parsed.length > 0) {
          const first = parsed[0];
          citation = first.rawText;
          if (first.type === 'case' || (first.type as string) === 'full_case') {
            const components = first.components as any;
            if (components.partyOne && components.partyTwo) {
              caseName = `${components.partyOne} v. ${components.partyTwo}`;
            }
          }
        }

        // Fallback: extract case name from file name
        if (!caseName) {
          const nameMatch = originalname.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
          if (nameMatch.match(/v\./i)) {
            caseName = nameMatch;
          }
        }

        const [inserted] = await db
          .insert(schema.caseDocuments)
          .values({
            userId,
            fileName: originalname,
            caseName,
            citation,
            extractedText,
            pageMapping,
            fileSize: size,
            pageCount,
          })
          .returning({
            id: schema.caseDocuments.id,
            fileName: schema.caseDocuments.fileName,
            caseName: schema.caseDocuments.caseName,
            citation: schema.caseDocuments.citation,
            fileSize: schema.caseDocuments.fileSize,
            pageCount: schema.caseDocuments.pageCount,
            uploadedAt: schema.caseDocuments.uploadedAt,
          });

        results.push(inserted);
      }

      res.json({ documents: results });
    } catch (error) {
      console.error('Case document upload error:', error);
      if (error instanceof DocumentExtractionError) {
        res.status(422).json(error.toJSON());
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : 'File processing failed',
        suggestion: 'Try a different file, or copy and paste the text directly.',
        code: 'UNKNOWN',
      });
    }
  }
);

/**
 * GET /api/case-documents — List user's uploaded case documents.
 * Returns summary info (no full text or page mapping).
 */
caseDocumentsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const userId = req.user!.userId;

    const documents = await db
      .select({
        id: schema.caseDocuments.id,
        fileName: schema.caseDocuments.fileName,
        caseName: schema.caseDocuments.caseName,
        citation: schema.caseDocuments.citation,
        fileSize: schema.caseDocuments.fileSize,
        pageCount: schema.caseDocuments.pageCount,
        uploadedAt: schema.caseDocuments.uploadedAt,
      })
      .from(schema.caseDocuments)
      .where(eq(schema.caseDocuments.userId, userId))
      .orderBy(desc(schema.caseDocuments.uploadedAt));

    res.json({ documents });
  } catch (error) {
    console.error('Case documents list error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * GET /api/case-documents/:id — Get full document with text and page mapping.
 */
caseDocumentsRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const userId = req.user!.userId;
    const docId = req.params.id as string;

    const [doc] = await db
      .select()
      .from(schema.caseDocuments)
      .where(eq(schema.caseDocuments.id, docId));

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (doc.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(doc);
  } catch (error) {
    console.error('Case document fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

/**
 * DELETE /api/case-documents/:id — Remove a document.
 */
caseDocumentsRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const userId = req.user!.userId;
    const docId = req.params.id as string;

    const [doc] = await db
      .select({ id: schema.caseDocuments.id, userId: schema.caseDocuments.userId })
      .from(schema.caseDocuments)
      .where(eq(schema.caseDocuments.id, docId));

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (doc.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await db
      .delete(schema.caseDocuments)
      .where(eq(schema.caseDocuments.id, docId));

    res.json({ success: true });
  } catch (error) {
    console.error('Case document delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});
