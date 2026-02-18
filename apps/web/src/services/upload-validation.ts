export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const COMMON_ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.doc',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.csv',
  '.tsv',
  '.text',
  '.log',
]);

const SPADING_ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc']);

function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? '';
}

export function validateFileForGenericUpload(file: File): string | null {
  if (file.size <= 0) {
    return `${file.name} is empty.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `${file.name} exceeds the 50MB upload limit.`;
  }
  if (!COMMON_ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
    return `${file.name} is not a supported file type.`;
  }
  return null;
}

export function validateCaseLibraryUpload(files: File[]): string | null {
  if (files.length === 0) {
    return 'No files selected.';
  }
  if (files.length > 10) {
    return 'You can upload up to 10 files at a time.';
  }
  for (const file of files) {
    const err = validateFileForGenericUpload(file);
    if (err) return err;
  }
  return null;
}

export function validateSpadingUpload(
  files: File[],
  role: 'journal_entry' | 'source'
): string | null {
  if (files.length === 0) {
    return 'No files selected.';
  }
  if (files.length > 20) {
    return 'You can upload up to 20 files at a time.';
  }
  if (role === 'journal_entry' && files.length > 1) {
    return 'Only one journal entry can be uploaded at a time.';
  }

  for (const file of files) {
    if (file.size <= 0) {
      return `${file.name} is empty.`;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return `${file.name} exceeds the 50MB upload limit.`;
    }
    if (!SPADING_ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
      return `${file.name} is not supported. Upload PDF or Word documents only.`;
    }
  }

  return null;
}
