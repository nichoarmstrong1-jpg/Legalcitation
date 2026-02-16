import { Loader2 } from 'lucide-react';
import type { SpadingProgressEvent } from '../../services/api.ts';

interface SpadingProgressProps {
  progress: SpadingProgressEvent | null;
  projectProgress: number;
  currentStep: string | null;
}

export function SpadingProgress({
  progress,
  projectProgress,
  currentStep,
}: SpadingProgressProps) {
  const pct = progress?.progress ?? projectProgress ?? 0;
  const step = progress?.currentStep ?? currentStep ?? 'Starting...';
  const citationInfo =
    progress?.totalCitations != null && progress?.citationIndex != null
      ? `${progress.citationIndex}/${progress.totalCitations} citations`
      : null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
        <h3 className="font-medium text-primary-900">Spading in Progress</h3>
      </div>

      <div className="space-y-3">
        <div className="w-full h-3 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">{step}</span>
          <span className="text-surface-400 font-medium">{pct}%</span>
        </div>

        {citationInfo && (
          <p className="text-xs text-surface-400">{citationInfo}</p>
        )}
      </div>
    </div>
  );
}
