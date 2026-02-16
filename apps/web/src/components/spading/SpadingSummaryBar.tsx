import { CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react';

interface SpadingSummaryBarProps {
  citationCount: number | null;
  verifiedCount: number | null;
  issueCount: number | null;
}

export function SpadingSummaryBar({
  citationCount,
  verifiedCount,
  issueCount,
}: SpadingSummaryBarProps) {
  const total = citationCount ?? 0;
  const verified = verifiedCount ?? 0;
  const issues = issueCount ?? 0;
  const notFound = Math.max(0, total - verified - issues);

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm">
      <div className="flex items-center gap-1.5 text-surface-600">
        <FileText className="w-4 h-4" />
        <span className="font-medium">{total}</span>
        <span>citations</span>
      </div>
      <div className="flex items-center gap-1.5 text-verified-700">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">{verified}</span>
        <span>verified</span>
      </div>
      <div className="flex items-center gap-1.5 text-warning-700">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-medium">{issues}</span>
        <span>issues</span>
      </div>
      {notFound > 0 && (
        <div className="flex items-center gap-1.5 text-error-700">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{notFound}</span>
          <span>unmatched</span>
        </div>
      )}
      {total > 0 && (
        <div className="ml-auto">
          <div className="w-32 h-2 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-verified-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((verified / total) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
