'use client';

import { useState } from 'react';
import { ApiRestaurant, DietaryFilter } from '@/lib/types';
import { formatDistance } from '@/lib/distance';
import MenuItemList from './MenuItemList';

interface RestaurantCardProps {
  restaurant: ApiRestaurant;
  activeFilters: DietaryFilter[];
}

export default function RestaurantCard({ restaurant, activeFilters }: RestaurantCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const directionsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${restaurant.name}, ${restaurant.address}, ${restaurant.city}`
  )}`;

  const priceColor =
    restaurant.price_range === '$$$'
      ? 'text-amber-600'
      : restaurant.price_range === '$$'
      ? 'text-emerald-600'
      : 'text-green-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {restaurant.address}, {restaurant.city}
            </p>
          </div>

          {/* Distance badge */}
          <span className="flex-shrink-0 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
            📍 {formatDistance(restaurant.distance_km)}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {restaurant.cuisine_type && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              🍽 {restaurant.cuisine_type}
            </span>
          )}
          {restaurant.price_range && (
            <span className={`text-xs font-bold ${priceColor}`}>
              {restaurant.price_range}
            </span>
          )}

          {/* Match count badge */}
          <span
            className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              activeFilters.length > 0
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {activeFilters.length > 0 ? '✓ ' : ''}
            {restaurant.match_count}{' '}
            {activeFilters.length > 0
              ? activeFilters.join(' + ') + ' option' + (restaurant.match_count !== 1 ? 's' : '')
              : 'menu item' + (restaurant.match_count !== 1 ? 's' : '')}
          </span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-4">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            🗺 Get Directions
          </a>

          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              📞 {restaurant.phone}
            </a>
          )}

          {restaurant.match_count > 0 && (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 px-3 py-1.5 rounded-full transition-all"
            >
              {menuOpen ? 'Hide menu ▲' : 'Show menu ▼'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable menu */}
      {menuOpen && (
        <div className="border-t border-gray-100">
          <MenuItemList
            restaurantId={restaurant.id}
            activeFilters={activeFilters}
          />
        </div>
      )}
    </div>
  );
}
