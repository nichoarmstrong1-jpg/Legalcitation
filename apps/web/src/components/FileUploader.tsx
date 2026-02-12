import { useState, useRef, useCallback } from 'react';
import { uploadFile } from '../services/api.ts';

interface FileUploaderProps {
  onTextExtracted: (text: string, fileName: string) => void;
  compact?: boolean;
}

export function FileUploader({ onTextExtracted, compact = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const data = await uploadFile(file);
      onTextExtracted(data.extractedText, data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [onTextExtracted]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-secondary text-sm shrink-0"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Upload File'}
        </button>
        <span className="text-xs text-surface-400">PDF, DOCX, DOC, RTF, TXT, HTML, CSV, Images, and more</span>
        <input ref={inputRef} type="file" className="hidden" onChange={onFileSelect} />
        {error && <span className="text-xs text-error-500">{error}</span>}
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer ${
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-surface-300 hover:border-surface-400 hover:bg-surface-50'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={onFileSelect} />
      <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">&#128196;</span>
      </div>
      <p className="font-medium text-surface-700">
        {isProcessing ? 'Processing file...' : 'Drop a file here or click to upload'}
      </p>
      <p className="text-sm text-surface-400 mt-1">PDF, DOCX, DOC, RTF, TXT, HTML, CSV, Images, and more (max 50MB)</p>
      {error && <p className="text-sm text-error-500 mt-2">{error}</p>}
    </div>
  );
}
