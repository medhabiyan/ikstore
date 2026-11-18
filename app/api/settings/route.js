import { NextResponse } from 'next/server';
import { getGoogleSheet } from "../../../lib/googleSheets";

export const dynamic = 'force-dynamic';

// 🌟 ১. GET: শিট থেকে সব সেটিংস ডেটা আনার জন্য
export async function GET() {
  try {
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[2]; // ৩ নম্বর ট্যাব (Settings)
    const rows = await sheet.getRows();
    
    const settings = {};
    rows.forEach(row => {
      const key = row.get('key');
      if (key) {
        settings[key] = row.get('value') || "";
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ success: false, error: "সেটিংস ফেচ করতে সমস্যা হয়েছে" });
  }
}

// 🌟 ২. POST: সেটিংস আপডেট বা নতুন ডেটা যুক্ত করার জন্য
export async function POST(req) {
  try {
    const updates = await req.json(); // { meta_pixel_id: "...", gtm_id: "..." }
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[2]; 
    const rows = await sheet.getRows();

    // প্রতিটা key-এর জন্য লুপ চালাবে
    for (const [key, value] of Object.entries(updates)) {
      const targetRow = rows.find(row => row.get('key') === key);
      
      if (targetRow) {
        // যদি key আগে থেকেই থাকে, তবে value আপডেট করবে
        targetRow.set('value', value);
        await targetRow.save();
      } else {
        // যদি key না থাকে, তবে নতুন রো তৈরি করবে
        await sheet.addRow({ key, value });
      }
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}