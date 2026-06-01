'use client';

import { DietaryFilter } from '@/lib/types';

interface FilterBarProps {
  activeFilters: DietaryFilter[];
  onFilterChange: (filters: DietaryFilter[]) => void;
  resultCount?: number;
}

const FILTERS: { key: DietaryFilter; label: string; emoji: string; color: string }[] = [
  {
    key: 'vegan',
    label: 'Vegan',
    emoji: '🌱',
    color: 'emerald',
  },
  {
    key: 'vegetarian',
    label: 'Vegetarian',
    emoji: '🥗',
    color: 'green',
  },
  {
    key: 'gluten-free',
    label: 'Gluten-Free',
    emoji: '🌾',
    color: 'teal',
  },
];

export default function FilterBar({
  activeFilters,
  onFilterChange,
  resultCount,
}: FilterBarProps) {
  const toggleFilter = (filter: DietaryFilter) => {
    if (activeFilters.includes(filter)) {
      onFilterChange(activeFilters.filter((f) => f !== filter));
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  };

  const clearAll = () => {
    onFilterChange([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Dietary Preferences
        </h2>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label, emoji }) => {
          const isActive = activeFilters.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 select-none
                ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200'
                }
              `}
              aria-pressed={isActive}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {isActive && (
                <span className="ml-0.5 text-emerald-100">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {activeFilters.length > 0 && resultCount !== undefined && (
        <p className="mt-3 text-xs text-gray-500">
          Showing{' '}
          <span className="font-semibold text-emerald-600">{resultCount}</span>{' '}
          {resultCount === 1 ? 'restaurant' : 'restaurants'} with{' '}
          {activeFilters.map((f, i) => (
            <span key={f}>
              {i > 0 && ' + '}
              <span className="font-medium text-gray-700">{f}</span>
            </span>
          ))}{' '}
          options
        </p>
      )}
    </div>
  );
}
