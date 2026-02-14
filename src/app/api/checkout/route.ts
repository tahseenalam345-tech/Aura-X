import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, total, city } = body;

    // 1. GENERATE SHORT ORDER ID (e.g., ORD-7890)
    const shortId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Insert Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          id: shortId, // Ensure your 'orders' table ID column is Text, not Int (or remove this line to let DB auto-generate)
          customer_name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          city: city,
          items: items, // Stores the full JSON of cart items
          total: total,
          status: 'Processing',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (orderError) {
        console.error("Supabase Order Error:", orderError);
        throw new Error("Failed to save order to database.");
    }

    // 3. Update Stock (Decrease)
    for (const item of items) {
      // Get current stock
      const { data: product } = await supabase
        .from('products')
        .select('specs')
        .eq('id', item.id)
        .single();
        
      if (product && product.specs) {
        const currentStock = Number(product.specs.stock) || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        // Update ONLY the stock field inside the specs JSON
        const newSpecs = { ...product.specs, stock: newStock };

        await supabase
          .from('products')
          .update({ specs: newSpecs })
          .eq('id', item.id);
      }
    }

    // 4. Return Success
    // We return the actual ID from the database just in case
    return NextResponse.json({ success: true, orderId: orderData.id || shortId });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message || 'Order failed' }, { status: 500 });
  }
}