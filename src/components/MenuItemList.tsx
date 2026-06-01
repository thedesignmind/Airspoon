'use client';

import { useState, useEffect } from 'react';
import { MenuItem, DietaryFilter } from '@/lib/types';

interface MenuItemListProps {
  restaurantId: string;
  activeFilters: DietaryFilter[];
}

const TAG_COLORS: Record<string, string> = {
  vegan: 'bg-emerald-100 text-emerald-700',
  vegetarian: 'bg-green-100 text-green-700',
  'gluten-free': 'bg-teal-100 text-teal-700',
};

const TAG_LABELS: Record<string, string> = {
  vegan: '🌱 Vegan',
  vegetarian: '🥗 Vegetarian',
  'gluten-free': '🌾 Gluten-Free',
};

export default function MenuItemList({ restaurantId, activeFilters }: MenuItemListProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilters.length > 0) {
      params.set('filters', activeFilters.join(','));
    }
    fetch(`/api/restaurants/${restaurantId}/menu?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.menu_items ?? []);
      })
      .catch(() => {
        setError('Failed to load menu items');
      })
      .finally(() => setLoading(false));
  }, [restaurantId, activeFilters]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-400 animate-pulse">
        Loading menu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">{error}</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400 italic">
        No matching menu items found.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-50">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 px-5 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 text-sm">{item.name}</span>
              {item.dietary_tags &&
                item.dietary_tags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      TAG_COLORS[tag.tag] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {TAG_LABELS[tag.tag] ?? tag.tag}
                  </span>
                ))}
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          {item.price != null && (
            <span className="flex-shrink-0 text-sm font-semibold text-emerald-600">
              ${item.price.toFixed(2)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
