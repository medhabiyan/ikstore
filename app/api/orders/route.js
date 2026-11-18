import { getGoogleSheet } from "../../../lib/googleSheets";
import { sendCAPIEvent } from "../../../lib/fbCapi"; // 🌟 আমাদের ম্যাজিক CAPI টুল

// নতুন অর্ডার সেভ করার জন্য (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    
    // নতুন ৩টি ফিল্ড যুক্ত করে রিসিভ করা হলো
    const { name, phone, address, totalPrice, sub_total, delivery_charge, items, cart_data, payment_method, bkash_number, trx_id } = body;

    const doc = await getGoogleSheet();
    
    // JSON থেকে কার্টের আইটেমগুলো বের করা
    let parsedCartItems = [];
    if (cart_data) {
       parsedCartItems = JSON.parse(cart_data);
    }

    const productSheet = doc.sheetsByIndex[0]; 
    const productRows = await productSheet.getRows();

    // ১. স্টক চেক করার লজিক
    if (parsedCartItems.length > 0) {
      for (const item of parsedCartItems) {
        const productRow = productRows.find(row => row.get('id') === item.id);
        if (productRow) {
          const currentStock = Number(productRow.get('stock') || 0);
          if (currentStock < item.quantity) {
            return Response.json({ 
              success: false, 
              error: `দুঃখিত! ${item.name} এর স্টক শেষ হয়ে গেছে। দয়া করে কার্ট আপডেট করুন।` 
            });
          }
        }
      }
    }

    // ২. ইউনিক অর্ডার আইডি জেনারেট 
    const now = new Date();
    const bstTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(now);

    const dateObj = {};
    bstTime.forEach(p => dateObj[p.type] = p.value);

    const msPart = now.getTime().toString().slice(-4);
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const uniqueOrderId = `ORD-${dateObj.day}${dateObj.month}-${msPart}-${randomPart}`;
    const orderDate = `${dateObj.day}/${dateObj.month}/${dateObj.year} ${dateObj.hour}:${dateObj.minute}`;

    // ৩. Orders শিটে ডেটা সেভ করা
    const orderSheet = doc.sheetsByIndex[1]; 
    await orderSheet.addRow({
      order_id: uniqueOrderId,
      customer_name: name,
      phone: phone,
      address: address,
      total_price: totalPrice,
      
      sub_total: sub_total || 0,
      delivery_charge: delivery_charge || 0,
      cart_data: cart_data || '',

      items: items,
      status: 'Pending Payment', 
      date: orderDate,
      payment_method: payment_method || 'COD',
      bkash_number: bkash_number || '',
      trx_id: trx_id || ''
    });

    // ৪. স্টক কমানোর লজিক
    if (parsedCartItems.length > 0) {
      for (const item of parsedCartItems) {
        const productRow = productRows.find(row => row.get('id') === item.id);
        if (productRow) {
          const currentStock = Number(productRow.get('stock') || 0);
          const newStock = Math.max(0, currentStock - item.quantity); 
          productRow.set('stock', newStock.toString());
          await productRow.save(); 
        }
      }
    }

    // 🚀 ৫. Server-Side CAPI (Purchase Event) ফায়ার করা
    try {
      const baseUrl = req.nextUrl.origin;
      const settingsRes = await fetch(`${baseUrl}/api/settings`);
      const settingsData = await settingsRes.json();
      const settings = settingsData.settings || {};

      if (settings.capi_access_token && settings.meta_pixel_id) {
        const contentIds = parsedCartItems.map(item => item.id);
        const contents = parsedCartItems.map(item => ({
           id: item.id,
           quantity: item.quantity,
           item_price: item.price
        }));

        // ক্লায়েন্টের আইপি এবং ব্রাউজার ইনফো নেওয়া (ফেসবুকের জন্য খুবই জরুরি)
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const userAgent = req.headers.get('user-agent') || '';

        // CAPI ফাংশন কল করা (ব্যাকগ্রাউন্ডে চলবে, ইউজারের স্ক্রিন স্লো করবে না)
        sendCAPIEvent({
          eventName: 'Purchase',
          eventId: uniqueOrderId, // 🌟 Deduplication আইডি (ক্লাইন্ট সাইডের সাথে মিলবে)
          eventUrl: `${baseUrl}/thank-you?order_id=${uniqueOrderId}`,
          clientIp: clientIp,
          userAgent: userAgent,
          userData: {
            phone: phone, // আমাদের fbCapi.js এটা অটোমেটিক Hash করে নেবে
            firstName: name 
          },
          customData: {
            value: Number(totalPrice),
            currency: 'BDT',
            content_ids: contentIds,
            contents: contents,
            content_type: 'product'
          },
          pixelId: settings.meta_pixel_id,
          accessToken: settings.capi_access_token,
          testEventCode: settings.test_event_code
        });
      }
    } catch (capiError) {
      console.error("CAPI Event silently failed:", capiError);
      // CAPI ফেইল করলেও কাস্টমারকে এরর দেখাবো না, অর্ডার সাকসেস হবে
    }

    // সবকিছু শেষে কাস্টমারকে সাকসেস মেসেজ দেওয়া
    return Response.json({ success: true, orderId: uniqueOrderId });

  } catch (error) {
    console.error("Order submission failed:", error);
    return Response.json({ success: false, error: "Internal Server Error" });
  }
}

export async function GET() {
  try {
    const doc = await getGoogleSheet();
    const orderSheet = doc.sheetsByIndex[1]; 
    const rows = await orderSheet.getRows();
    const orders = rows.map(row => row.toObject());
    return Response.json({ success: true, orders });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to fetch orders" });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { order_id, status } = body;
    if (!order_id || !status) return Response.json({ success: false, error: "Required fields missing" }, { status: 400 });

    const doc = await getGoogleSheet();
    const orderSheet = doc.sheetsByIndex[1]; 
    const rows = await orderSheet.getRows();
    const targetRow = rows.find(row => row.get('order_id') === order_id);

    if (targetRow) {
      targetRow.set('status', status); 
      await targetRow.save(); 
      return Response.json({ success: true, message: "Status updated" });
    } else {
      return Response.json({ success: false, error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}