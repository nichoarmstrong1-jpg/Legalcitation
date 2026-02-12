export function SkeletonCard() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Citation card skeleton */}
      <div className="card border-2 border-surface-200">
        <div className="shimmer h-3 w-28 rounded-lg mb-4" />
        <div className="p-4 bg-surface-50 rounded-xl space-y-2.5">
          <div className="shimmer h-3.5 w-full rounded-lg" />
          <div className="shimmer h-3.5 w-3/4 rounded-lg" />
        </div>
        <div className="shimmer h-11 w-full rounded-xl mt-4" />
        <div className="shimmer h-2.5 w-48 rounded-lg mt-3 mx-auto" />
      </div>

      {/* Verification badge skeleton */}
      <div className="flex items-center gap-2 px-1">
        <div className="shimmer w-4 h-4 rounded-full" />
        <div className="shimmer h-6 w-52 rounded-lg" />
      </div>

      {/* Verification steps skeleton */}
      <div className="card">
        <div className="shimmer h-3 w-44 rounded-lg" />
      </div>
    </div>
  );
}
