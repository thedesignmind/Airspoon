interface EmptyStateProps {
  hasFilters: boolean;
}

export default function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div className="text-5xl mb-4">{hasFilters ? '🔍' : '🍽'}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No restaurants found
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        {hasFilters
          ? 'No restaurants have menu items matching your selected dietary preferences. Try adjusting your filters.'
          : 'No restaurants were found near your location. Try expanding your search radius.'}
      </p>
    </div>
  );
}
