'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import FilterBar from '@/components/FilterBar';
import RestaurantCard from '@/components/RestaurantCard';
import LocationPermission from '@/components/LocationPermission';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { ApiRestaurant, DietaryFilter, UserLocation } from '@/lib/types';

const DEFAULT_LOCATION: UserLocation = {
  lat: 42.3765,
  lng: -71.2356,
};

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export default function HomePage() {
  const t = useTranslations();

  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string>('');

  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(
    async (location: UserLocation, filters: DietaryFilter[]) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: String(location.lat),
          lng: String(location.lng),
        });
        if (filters.length > 0) {
          params.set('filters', filters.join(','));
        }
        const res = await fetch(`/api/restaurants?${params}`);
        if (!res.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await res.json();
        setRestaurants(data.restaurants ?? []);
      } catch (err) {
        console.error(err);
        setError(t('errors.loadingRestaurants'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const handleAllowLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setLocationStatus('granted');
        setLocationMessage(t('location.usingLocation'));
        fetchRestaurants(loc, activeFilters);
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
        setLocationStatus('denied');
        setLocationMessage(t('location.error'));
        fetchRestaurants(DEFAULT_LOCATION, activeFilters);
      }
    );
  };

  const handleSkipLocation = () => {
    setUserLocation(DEFAULT_LOCATION);
    setLocationStatus('denied');
    setLocationMessage(t('location.defaultLocation'));
    fetchRestaurants(DEFAULT_LOCATION, activeFilters);
  };

  const handleFilterChange = (filters: DietaryFilter[]) => {
    setActiveFilters(filters);
    const loc = userLocation ?? DEFAULT_LOCATION;
    fetchRestaurants(loc, filters);
  };

  // Auto-request location on first load
  useEffect(() => {
    if (locationStatus === 'idle') {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setUserLocation(DEFAULT_LOCATION);
        setLocationStatus('denied');
        setLocationMessage(t('location.defaultLocation'));
        fetchRestaurants(DEFAULT_LOCATION, []);
      }
      // Otherwise show the permission UI
    }
  }, [locationStatus, t, fetchRestaurants]);

  const showPermissionPrompt =
    locationStatus === 'idle' || locationStatus === 'requesting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥄</span>
            <span className="text-xl font-bold text-emerald-700">
              {t('app.title')}
            </span>
          </div>
          {locationMessage && (
            <span className="text-xs text-gray-500 hidden sm:block">
              {locationStatus === 'granted' ? '📍' : '📌'} {locationMessage}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Hero tagline */}
        <div className="text-center pt-2 pb-1">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('app.tagline')}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('app.description')}</p>
        </div>

        {/* Location permission prompt */}
        {showPermissionPrompt && (
          <LocationPermission
            isRequesting={locationStatus === 'requesting'}
            onAllow={handleAllowLocation}
            onSkip={handleSkipLocation}
          />
        )}

        {/* Main content after location decision */}
        {!showPermissionPrompt && (
          <>
            {/* Location status message on mobile */}
            {locationMessage && (
              <div className="sm:hidden text-center text-xs text-gray-500">
                {locationStatus === 'granted' ? '📍' : '📌'} {locationMessage}
              </div>
            )}

            {/* Filter bar */}
            <FilterBar
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              resultCount={restaurants.length}
            />

            {/* Restaurant list */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {t('restaurants.nearby')}
              </h2>

              {loading && <LoadingState />}

              {!loading && error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              {!loading && !error && restaurants.length === 0 && (
                <EmptyState hasFilters={activeFilters.length > 0} />
              )}

              {!loading && !error && restaurants.length > 0 && (
                <div className="space-y-4">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      activeFilters={activeFilters}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="mt-12 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Airspoon · Find food your way
      </footer>
    </div>
  );
}
