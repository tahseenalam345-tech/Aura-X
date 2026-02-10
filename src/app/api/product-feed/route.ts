import { supabase } from '@/lib/supabase';

export async function GET() {
  const baseUrl = 'https://aura-x-three.vercel.app'; // ⚠️ If you buy a domain like aurax.pk, update this later!

  const { data: products } = await supabase
    .from('products')
    .select('*');

  if (!products) {
    return new Response('No products found', { status: 404 });
  }

  const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>AURA-X Products</title>
<link>${baseUrl}</link>
<description>Luxury Timepieces in Pakistan</description>
${products.map(product => `
<item>
<g:id>${product.id}</g:id>
<g:title><![CDATA[${product.name}]]></g:title>
<g:description><![CDATA[${product.description ? product.description.slice(0, 5000) : 'Luxury Watch'}]]></g:description>
<g:link>${baseUrl}/product/${product.id}</g:link>
<g:image_link>${product.main_image}</g:image_link>
<g:brand>AURA-X</g:brand>
<g:condition>new</g:condition>
<g:availability>${(product.specs?.stock || 0) > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
<g:price>${product.price} PKR</g:price>
</item>
`).join('')}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}