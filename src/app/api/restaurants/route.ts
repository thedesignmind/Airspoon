import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { haversineDistance } from '@/lib/distance';
import { Restaurant } from '@/lib/types';

// Default location: Waltham, MA
const DEFAULT_LAT = 42.3765;
const DEFAULT_LNG = -71.2356;
const DEFAULT_RADIUS_KM = 25;

export async function GET(request: NextRequest) {
  try {
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

    // Fetch all restaurants
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');

    if (restaurantsError) {
      console.error('Supabase error fetching restaurants:', restaurantsError);
      return NextResponse.json(
        { error: 'Failed to fetch restaurants' },
        { status: 500 }
      );
    }

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({ restaurants: [] });
    }

    // Fetch all menu items with their dietary tags
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
      console.error('Supabase error fetching menu items:', menuError);
      // Continue without menu data rather than failing entirely
    }

    // Build a map of restaurant_id -> menu items
    const menuByRestaurant: Record<string, typeof menuItems> = {};
    if (menuItems) {
      for (const item of menuItems) {
        if (!menuByRestaurant[item.restaurant_id]) {
          menuByRestaurant[item.restaurant_id] = [];
        }
        menuByRestaurant[item.restaurant_id]!.push(item);
      }
    }

    // Calculate distances and filter by radius
    const restaurantsWithDistance = (restaurants as Restaurant[])
      .map((restaurant) => {
        const distance_km = haversineDistance(
          lat,
          lng,
          restaurant.latitude,
          restaurant.longitude
        );

        const items = menuByRestaurant[restaurant.id] ?? [];

        // Calculate match count based on filters
        let match_count: number;
        if (filters.length === 0) {
          match_count = items.length;
        } else {
          match_count = items.filter((item) => {
            const tags = (item.dietary_tags as { tag: string }[] | null) ?? [];
            return filters.every((filter) =>
              tags.some((t) => t.tag === filter)
            );
          }).length;
        }

        return {
          ...restaurant,
          distance_km: Math.round(distance_km * 10) / 10,
          match_count,
        };
      })
      .filter((r) => r.distance_km <= radius)
      // If filters active, hide restaurants with 0 matches
      .filter((r) => filters.length === 0 || r.match_count > 0)
      .sort((a, b) => a.distance_km - b.distance_km);

    return NextResponse.json({ restaurants: restaurantsWithDistance });
  } catch (err) {
    console.error('Unexpected error in /api/restaurants:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
