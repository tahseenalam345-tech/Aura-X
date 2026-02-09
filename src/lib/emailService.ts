import emailjs from '@emailjs/browser';

// --- YOUR CREDENTIALS ---
const SERVICE_ID = "service_wfw89r5"; 
const TEMPLATE_ID = "template_ccsvo5z";
const PUBLIC_KEY = "OQmFriQxX0btmE7W3";

export const sendOrderEmails = async (order: any) => {
  
  // 1. CALCULATE DETAILS
  let itemsHtml = "";
  let subtotal = 0;

  order.items.forEach((item: any) => {
    const itemTotal = (item.price + (item.isGift ? 150 : 0) + (item.addBox ? 100 : 0)) * item.quantity;
    subtotal += itemTotal;

    // Build the item string
    itemsHtml += `- ${item.name} (${item.color || "Std"}) x${item.quantity}\n`;
    itemsHtml += `  Price: Rs ${item.price.toLocaleString()}\n`;
    
    // Add Extras if they exist
    if (item.isGift) itemsHtml += `  + Gift Wrap: Rs 150\n`;
    if (item.addBox) itemsHtml += `  + Premium Box: Rs 100\n`;
    
    itemsHtml += `  Item Total: Rs ${itemTotal.toLocaleString()}\n\n`;
  });

  // Calculate Shipping (Total - Subtotal)
  const shippingCost = order.total - subtotal;
  const shippingText = shippingCost > 0 ? `Rs ${shippingCost}` : "Free";

  // Create the Final Summary Block
  const finalSummary = `${itemsHtml}------------------------------------------
Subtotal: Rs ${subtotal.toLocaleString()}
Shipping: ${shippingText}`;

  // --- EMAIL 1: TO ADMIN (YOU) ---
  const adminParams = {
    to_email: "tahseenalam345@gmail.com",
    email_subject: `New Order #${order.order_code} Received 🚨`,
    email_heading: "You have a new order!",
    email_message: "Please check the admin panel to process this order.",
    order_id: order.order_code,
    customer_name: order.customer_name,
    phone: order.phone,
    city: order.city,
    address: order.address,
    order_items: finalSummary, // Passing the detailed list here
    total_amount: order.total.toLocaleString(),
  };

  try {
    // Send to Admin
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, adminParams, PUBLIC_KEY);

    // --- EMAIL 2: TO CUSTOMER (If email exists) ---
    if (order.email) {
        const customerParams = {
            ...adminParams, 
            to_email: order.email, 
            email_subject: `Order Confirmation - #${order.order_code} ✨`,
            email_heading: `Hi ${order.customer_name}, thank you for your order!`,
            email_message: "We have received your order. Our team will call you shortly to confirm delivery details.",
        };
        
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, customerParams, PUBLIC_KEY);
    }
    
    return true;
  } catch (error) {
    console.error("Email Failed:", error);
    return false;
  }
};