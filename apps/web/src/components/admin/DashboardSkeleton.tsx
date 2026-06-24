export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-white/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-3xl bg-white/50 xl:col-span-2" />
        <div className="h-80 rounded-3xl bg-white/50" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 rounded-3xl bg-white/50" />
        ))}
      </div>
      <div className="h-96 rounded-3xl bg-white/50" />
    </div>
  );
}
