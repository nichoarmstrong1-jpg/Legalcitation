import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import type { ProjectDocument } from '../../services/api.ts';

interface DocumentUploadPanelProps {
  projectId: string;
  documents: ProjectDocument[];
  hasJournalEntry: boolean;
  onUpload: (projectId: string, files: File[], role: 'journal_entry' | 'source') => Promise<ProjectDocument[]>;
  onRemove: (projectId: string, documentId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({
  label,
  description,
  accept,
  multiple,
  uploading,
  onFiles,
}: {
  label: string;
  description: string;
  accept: string;
  multiple: boolean;
  uploading: boolean;
  onFiles: (files: File[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onFiles(files);
      e.target.value = '';
    },
    [onFiles]
  );

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
        dragOver
          ? 'border-primary-400 bg-primary-50'
          : 'border-surface-300 hover:border-primary-300 hover:bg-surface-50'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {uploading ? (
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-2" />
      ) : (
        <Upload className="w-8 h-8 text-surface-400 mb-2" />
      )}
      <span className="text-sm font-medium text-surface-700">{label}</span>
      <span className="text-xs text-surface-400 mt-1">{description}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}

export function DocumentUploadPanel({
  projectId,
  documents,
  hasJournalEntry,
  onUpload,
  onRemove,
}: DocumentUploadPanelProps) {
  const [uploadingJournal, setUploadingJournal] = useState(false);
  const [uploadingSource, setUploadingSource] = useState(false);

  const journalDocs = documents.filter(d => d.role === 'journal_entry');
  const sourceDocs = documents.filter(d => d.role === 'source');

  const handleJournalUpload = async (files: File[]) => {
    setUploadingJournal(true);
    try {
      await onUpload(projectId, [files[0]], 'journal_entry');
    } finally {
      setUploadingJournal(false);
    }
  };

  const handleSourceUpload = async (files: File[]) => {
    setUploadingSource(true);
    try {
      await onUpload(projectId, files, 'source');
    } finally {
      setUploadingSource(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Journal Entry Section */}
      <div>
        <h3 className="text-sm font-semibold text-primary-900 mb-3">Journal Entry</h3>
        {journalDocs.length > 0 ? (
          <div className="space-y-2">
            {journalDocs.map(doc => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg"
              >
                <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 truncate">{doc.fileName}</p>
                  <p className="text-xs text-surface-400">
                    {formatFileSize(doc.fileSize)}
                    {doc.pageCount ? ` - ${doc.pageCount} pages` : ''}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(projectId, doc.id)}
                  className="p-1 hover:bg-primary-100 rounded"
                >
                  <X className="w-4 h-4 text-surface-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <DropZone
            label="Upload Journal Entry"
            description="PDF or Word document - the article being spaded"
            accept=".pdf,.docx,.doc"
            multiple={false}
            uploading={uploadingJournal}
            onFiles={handleJournalUpload}
          />
        )}
      </div>

      {/* Source Documents Section */}
      <div>
        <h3 className="text-sm font-semibold text-primary-900 mb-3">
          Source Documents ({sourceDocs.length})
        </h3>
        <div className="space-y-2">
          {sourceDocs.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200 rounded-lg"
            >
              <FileText className="w-4 h-4 text-surface-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 truncate">
                  {doc.caseName || doc.fileName}
                </p>
                <p className="text-xs text-surface-400">
                  {formatFileSize(doc.fileSize)}
                  {doc.citation ? ` - ${doc.citation}` : ''}
                </p>
              </div>
              <button
                onClick={() => onRemove(projectId, doc.id)}
                className="p-1 hover:bg-surface-100 rounded"
              >
                <X className="w-4 h-4 text-surface-400" />
              </button>
            </div>
          ))}
          <DropZone
            label="Upload Source PDFs"
            description="Cases, articles, and other source materials"
            accept=".pdf,.docx,.doc"
            multiple={true}
            uploading={uploadingSource}
            onFiles={handleSourceUpload}
          />
        </div>
      </div>
    </div>
  );
}
