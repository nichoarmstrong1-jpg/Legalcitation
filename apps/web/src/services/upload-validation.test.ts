import { describe, expect, it } from 'vitest';
import {
  MAX_UPLOAD_BYTES,
  validateCaseLibraryUpload,
  validateFileForGenericUpload,
  validateSpadingUpload,
} from './upload-validation.js';

function createFile(name: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type: 'application/octet-stream' });
}

describe('validateFileForGenericUpload', () => {
  it('rejects empty files', () => {
    const error = validateFileForGenericUpload(createFile('empty.pdf', 0));
    expect(error).toContain('empty');
  });

  it('rejects unsupported extensions', () => {
    const error = validateFileForGenericUpload(createFile('malware.exe', 5));
    expect(error).toContain('supported file type');
  });

  it('accepts supported files under max size', () => {
    const error = validateFileForGenericUpload(createFile('brief.pdf', 1024));
    expect(error).toBeNull();
  });

  it('rejects files above size limit', () => {
    const error = validateFileForGenericUpload(createFile('large.pdf', MAX_UPLOAD_BYTES + 1));
    expect(error).toContain('50MB');
  });
});

describe('validateCaseLibraryUpload', () => {
  it('rejects more than 10 files', () => {
    const files = Array.from({ length: 11 }, (_, idx) => createFile(`doc-${idx}.pdf`, 10));
    const error = validateCaseLibraryUpload(files);
    expect(error).toContain('up to 10');
  });
});

describe('validateSpadingUpload', () => {
  it('rejects multiple journal entries in a single upload', () => {
    const files = [createFile('j1.pdf', 10), createFile('j2.pdf', 10)];
    const error = validateSpadingUpload(files, 'journal_entry');
    expect(error).toContain('Only one journal entry');
  });

  it('rejects non-pdf/doc files for spading', () => {
    const error = validateSpadingUpload([createFile('source.txt', 10)], 'source');
    expect(error).toContain('Upload PDF or Word documents');
  });
});
