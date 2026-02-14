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

    // 1. GENERATE SHORT READABLE CODE (e.g. ORD-58291)
    // We will save this in your 'order_code' column
    const shortCode = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // 2. Insert Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_code: shortCode, // Saving to the column you mentioned
          customer_name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          city: city,
          items: items, 
          total: total,
          status: 'Processing',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (orderError) {
        console.error("Database Error:", orderError.message);
        throw new Error("Failed to save order.");
    }

    // 3. Update Stock
    for (const item of items) {
      const { data: product } = await supabase.from('products').select('specs').eq('id', item.id).single();
      if (product?.specs) {
        const newStock = Math.max(0, (Number(product.specs.stock) || 0) - item.quantity);
        await supabase.from('products').update({ specs: { ...product.specs, stock: newStock } }).eq('id', item.id);
      }
    }

    // 4. Return the SHORT CODE (ORD-XXXXX) to the frontend
    return NextResponse.json({ success: true, orderId: shortCode });

  } catch (error: any) {
    console.error('Checkout Critical Error:', error);
    return NextResponse.json({ error: error.message || 'Order failed' }, { status: 500 });
  }
}