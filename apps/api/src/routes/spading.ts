import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { eq, desc, and, ne } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import {
  extractFromPdfWithPages,
  extractTextFromFile,
  DocumentExtractionError,
  type PageMapping,
} from '../services/document-processor.js';
import { extractAndParseCitations } from '@legalcitation/citation-parser';
import { saveFile, getFileStream, deleteFile, isFileStorageConfigured } from '../services/file-storage.js';
import { subscribeProgress } from '../services/spading-progress.js';
import { runSpadingPipeline } from '../services/spading-engine.js';
import {
  MAX_UPLOAD_BYTES,
  validateUploadedFile,
  sendUploadError,
  SPADING_ALLOWED_MIMES,
  SPADING_ALLOWED_EXTENSIONS,
  handleMulterRouteError,
} from './upload-utils.js';

export const spadingRouter = Router();

// All spading routes require authentication
spadingRouter.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

interface UploadConstraintError {
  status: number;
  body: { error: string };
}

export function getJournalUploadConstraintError(
  role: 'journal_entry' | 'source',
  filesLength: number,
  hasExistingJournal: boolean
): UploadConstraintError | null {
  if (role === 'journal_entry' && filesLength > 1) {
    return {
      status: 400,
      body: { error: 'Only one journal entry allowed per project' },
    };
  }

  if (role === 'journal_entry' && hasExistingJournal && filesLength === 1) {
    return null;
  }

  return null;
}

// --- Project CRUD ---

