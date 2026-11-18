import { NextResponse } from 'next/server';
// 🌟 আপনার প্রজেক্টের সঠিক পাথ ব্যবহার করা হলো
import { getGoogleSheet } from "../../../lib/googleSheets";

export const dynamic = 'force-dynamic'; // API যেন ক্যাশ ধরে না রাখে

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); 

    const doc = await getGoogleSheet();
    
    const sheetTitle = type === 'brand' ? 'Brands' : 'Categories';
    const sheet = doc.sheetsByTitle[sheetTitle];

    // যদি শিট না পাওয়া যায়, তবে ক্র্যাশ না করে খালি ডাটা পাঠাবে
    if (!sheet) {
        return NextResponse.json({ success: true, data: [] });
    }

    const rows = await sheet.getRows();
    const dataList = rows.map(row => row.get('name')).filter(Boolean);

    return NextResponse.json({ success: true, data: dataList });
  } catch (error) {
    console.error("Attributes Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch data", data: [] });
  }
}