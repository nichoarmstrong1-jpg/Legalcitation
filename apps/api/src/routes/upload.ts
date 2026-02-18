import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { extractTextFromFile, DocumentExtractionError } from '../services/document-processor.js';
import {
  MAX_UPLOAD_BYTES,
  validateUploadedFile,
  sendUploadError,
  handleMulterRouteError,
} from './upload-utils.js';

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES }, // 50MB
  // Accept all file types — document-processor will handle extraction
  // or gracefully fall back to plain text for unrecognized formats
});

/**
 * POST /api/upload — Upload a file and extract text.
 */
uploadRouter.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const validationError = validateUploadedFile(req.file);
    if (validationError) {
      sendUploadError(res, validationError);
      return;
    }

    const { originalname, mimetype, buffer, size } = req.file;

    const extractedText = await extractTextFromFile(buffer, mimetype, originalname);

    res.json({
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      extractedText,
      characterCount: extractedText.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
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
});

uploadRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (handleMulterRouteError(err, res)) {
    return;
  }
  next(err);
});
