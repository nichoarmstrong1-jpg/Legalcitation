import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import type {
  SpadingProject,
  ProjectDocument,
  SpadingAnnotation,
  SpadingProgressEvent,
} from '../../services/api.ts';
import { getProjectDocument } from '../../services/api.ts';
import { DocumentUploadPanel } from './DocumentUploadPanel.tsx';
import { SpadingProgress } from './SpadingProgress.tsx';
import { SpadingSummaryBar } from './SpadingSummaryBar.tsx';
import { SplitView } from './SplitView.tsx';

interface ProjectWorkspaceProps {
  project: SpadingProject;
  documents: ProjectDocument[];
  annotations: SpadingAnnotation[];
  selectedAnnotation: SpadingAnnotation | null;
  progress: SpadingProgressEvent | null;
  error: string | null;
  onBack: () => void;
  onUpload: (projectId: string, files: File[], role: 'journal_entry' | 'source') => Promise<ProjectDocument[]>;
  onRemoveDocument: (projectId: string, documentId: string) => void;
  onStartSpading: (projectId: string) => void;
  onSelectAnnotation: (annotation: SpadingAnnotation | null) => void;
  onResolve: (annotationId: string, resolved: boolean) => void;
  onNote: (annotationId: string, note: string) => void;
}

export function ProjectWorkspace({
  project,
  documents,
  annotations,
  selectedAnnotation,
  progress,
  error,
  onBack,
  onUpload,
  onRemoveDocument,
  onStartSpading,
  onSelectAnnotation,
  onResolve,
  onNote,
}: ProjectWorkspaceProps) {
  const [viewingSourceAnnotation, setViewingSourceAnnotation] = useState<SpadingAnnotation | null>(null);

  const handleSelectAnnotation = useCallback(
    (ann: SpadingAnnotation) => {
      onSelectAnnotation(ann);
      // Auto-open PDF if this annotation has a matched source
      if (ann.matchedDocumentId) {
        setViewingSourceAnnotation(ann);
      }
    },
    [onSelectAnnotation]
  );
  const isProcessing = project.status === 'processing';
  const isCompleted = project.status === 'completed';
  const canRun = project.journalDocumentId != null && !isProcessing;

  const [journalText, setJournalText] = useState<string>('');

  // Clear stale state when switching projects
  useEffect(() => {
    setJournalText('');
    setViewingSourceAnnotation(null);
  }, [project.id]);

  // Load journal text when project opens
  useEffect(() => {
    if (!project.journalDocumentId) return;

    let cancelled = false;
    getProjectDocument(project.id, project.journalDocumentId)
      .then(doc => {
        if (!cancelled) {
          setJournalText(doc.extractedText);
        }
      })
      .catch(() => {
        // Silently fail — journal text just won't render
      });

    return () => { cancelled = true; };
  }, [project.id, project.journalDocumentId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-surface-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-surface-500" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-primary-900">{project.name}</h2>
          {project.description && (
            <p className="text-sm text-surface-500">{project.description}</p>
          )}
        </div>
        {canRun && (
          <button
            onClick={() => onStartSpading(project.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
          >
            <Play className="w-4 h-4" />
            {project.status === 'completed' ? 'Re-run Spading' : 'Run Spading'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
          {error}
        </div>
      )}

      {project.errorMessage && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
          {project.errorMessage}
        </div>
      )}

      {/* Document Upload (always shown when not processing) */}
      {!isProcessing && (
        <DocumentUploadPanel
          projectId={project.id}
          documents={documents}
          hasJournalEntry={!!project.journalDocumentId}
          onUpload={onUpload}
          onRemove={onRemoveDocument}
        />
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <SpadingProgress
          progress={progress}
          projectProgress={project.progress ?? 0}
          currentStep={project.currentStep}
        />
      )}

      {/* Results */}
      {isCompleted && annotations.length > 0 && (
        <>
          <SpadingSummaryBar
            citationCount={project.citationCount}
            verifiedCount={project.verifiedCount}
            issueCount={project.issueCount}
          />

          <SplitView
            projectId={project.id}
            journalText={journalText}
            annotations={annotations}
            selectedAnnotation={selectedAnnotation}
            onSelectAnnotation={handleSelectAnnotation}
            onResolve={onResolve}
            onNote={onNote}
            onClosePdf={() => setViewingSourceAnnotation(null)}
            viewingSourceAnnotation={viewingSourceAnnotation}
          />
        </>
      )}

      {isCompleted && annotations.length === 0 && (
        <div className="card text-center py-10 text-surface-500">
          No citations were found in the journal entry.
        </div>
      )}
    </div>
  );
}
