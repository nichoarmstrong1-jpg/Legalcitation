import type { AnnotationStatus } from '../../services/api.ts';

interface AnnotationStatusBadgeProps {
  status: AnnotationStatus;
  small?: boolean;
}

const STATUS_CONFIG: Record<AnnotationStatus, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-verified-100 text-verified-800 border-verified-300',
  },
  partial_match: {
    label: 'Partial',
    className: 'bg-warning-100 text-warning-800 border-warning-300',
  },
  format_error: {
    label: 'Format Error',
    className: 'bg-warning-100 text-warning-800 border-warning-300',
  },
  not_found: {
    label: 'Not Found',
    className: 'bg-error-100 text-error-800 border-error-300',
  },
  quote_mismatch: {
    label: 'Quote Mismatch',
    className: 'bg-error-100 text-error-800 border-error-300',
  },
  pending: {
    label: 'Pending',
    className: 'bg-surface-100 text-surface-600 border-surface-300',
  },
  error: {
    label: 'Error',
    className: 'bg-error-100 text-error-800 border-error-300',
  },
};

export function AnnotationStatusBadge({ status, small }: AnnotationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${config.className} ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {config.label}
    </span>
  );
}
