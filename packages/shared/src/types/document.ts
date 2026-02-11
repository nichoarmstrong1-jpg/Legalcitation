export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'png' | 'jpg' | 'jpeg' | 'csv';
  fileSize: number;
  extractedText: string;
  pageCount?: number;
  uploadedAt: string;
}

export interface ProcessingJob {
  id: string;
  status: 'queued' | 'extracting' | 'parsing' | 'validating' | 'verifying' | 'complete' | 'error';
  progress: number;
  currentStep: string;
  documentId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
