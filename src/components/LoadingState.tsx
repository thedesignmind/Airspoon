export default function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-5 bg-gray-100 rounded-full w-24" />
            <div className="h-5 bg-gray-100 rounded-full w-8" />
            <div className="h-5 bg-emerald-100 rounded-full w-28 ml-auto" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-4 bg-gray-100 rounded w-28" />
            <div className="h-6 bg-gray-100 rounded-full w-24 ml-auto" />
          </div>
        </div>
      ))}
      <p className="text-center text-sm text-gray-400 animate-pulse">
        Finding restaurants near you...
      </p>
    </div>
  );
}
