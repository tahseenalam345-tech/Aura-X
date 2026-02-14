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

    // 1. Insert Order (We removed the 'id' field so the Database handles it automatically)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
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
        throw new Error("Failed to save order to database.");
    }

    // 2. Update Stock
    for (const item of items) {
      const { data: product } = await supabase.from('products').select('specs').eq('id', item.id).single();
      if (product?.specs) {
        const newStock = Math.max(0, (Number(product.specs.stock) || 0) - item.quantity);
        await supabase.from('products').update({ specs: { ...product.specs, stock: newStock } }).eq('id', item.id);
      }
    }

    return NextResponse.json({ success: true, orderId: orderData.id });

  } catch (error: any) {
    console.error('Checkout Critical Error:', error);
    return NextResponse.json({ error: error.message || 'Order failed' }, { status: 500 });
  }
}