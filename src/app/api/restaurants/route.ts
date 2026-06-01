import { NextRequest, NextResponse } from 'next/server';
import { haversineDistance } from '@/lib/distance';
import { Restaurant } from '@/lib/types';

const DEFAULT_LAT = 42.3765;
const DEFAULT_LNG = -71.2356;
const DEFAULT_RADIUS_KM = 25;

interface RawMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  dietary_tags: { id: string; tag: string }[];
}

export async function GET(request: NextRequest) {
  try {
    // Import lazily so missing env vars throw inside the try/catch
    const { supabase } = await import('@/lib/supabase');

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') ?? String(DEFAULT_LAT));
    const lng = parseFloat(searchParams.get('lng') ?? String(DEFAULT_LNG));
    const radius = parseFloat(searchParams.get('radius') ?? String(DEFAULT_RADIUS_KM));
    const filters = searchParams.get('filters')?.split(',').filter(Boolean) ?? [];

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid lat/lng parameters' },
        { status: 400 }
      );
    }

    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');

    if (restaurantsError) {
      console.error('Supabase error fetching restaurants:', restaurantsError);
      return NextResponse.json(
        { error: 'Failed to fetch restaurants', detail: restaurantsError.message },
        { status: 500 }
      );
    }

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({ restaurants: [] });
    }

    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id,
        restaurant_id,
        name,
        description,
        price,
        image_url,
        dietary_tags (
          id,
          tag
        )
      `);

    if (menuError) {
      console.error('Supabase error fetching menu items:', menuError.message);
      // Non-fatal — continue with zero menu counts
    }

    const menuByRestaurant: Record<string, RawMenuItem[]> = {};
    for (const item of (menuItems ?? []) as RawMenuItem[]) {
      if (!menuByRestaurant[item.restaurant_id]) {
        menuByRestaurant[item.restaurant_id] = [];
      }
      menuByRestaurant[item.restaurant_id].push(item);
    }

    const restaurantsWithDistance = (restaurants as Restaurant[])
      .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number')
      .map((restaurant) => {
        const distance_km = haversineDistance(
          lat,
          lng,
          restaurant.latitude,
          restaurant.longitude
        );

        const items = menuByRestaurant[restaurant.id] ?? [];

        const match_count =
          filters.length === 0
            ? items.length
            : items.filter((item) =>
                filters.every((filter) =>
                  item.dietary_tags.some((t) => t.tag === filter)
                )
              ).length;

        return {
          ...restaurant,
          distance_km: Math.round(distance_km * 10) / 10,
          match_count,
        };
      })
      .filter((r) => r.distance_km <= radius)
      .filter((r) => filters.length === 0 || r.match_count > 0)
      .sort((a, b) => a.distance_km - b.distance_km);

    return NextResponse.json({ restaurants: restaurantsWithDistance });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in /api/restaurants:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
