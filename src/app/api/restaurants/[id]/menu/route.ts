import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase } = await import('@/lib/supabase');

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const filters = searchParams.get('filters')?.split(',').filter(Boolean) ?? [];

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Fetch menu items with dietary tags for the restaurant
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        restaurant_id,
        name,
        description,
        price,
        image_url,
        created_at,
        dietary_tags (
          id,
          menu_item_id,
          tag
        )
      `)
      .eq('restaurant_id', id);

    if (error) {
      console.error('Supabase error fetching menu items:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch menu items', detail: error.message },
        { status: 500 }
      );
    }

    if (!menuItems) {
      return NextResponse.json({ menu_items: [] });
    }

    // Filter by dietary tags if filters are provided
    let filteredItems = menuItems;
    if (filters.length > 0) {
      filteredItems = menuItems.filter((item) => {
        const tags = (item.dietary_tags as { tag: string }[] | null) ?? [];
        return filters.every((filter) => tags.some((t) => t.tag === filter));
      });
    }

    return NextResponse.json({ menu_items: filteredItems });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in /api/restaurants/[id]/menu:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
