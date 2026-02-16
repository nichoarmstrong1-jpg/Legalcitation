import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  SpadingProject,
  ProjectDocument,
  SpadingAnnotation,
  SpadingProgressEvent,
} from '../services/api.ts';
import {
  createSpadingProject,
  getSpadingProjects,
  getSpadingProject,
  deleteSpadingProject,
  uploadProjectDocuments,
  getProjectDocuments,
  deleteProjectDocument,
  runSpading,
  getSpadingAnnotations,
  updateSpadingAnnotation,
  subscribeSpadingProgress,
} from '../services/api.ts';

export function useSpading() {
  const [projects, setProjects] = useState<SpadingProject[]>([]);
  const [activeProject, setActiveProject] = useState<SpadingProject | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [annotations, setAnnotations] = useState<SpadingAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<SpadingAnnotation | null>(null);
  const [progress, setProgress] = useState<SpadingProgressEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSpadingProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, description?: string) => {
    try {
      setError(null);
      const project = await createSpadingProject(name, description);
      setProjects(prev => [project, ...prev]);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  }, []);

  const openProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedAnnotation(null);
      setProgress(null);

      const [project, docs] = await Promise.all([
        getSpadingProject(projectId),
        getProjectDocuments(projectId),
      ]);

      setActiveProject(project);
      setDocuments(docs);

      if (project.status === 'completed') {
        const anns = await getSpadingAnnotations(projectId);
        setAnnotations(anns);
      } else if (project.status === 'processing') {
        // Subscribe to progress
        subscribeToProgress(projectId);
      } else {
        setAnnotations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open project');
    } finally {
      setLoading(false);
    }
  }, []);

  const closeProject = useCallback(() => {
    setActiveProject(null);
    setDocuments([]);
    setAnnotations([]);
    setSelectedAnnotation(null);
    setProgress(null);
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  const removeProject = useCallback(async (projectId: string) => {
    try {
      setError(null);
      await deleteSpadingProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (activeProject?.id === projectId) {
        closeProject();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  }, [activeProject, closeProject]);

  const uploadDocuments = useCallback(async (
    projectId: string,
    files: File[],
    role: 'journal_entry' | 'source'
  ) => {
    try {
      setError(null);
      const result = await uploadProjectDocuments(projectId, files, role);
      setDocuments(prev => [...result.documents, ...prev]);

      // Refresh the project to get updated journalDocumentId
      const updated = await getSpadingProject(projectId);
      setActiveProject(updated);

      return result.documents;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
      throw err;
    }
  }, []);

  const removeDocument = useCallback(async (projectId: string, documentId: string) => {
    try {
      setError(null);
      await deleteProjectDocument(projectId, documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));

      // Refresh the project
      const updated = await getSpadingProject(projectId);
      setActiveProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  }, []);

  const startSpading = useCallback(async (projectId: string) => {
    try {
      setError(null);
      setAnnotations([]);
      setSelectedAnnotation(null);
      await runSpading(projectId);

      // Update project status locally
      setActiveProject(prev =>
        prev ? { ...prev, status: 'processing' as const, progress: 0 } : null
      );

      // Subscribe to progress updates
      subscribeToProgress(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start spading');
    }
  }, []);

  const subscribeToProgress = useCallback((projectId: string) => {
    // Clean up any existing subscription
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    const cleanup = subscribeSpadingProgress(projectId, async (event) => {
      setProgress(event);

      // Update project progress
      setActiveProject(prev =>
        prev
          ? {
              ...prev,
              progress: event.progress,
              currentStep: event.currentStep,
              status: event.status === 'completed' ? 'completed' : event.status === 'error' ? 'error' : 'processing',
            }
          : null
      );

      // When completed, load annotations
      if (event.status === 'completed') {
        try {
          const [anns, project] = await Promise.all([
            getSpadingAnnotations(projectId),
            getSpadingProject(projectId),
          ]);
          setAnnotations(anns);
          setActiveProject(project);
        } catch {
          // Non-critical — user can refresh
        }
      }
    });

    cleanupRef.current = cleanup;
  }, []);

  const editAnnotation = useCallback(async (
    projectId: string,
    annotationId: string,
    data: { editorNote?: string; resolved?: boolean }
  ) => {
    try {
      setError(null);
      const updated = await updateSpadingAnnotation(projectId, annotationId, data);
      setAnnotations(prev =>
        prev.map(a => (a.id === annotationId ? updated : a))
      );
      if (selectedAnnotation?.id === annotationId) {
        setSelectedAnnotation(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update annotation');
    }
  }, [selectedAnnotation]);

  // Clean up SSE subscription on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    projects,
    activeProject,
    documents,
    annotations,
    selectedAnnotation,
    progress,
    loading,
    error,
    loadProjects,
    createProject,
    openProject,
    closeProject,
    removeProject,
    uploadDocuments,
    removeDocument,
    startSpading,
    setSelectedAnnotation,
    editAnnotation,
    setError,
  };
}