spadingRouter.post('/projects', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const { name, description } = req.body as { name: string; description?: string };
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const db = getDb();
    const [project] = await db
      .insert(schema.spadingProjects)
      .values({
        userId: req.user!.userId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

spadingRouter.get('/projects', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const projects = await db
      .select({
        id: schema.spadingProjects.id,
        name: schema.spadingProjects.name,
        description: schema.spadingProjects.description,
        status: schema.spadingProjects.status,
        citationCount: schema.spadingProjects.citationCount,
        verifiedCount: schema.spadingProjects.verifiedCount,
        issueCount: schema.spadingProjects.issueCount,
        progress: schema.spadingProjects.progress,
        currentStep: schema.spadingProjects.currentStep,
        completedAt: schema.spadingProjects.completedAt,
        createdAt: schema.spadingProjects.createdAt,
        updatedAt: schema.spadingProjects.updatedAt,
      })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.userId, req.user!.userId))
      .orderBy(desc(schema.spadingProjects.createdAt));

    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

spadingRouter.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const [project] = await db
      .select()
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

spadingRouter.patch('/projects/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const [project] = await db
      .select({ id: schema.spadingProjects.id, userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { name, description } = req.body as { name?: string; description?: string };
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;

    const [updated] = await db
      .update(schema.spadingProjects)
      .set(updates)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

spadingRouter.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const [project] = await db
      .select({ id: schema.spadingProjects.id, userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete S3 files for all project documents
    const docs = await db
      .select({ filePath: schema.projectDocuments.filePath })
      .from(schema.projectDocuments)
      .where(eq(schema.projectDocuments.projectId, (req.params.id as string)));

    for (const doc of docs) {
      if (doc.filePath) {
        try {
          await deleteFile(doc.filePath);
        } catch {
          // Non-critical — continue cleanup
        }
      }
    }

    // Cascade delete handles project_documents and spading_annotations
    await db
      .delete(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- Document Upload ---

spadingRouter.post(
  '/projects/:id/documents',
  upload.array('files', 20),
  async (req: Request, res: Response) => {
    const uploadedPaths: string[] = [];
    let replacedJournalFilePath: string | null = null;
    let committed = false;
    try {
      if (!isDatabaseConfigured()) {
        res.status(503).json({ error: 'Database not configured' });
        return;
      }

      const db = getDb();
      const projectId = (req.params.id as string);
      const role = req.body.role as 'journal_entry' | 'source';

      if (!role || !['journal_entry', 'source'].includes(role)) {
        res.status(400).json({ error: 'Role must be "journal_entry" or "source"' });
        return;
      }

      // Verify project ownership
      const [project] = await db
        .select({
          id: schema.spadingProjects.id,
          userId: schema.spadingProjects.userId,
          journalDocumentId: schema.spadingProjects.journalDocumentId,
        })
        .from(schema.spadingProjects)
        .where(eq(schema.spadingProjects.id, projectId));

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      if (project.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const uploadConstraintError = getJournalUploadConstraintError(
        role,
        files.length,
        Boolean(project.journalDocumentId)
      );
      if (uploadConstraintError) {
        res.status(uploadConstraintError.status).json(uploadConstraintError.body);
        return;
      }

      for (const file of files) {
        const validationError = validateUploadedFile(file, {
          allowedMimes: SPADING_ALLOWED_MIMES,
          allowedExtensions: SPADING_ALLOWED_EXTENSIONS,
        });
        if (validationError) {
          sendUploadError(res, validationError);
          return;
        }
      }

      const preparedDocuments: Array<{
        role: 'journal_entry' | 'source';
        fileName: string;
        mimeType: string;
        fileSize: number;
        filePath: string | null;
        extractedText: string;
        pageMapping: PageMapping[] | null;
        pageCount: number | null;
        caseName: string | null;
        citation: string | null;
      }> = [];

      for (const file of files) {
        const { originalname, mimetype, buffer, size } = file;
        const isPdf = mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');

        let extractedText: string;
        let pageMapping: PageMapping[] | null = null;
        let pageCount: number | null = null;

        if (isPdf) {
          const pdfResult = await extractFromPdfWithPages(buffer);
          extractedText = pdfResult.text;
          pageMapping = pdfResult.pageMapping || null;
          pageCount = pdfResult.pageCount || null;
        } else {
          extractedText = await extractTextFromFile(buffer, mimetype, originalname);
        }

        // Store the original file in S3 (if configured)
        let filePath: string | null = null;
        if (isFileStorageConfigured()) {
          filePath = await saveFile(projectId, originalname, buffer, mimetype);
          uploadedPaths.push(filePath);
        }

        // Auto-detect case name and citation from source documents
        let caseName: string | null = null;
        let citation: string | null = null;

        if (role === 'source') {
          const parsed = extractAndParseCitations(extractedText.slice(0, 5000), 'citation_sentence');
          if (parsed.length > 0) {
            const first = parsed[0];
            citation = first.rawText;
            if (first.type === 'case') {
              const components = first.components as unknown as Record<string, unknown>;
              const partyOne = components.partyOne;
              const partyTwo = components.partyTwo;
              if (typeof partyOne === 'string' && typeof partyTwo === 'string') {
                caseName = `${partyOne} v. ${partyTwo}`;
              }
            }
          }

          // Fallback: extract case name from filename
          if (!caseName) {
            const nameMatch = originalname.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
            if (nameMatch.match(/v\./i)) {
              caseName = nameMatch;
            }
          }
        }

        preparedDocuments.push({
          role,
          fileName: originalname,
          mimeType: mimetype,
          fileSize: size,
          filePath,
          extractedText,
          pageMapping,
          pageCount,
          caseName,
          citation,
        });
      }

      const transactionResult = await db.transaction(async (tx) => {
        const insertedDocs: Array<{
          id: string;
          role: 'journal_entry' | 'source';
          fileName: string;
          mimeType: string;
          fileSize: number;
          pageCount: number | null;
          caseName: string | null;
          citation: string | null;
          uploadedAt: Date;
        }> = [];
        let replacedPath: string | null = null;

        if (role === 'journal_entry' && project.journalDocumentId) {
          const [existingJournal] = await tx
            .select({
              id: schema.projectDocuments.id,
              filePath: schema.projectDocuments.filePath,
            })
            .from(schema.projectDocuments)
            .where(eq(schema.projectDocuments.id, project.journalDocumentId));

          if (existingJournal) {
            replacedPath = existingJournal.filePath;
            await tx
              .delete(schema.projectDocuments)
              .where(eq(schema.projectDocuments.id, existingJournal.id));
          }
        }

        for (const doc of preparedDocuments) {
          const [inserted] = await tx
            .insert(schema.projectDocuments)
            .values({
              projectId,
              role: doc.role,
              fileName: doc.fileName,
              mimeType: doc.mimeType,
              fileSize: doc.fileSize,
              filePath: doc.filePath,
              extractedText: doc.extractedText,
              pageMapping: doc.pageMapping,
              pageCount: doc.pageCount,
              caseName: doc.caseName,
              citation: doc.citation,
            })
            .returning({
              id: schema.projectDocuments.id,
              role: schema.projectDocuments.role,
              fileName: schema.projectDocuments.fileName,
              mimeType: schema.projectDocuments.mimeType,
              fileSize: schema.projectDocuments.fileSize,
              pageCount: schema.projectDocuments.pageCount,
              caseName: schema.projectDocuments.caseName,
              citation: schema.projectDocuments.citation,
              uploadedAt: schema.projectDocuments.uploadedAt,
            });

          insertedDocs.push(inserted);
        }

        if (role === 'journal_entry' && insertedDocs.length > 0) {
          await tx
            .update(schema.spadingProjects)
            .set({ journalDocumentId: insertedDocs[0].id, updatedAt: new Date() })
            .where(eq(schema.spadingProjects.id, projectId));
        }

        return {
          insertedDocs,
          replacedPath,
        };
      });

      replacedJournalFilePath = transactionResult.replacedPath;
      committed = true;
      if (replacedJournalFilePath) {
        await deleteFile(replacedJournalFilePath).catch(() => {
          // Non-critical cleanup for replaced journal files.
        });
      }
      res.json({ documents: transactionResult.insertedDocs });
    } catch (error) {
      if (!committed && uploadedPaths.length > 0) {
        await Promise.allSettled(uploadedPaths.map((path) => deleteFile(path)));
      }

      console.error('Document upload error:', error);
      if (error instanceof DocumentExtractionError) {
        res.status(422).json(error.toJSON());
        return;
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : 'File processing failed',
      });
    }
  }
);

spadingRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (handleMulterRouteError(err, res)) {
    return;
  }
  next(err);
});

spadingRouter.get('/projects/:id/documents', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const projectId = (req.params.id as string);

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, projectId));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const documents = await db
      .select({
        id: schema.projectDocuments.id,
        role: schema.projectDocuments.role,
        fileName: schema.projectDocuments.fileName,
        mimeType: schema.projectDocuments.mimeType,
        fileSize: schema.projectDocuments.fileSize,
        pageCount: schema.projectDocuments.pageCount,
        caseName: schema.projectDocuments.caseName,
        citation: schema.projectDocuments.citation,
        uploadedAt: schema.projectDocuments.uploadedAt,
      })
      .from(schema.projectDocuments)
      .where(eq(schema.projectDocuments.projectId, projectId))
      .orderBy(desc(schema.projectDocuments.uploadedAt));

    res.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

spadingRouter.get('/projects/:id/documents/:docId', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const [doc] = await db
      .select({
        id: schema.projectDocuments.id,
        role: schema.projectDocuments.role,
        fileName: schema.projectDocuments.fileName,
        mimeType: schema.projectDocuments.mimeType,
        fileSize: schema.projectDocuments.fileSize,
        extractedText: schema.projectDocuments.extractedText,
        pageCount: schema.projectDocuments.pageCount,
        caseName: schema.projectDocuments.caseName,
        citation: schema.projectDocuments.citation,
        uploadedAt: schema.projectDocuments.uploadedAt,
      })
      .from(schema.projectDocuments)
      .where(
        and(
          eq(schema.projectDocuments.id, (req.params.docId as string)),
          eq(schema.projectDocuments.projectId, (req.params.id as string))
        )
      );

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json(doc);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

spadingRouter.delete('/projects/:id/documents/:docId', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const [doc] = await db
      .select()
      .from(schema.projectDocuments)
      .where(
        and(
          eq(schema.projectDocuments.id, (req.params.docId as string)),
          eq(schema.projectDocuments.projectId, (req.params.id as string))
        )
      );

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Delete from S3
    if (doc.filePath) {
      try {
        await deleteFile(doc.filePath);
      } catch {
        // Non-critical
      }
    }

    // If this was the journal entry, clear the reference
    if (doc.role === 'journal_entry') {
      await db
        .update(schema.spadingProjects)
        .set({ journalDocumentId: null, updatedAt: new Date() })
        .where(eq(schema.spadingProjects.id, (req.params.id as string)));
    }

    await db
      .delete(schema.projectDocuments)
      .where(eq(schema.projectDocuments.id, (req.params.docId as string)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// --- File Serving (for PDF viewer) ---

spadingRouter.get('/projects/:id/documents/:docId/file', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const [doc] = await db
      .select({
        filePath: schema.projectDocuments.filePath,
        fileName: schema.projectDocuments.fileName,
        mimeType: schema.projectDocuments.mimeType,
      })
      .from(schema.projectDocuments)
      .where(
        and(
          eq(schema.projectDocuments.id, (req.params.docId as string)),
          eq(schema.projectDocuments.projectId, (req.params.id as string))
        )
      );

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    if (!doc.filePath) {
      res.status(404).json({ error: 'Original file not available (file storage not configured)' });
      return;
    }

    const { stream, contentLength } = await getFileStream(doc.filePath);
    res.setHeader('Content-Type', doc.mimeType);
    const safeName = doc.fileName.replace(/[^\w.\- ]/g, '_');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    stream.pipe(res);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// --- Spading Execution ---

spadingRouter.post('/projects/:id/run', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const projectId = (req.params.id as string);

    // Verify ownership and pre-conditions
    const [project] = await db
      .select({
        id: schema.spadingProjects.id,
        userId: schema.spadingProjects.userId,
        journalDocumentId: schema.spadingProjects.journalDocumentId,
      })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, projectId));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    if (!project.journalDocumentId) {
      res.status(400).json({ error: 'No journal entry uploaded. Upload a journal entry first.' });
      return;
    }

    // Atomic guard: only start if not already processing
    const [updated] = await db
      .update(schema.spadingProjects)
      .set({
        status: 'processing',
        progress: 0,
        currentStep: 'Starting...',
        errorMessage: null,
      })
      .where(and(
        eq(schema.spadingProjects.id, projectId),
        ne(schema.spadingProjects.status, 'processing')
      ))
      .returning({ id: schema.spadingProjects.id });

    if (!updated) {
      res.status(409).json({ error: 'Spading is already running for this project' });
      return;
    }

    // Start the pipeline asynchronously (status already set to processing)
    runSpadingPipeline(projectId).catch(err => {
      console.error('Spading pipeline unhandled error:', err);
    });

    res.json({ message: 'Spading started', projectId });
  } catch (error) {
    console.error('Run spading error:', error);
    res.status(500).json({ error: 'Failed to start spading' });
  }
});

// --- SSE Progress ---

spadingRouter.get('/projects/:id/progress', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const projectId = (req.params.id as string);

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, projectId));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const emitter = subscribeProgress(projectId);
    const onProgress = (event: unknown) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    emitter.on('progress', onProgress);

    // Clean up when client disconnects
    req.on('close', () => {
      emitter.off('progress', onProgress);
    });
  } catch (error) {
    console.error('SSE progress error:', error);
    res.status(500).json({ error: 'Failed to connect to progress stream' });
  }
});

// --- Annotations ---

spadingRouter.get('/projects/:id/annotations', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();
    const projectId = (req.params.id as string);

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, projectId));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const annotations = await db
      .select()
      .from(schema.spadingAnnotations)
      .where(eq(schema.spadingAnnotations.projectId, projectId))
      .orderBy(schema.spadingAnnotations.startOffset);

    res.json({ annotations });
  } catch (error) {
    console.error('List annotations error:', error);
    res.status(500).json({ error: 'Failed to list annotations' });
  }
});

spadingRouter.patch('/projects/:id/annotations/:annId', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const db = getDb();

    // Verify ownership
    const [project] = await db
      .select({ userId: schema.spadingProjects.userId })
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, (req.params.id as string)));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { editorNote, resolved } = req.body as {
      editorNote?: string;
      resolved?: boolean;
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (editorNote !== undefined) updates.editorNote = editorNote;
    if (resolved !== undefined) updates.resolved = resolved;

    const [updated] = await db
      .update(schema.spadingAnnotations)
      .set(updates)
      .where(
        and(
          eq(schema.spadingAnnotations.id, (req.params.annId as string)),
          eq(schema.spadingAnnotations.projectId, (req.params.id as string))
        )
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error('Update annotation error:', error);
    res.status(500).json({ error: 'Failed to update annotation' });
  }
});
