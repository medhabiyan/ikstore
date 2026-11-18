import { NextResponse } from 'next/server';
import { getGoogleSheet } from "../../../lib/googleSheets";

export async function POST(req) {
  try {
    const body = await req.json();
    const doc = await getGoogleSheet();
    
    // আমরা Messages নামের ট্যাবটি খুঁজছি
    const messageSheet = doc.sheetsByTitle['Messages'];
    if (!messageSheet) {
       return NextResponse.json({ success: false, error: "Messages sheet not found! Please create a tab named 'Messages'" }, { status: 500 });
    }

    // একটি ইউনিক আইডি তৈরি করা হচ্ছে
    const uniqueId = `MSG-${Date.now()}`;

    // 🌟 শিটে নতুন সারি যুক্ত করা (হুবহু আপনার কলামের নাম অনুযায়ী)
    await messageSheet.addRow({
      id: uniqueId,
      name: body.name,
      email: body.email,
      subject: body.subject,
      fullMessage: body.message, // ফ্রন্টএন্ডের message কে fullMessage কলামে পাঠানো হচ্ছে
      date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }), 
      isRead: 'FALSE' // নতুন মেসেজ তাই ডিফল্টভাবে FALSE থাকবে
    });

    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}