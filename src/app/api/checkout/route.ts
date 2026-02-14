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

    // 1. Insert Order (Let Database generate the ID)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          // REMOVED: id: shortId (This was likely causing the crash!)
          customer_name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          city: city,
          items: items, // Make sure your 'orders' table has a JSONB column named 'items'
          total: total,
          status: 'Processing',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (orderError) {
        console.error("Supabase Insert Error:", orderError.message); // Check your terminal for this!
        throw new Error("Database failed to save order: " + orderError.message);
    }

    // 2. Update Stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('specs')
        .eq('id', item.id)
        .single();
        
      // Safe check for specs
      if (product && product.specs) {
        const currentStock = Number(product.specs.stock) || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        const newSpecs = { ...product.specs, stock: newStock };

        await supabase
          .from('products')
          .update({ specs: newSpecs })
          .eq('id', item.id);
      }
    }

    // 3. Success! Return the real Database ID
    return NextResponse.json({ success: true, orderId: orderData.id });

  } catch (error: any) {
    console.error('Checkout API Critical Error:', error);
    return NextResponse.json({ error: error.message || 'Order failed' }, { status: 500 });
  }
}