interface AnimatedCheckmarkProps {
  status: 'verified' | 'partial_match' | 'not_found' | 'pending' | 'error';
  size?: number;
}

export function AnimatedCheckmark({ status, size = 24 }: AnimatedCheckmarkProps) {
  const config = {
    verified: { stroke: '#22c55e', bg: '#f0fdf4' },
    partial_match: { stroke: '#f59e0b', bg: '#fffbeb' },
    not_found: { stroke: '#ef4444', bg: '#fef2f2' },
    pending: { stroke: '#a3a3a3', bg: '#f5f5f5' },
    error: { stroke: '#ef4444', bg: '#fef2f2' },
  };

  const { stroke, bg } = config[status] || config.pending;

  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: size + 8, height: size + 8, backgroundColor: bg }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={status === 'verified' ? 'animate-checkmark-draw' : ''}
      >
        <circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="2" opacity="0.2" />
        {status === 'verified' && (
          <path
            d="M7 12.5l3 3 7-7"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="24"
            strokeDashoffset="0"
          />
        )}
        {status === 'partial_match' && (
          <path
            d="M12 8v5M12 16h.01"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {(status === 'not_found' || status === 'error') && (
          <path
            d="M9 9l6 6M15 9l-6 6"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {status === 'pending' && (
          <path
            d="M12 8v4l2 2"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}
