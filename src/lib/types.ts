export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  image_url: string | null;
  created_at: string;
  distance_km?: number;
  match_count?: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  dietary_tags?: DietaryTag[];
}

export interface DietaryTag {
  id: string;
  menu_item_id: string;
  tag: 'vegan' | 'vegetarian' | 'gluten-free';
}

export type DietaryFilter = 'vegan' | 'vegetarian' | 'gluten-free';

export interface RestaurantWithMenu extends Restaurant {
  menu_items: MenuItem[];
}

export interface ApiRestaurant extends Restaurant {
  distance_km: number;
  match_count: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
