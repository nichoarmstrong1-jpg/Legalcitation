import { Router } from 'express';
import multer from 'multer';
import { extractTextFromFile, DocumentExtractionError } from '../services/document-processor.js';

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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
