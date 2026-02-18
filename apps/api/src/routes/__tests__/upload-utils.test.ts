import { describe, expect, it, vi } from 'vitest';
import multer from 'multer';
import { Readable } from 'stream';
import {
  handleMulterRouteError,
  validateUploadedFile,
  SPADING_ALLOWED_MIMES,
  SPADING_ALLOWED_EXTENSIONS,
} from '../upload-utils.js';

function createFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'sample.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('hello'),
    stream: Readable.from(Buffer.from('hello')),
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

function createMockResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json };
}

describe('validateUploadedFile', () => {
  it('rejects empty files', () => {
    const error = validateUploadedFile(createFile({ size: 0 }));
    expect(error?.status).toBe(400);
    expect(error?.body.code).toBe('EMPTY_FILE');
  });

  it('rejects unsupported files for spading constraints', () => {
    const error = validateUploadedFile(
      createFile({
        originalname: 'evidence.txt',
        mimetype: 'text/plain',
      }),
      {
        allowedMimes: SPADING_ALLOWED_MIMES,
        allowedExtensions: SPADING_ALLOWED_EXTENSIONS,
      }
    );
    expect(error?.status).toBe(400);
    expect(error?.body.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('accepts supported files', () => {
    const error = validateUploadedFile(createFile());
    expect(error).toBeNull();
  });
});

describe('handleMulterRouteError', () => {
  it('maps LIMIT_FILE_SIZE to 413', () => {
    const res = createMockResponse();
    const handled = handleMulterRouteError(
      new multer.MulterError('LIMIT_FILE_SIZE'),
      res as unknown as Parameters<typeof handleMulterRouteError>[1]
    );

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('returns false for non-multer errors', () => {
    const res = createMockResponse();
    const handled = handleMulterRouteError(new Error('boom'), res as unknown as Parameters<typeof handleMulterRouteError>[1]);

    expect(handled).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
  });
});
