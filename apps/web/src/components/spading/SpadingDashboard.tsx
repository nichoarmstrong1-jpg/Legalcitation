import { useEffect, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSpading } from '../../hooks/useSpading.ts';
import { ProjectCard } from './ProjectCard.tsx';
import { CreateProjectModal } from './CreateProjectModal.tsx';
import { ProjectWorkspace } from './ProjectWorkspace.tsx';
import { trackEvent } from '../../services/analytics.ts';

interface SpadingDashboardProps {
  onAuthOpen: (message?: string) => void;
}

export function SpadingDashboard({ onAuthOpen }: SpadingDashboardProps) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const spading = useSpading();

  useEffect(() => {
    if (user) {
      spading.loadProjects();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="card text-center py-16">
        <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-primary-900 mb-2">Journal Spading</h2>
        <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">
          Automate citation verification for journal articles. Upload your article and source
          documents, and get an interactive annotated view with every citation checked.
        </p>
        <button
          onClick={() => onAuthOpen('Sign in to start spading journal articles')}
          className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
        >
          Sign In to Get Started
        </button>
      </div>
    );
  }

  // If a project is open, show the workspace
  if (spading.activeProject) {
    return (
      <ProjectWorkspace
        project={spading.activeProject}
        documents={spading.documents}
        annotations={spading.annotations}
        selectedAnnotation={spading.selectedAnnotation}
        progress={spading.progress}
        error={spading.error}
        onBack={spading.closeProject}
        onUpload={spading.uploadDocuments}
        onRemoveDocument={spading.removeDocument}
        onStartSpading={spading.startSpading}
        onSelectAnnotation={spading.setSelectedAnnotation}
        onResolve={(annId, resolved) =>
          spading.editAnnotation(spading.activeProject!.id, annId, { resolved })
        }
        onNote={(annId, note) =>
          spading.editAnnotation(spading.activeProject!.id, annId, { editorNote: note })
        }
      />
    );
  }

  // Project list view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary-900">Journal Spading</h2>
          <p className="text-sm text-surface-500 mt-1">
            Automated citation verification for journal articles
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {spading.error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
          {spading.error}
        </div>
      )}

      {spading.loading ? (
        <div className="text-center py-16 text-surface-400">Loading projects...</div>
      ) : spading.projects.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 mb-4">No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spading.projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={spading.openProject}
              onDelete={spading.removeProject}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (name, desc) => {
            const project = await spading.createProject(name, desc);
            trackEvent('spading_project_create', { projectName: name });
            spading.openProject(project.id);
          }}
        />
      )}
    </div>
  );
}
