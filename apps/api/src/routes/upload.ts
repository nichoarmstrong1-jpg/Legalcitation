import { Router } from 'express';
import multer from 'multer';
import { extractTextFromFile } from '../services/document-processor.js';

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'image/png',
      'image/jpeg',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'File processing failed',
    });
  }
});
