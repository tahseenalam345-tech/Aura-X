import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase (Use Service Role Key for Admin privileges to update stock)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ IMPORTANT: Must use SERVICE_ROLE_KEY from .env
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, total, city } = body;

    // 1. Validate Stock First (Double Check)
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('specs')
        .eq('id', item.id)
        .single();

      const currentStock = product?.specs?.stock || 0;

      if (currentStock < item.quantity) {
        return NextResponse.json(
          { error: `Sorry, ${item.name} is out of stock.` },
          { status: 400 }
        );
      }
    }

    // 2. Create the Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          city: city,
          items: items, // Save full cart JSON
          total: total,
          status: 'Processing'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. THE MAGIC: Decrease Stock for each item
    for (const item of items) {
      // Fetch current stock again to be safe
      const { data: product } = await supabase
        .from('products')
        .select('specs')
        .eq('id', item.id)
        .single();
        
      if (product) {
        const newStock = Math.max(0, (product.specs.stock || 0) - item.quantity);
        
        // Update the JSONB specs column with new stock
        const newSpecs = { ...product.specs, stock: newStock };

        await supabase
          .from('products')
          .update({ specs: newSpecs })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({ success: true, orderId: orderData.id });

  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Order failed' }, { status: 500 });
  }
}