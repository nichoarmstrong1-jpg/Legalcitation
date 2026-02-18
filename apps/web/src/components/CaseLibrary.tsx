import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, FileText, Trash2, Hammer, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadCaseDocuments, getCaseDocuments, deleteCaseDocument, type CaseDocument } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { validateCaseLibraryUpload } from '../services/upload-validation.ts';

interface CaseLibraryProps {
  onBuildCitation: (input: string) => void;
  onViewSource: (docId: string) => void;
  onAuthOpen?: (message?: string) => void;
}

export function CaseLibrary({ onBuildCitation, onViewSource, onAuthOpen }: CaseLibraryProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCaseDocuments();
      setDocuments(data.documents);
      setLoaded(true);
    } catch {
      // Silently fail — user may not have DB configured
    }
  }, [user]);

  useEffect(() => {
    if (isExpanded && !loaded) {
      loadDocuments();
    }
  }, [isExpanded, loaded, loadDocuments]);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    if (!user) {
      showToast('Sign in to upload case documents', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const validationError = validateCaseLibraryUpload(fileArray);
      if (validationError) {
        showToast(validationError, 'error');
        return;
      }
      const data = await uploadCaseDocuments(fileArray);
      setDocuments(prev => [...data.documents, ...prev]);
      showToast(`${data.documents.length} document(s) uploaded`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [user, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteCaseDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      showToast('Document removed', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }, [showToast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  }, [handleUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) {
    return (
      <div className="card border border-surface-200 mt-6 text-center py-8">
        <FileText className="w-8 h-8 text-surface-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-primary-900 mb-1">Case Library</h3>
        <p className="text-xs text-surface-500 mb-4 max-w-xs mx-auto">
          Sign in to upload and manage your case documents for quick citation building.
        </p>
        <button
          onClick={() => onAuthOpen?.('Sign in to access your case library')}
          className="px-4 py-2 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          Sign In to Access
        </button>
      </div>
    );
  }

  return (
    <div className="card border border-surface-200 mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-900">Case Library</span>
          {documents.length > 0 && (
            <span className="text-[10px] font-medium bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-md">
              {documents.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-surface-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-surface-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Upload area */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 cursor-pointer ${
              isDragging ? 'border-primary-500 bg-primary-50' : 'border-surface-300 hover:border-surface-400 hover:bg-surface-50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={onFileSelect}
            />
            <Upload className="w-5 h-5 text-surface-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-surface-600">
              {isUploading ? 'Uploading...' : 'Drop case PDFs here or click to upload'}
            </p>
            <p className="text-[10px] text-surface-400 mt-0.5">PDF, DOCX, TXT (up to 10 files)</p>
          </div>

          {/* Document list */}
          {documents.length === 0 && loaded && (
            <p className="text-xs text-surface-400 text-center py-2">
              No documents yet. Upload case PDFs to build your library.
            </p>
          )}

          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-surface-100 hover:border-surface-200 hover:bg-surface-50/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-surface-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-900 truncate">
                  {doc.caseName || doc.fileName}
                </p>
                {doc.citation && (
                  <p className="text-[11px] font-serif text-surface-500 truncate mt-0.5">{doc.citation}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-[10px] text-surface-400">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  {doc.pageCount && <span>&middot; {doc.pageCount} pages</span>}
                  <span>&middot; {formatDate(doc.uploadedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onViewSource(doc.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  title="View source text"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuildCitation(doc.caseName || doc.citation || doc.fileName);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-verified-600 hover:bg-verified-50 transition-colors"
                  title="Build citation"
                >
                  <Hammer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
