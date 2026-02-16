import { FileText, Trash2, CheckCircle, AlertTriangle, Clock, Loader2, XCircle } from 'lucide-react';
import type { SpadingProject } from '../../services/api.ts';

interface ProjectCardProps {
  project: SpadingProject;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_ICONS = {
  draft: Clock,
  processing: Loader2,
  completed: CheckCircle,
  error: XCircle,
};

const STATUS_COLORS = {
  draft: 'text-surface-400',
  processing: 'text-primary-500 animate-spin',
  completed: 'text-verified-600',
  error: 'text-error-600',
};

const STATUS_LABELS = {
  draft: 'Draft',
  processing: 'Processing...',
  completed: 'Complete',
  error: 'Error',
};

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const StatusIcon = STATUS_ICONS[project.status];

  return (
    <button
      onClick={() => onOpen(project.id)}
      className="w-full text-left card hover:shadow-md transition-shadow p-4 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500 shrink-0" />
          <h3 className="font-medium text-primary-900 line-clamp-1">{project.name}</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="p-1 hover:bg-error-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete project"
        >
          <Trash2 className="w-4 h-4 text-error-500" />
        </button>
      </div>

      {project.description && (
        <p className="text-sm text-surface-500 mt-1 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
        <div className="flex items-center gap-1.5 text-xs">
          <StatusIcon className={`w-3.5 h-3.5 ${STATUS_COLORS[project.status]}`} />
          <span className="text-surface-500">{STATUS_LABELS[project.status]}</span>
        </div>

        {project.status === 'completed' && project.citationCount != null && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-verified-600">
              <CheckCircle className="w-3 h-3" />
              {project.verifiedCount ?? 0}
            </span>
            {(project.issueCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-warning-600">
                <AlertTriangle className="w-3 h-3" />
                {project.issueCount}
              </span>
            )}
          </div>
        )}

        {project.status === 'processing' && project.progress != null && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-xs text-surface-400">{project.progress}%</span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-surface-400 mt-2">
        {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </button>
  );
}
