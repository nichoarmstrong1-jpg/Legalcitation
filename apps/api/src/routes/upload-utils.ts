import type { Response } from 'express';
import multer from 'multer';

export interface UploadApiError {
  status: number;
  body: {
    error: string;
    suggestion?: string;
    code?: string;
  };
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const SHARED_ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/rtf',
  'text/rtf',
  'text/plain',
  'text/csv',
  'text/tab-separated-values',
  'text/html',
  'application/xhtml+xml',
]);

const SHARED_ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.doc',
  '.rtf',
  '.txt',
  '.csv',
  '.tsv',
  '.html',
  '.htm',
  '.text',
  '.log',
]);

export const SPADING_ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

export const SPADING_ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc']);

function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? '';
}

export function validateUploadedFile(
  file: Express.Multer.File,
  options?: {
    allowedMimes?: Set<string>;
    allowedExtensions?: Set<string>;
    allowEmpty?: boolean;
  }
): UploadApiError | null {
  const allowEmpty = options?.allowEmpty ?? false;
  const allowedMimes = options?.allowedMimes ?? SHARED_ALLOWED_MIMES;
  const allowedExtensions = options?.allowedExtensions ?? SHARED_ALLOWED_EXTENSIONS;

  if (!allowEmpty && file.size <= 0) {
    return {
      status: 400,
      body: {
        error: `File "${file.originalname}" is empty.`,
        suggestion: 'Upload a non-empty file with readable text.',
        code: 'EMPTY_FILE',
      },
    };
  }

  const ext = getExtension(file.originalname);
  if (!allowedMimes.has(file.mimetype) && !allowedExtensions.has(ext)) {
    return {
      status: 400,
      body: {
        error: `Unsupported file type: ${file.originalname}.`,
        suggestion: 'Upload a supported document format.',
        code: 'UNSUPPORTED_FORMAT',
      },
    };
  }

  return null;
}

export function sendUploadError(res: Response, apiError: UploadApiError): void {
  res.status(apiError.status).json(apiError.body);
}

export function handleMulterRouteError(error: unknown, res: Response): boolean {
  if (!(error instanceof multer.MulterError)) {
    return false;
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      error: `File too large. Maximum size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.`,
      suggestion: 'Try a smaller file or split the document into parts.',
      code: 'FILE_TOO_LARGE',
    });
    return true;
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({
      error: 'Too many files uploaded in a single request.',
      suggestion: 'Upload fewer files at a time.',
      code: 'TOO_MANY_FILES',
    });
    return true;
  }

  res.status(400).json({
    error: error.message || 'Upload payload is invalid.',
    suggestion: 'Retry the upload with valid files.',
    code: 'UPLOAD_INVALID',
  });
  return true;
}
