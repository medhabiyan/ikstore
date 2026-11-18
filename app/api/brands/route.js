import { NextResponse } from 'next/server';
import { getGoogleSheet } from "../../../lib/googleSheets";

export const dynamic = 'force-dynamic';

// 🌟 ১. GET: ব্র্যান্ডের নাম এবং তাদের প্রোডাক্ট সংখ্যা আনার জন্য
export async function GET() {
  try {
    const doc = await getGoogleSheet();
    
    // ৫ নম্বর ট্যাব (Brands) এবং ১ নম্বর ট্যাব (Products) নেওয়া হচ্ছে
    const brandSheet = doc.sheetsByIndex[4]; 
    const productSheet = doc.sheetsByIndex[0];

    const [brandRows, productRows] = await Promise.all([
      brandSheet.getRows(),
      productSheet.getRows()
    ]);

    // ব্র্যান্ডের লিস্ট তৈরি এবং প্রোডাক্ট কাউন্ট করা
    const brands = brandRows.map(bRow => {
      const bName = bRow.get('name');
      
      // প্রোডাক্ট শিটে এই ব্র্যান্ডের কয়টি প্রোডাক্ট আছে তা বের করা
      const count = productRows.filter(pRow => 
        pRow.get('brand')?.toString().trim().toLowerCase() === bName?.toLowerCase().trim()
      ).length;

      return { name: bName, productCount: count };
    }).filter(b => b.name); // ফাঁকা রো বাদ দিবে

    return NextResponse.json({ success: true, brands: brands.reverse() });
  } catch (error) {
    console.error("Fetch Brands Error:", error);
    return NextResponse.json({ success: false, error: "ব্র্যান্ড ফেচ করতে সমস্যা হয়েছে" });
  }
}

// 🌟 ২. POST: নতুন ব্র্যান্ড যুক্ত করার জন্য
export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "নাম প্রয়োজন" });

    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[4];
    
    const rows = await sheet.getRows();
    const exists = rows.find(row => row.get('name')?.toLowerCase() === name.toLowerCase());
    
    if (exists) {
      return NextResponse.json({ success: false, error: "এই ব্র্যান্ডটি অলরেডি আছে!" });
    }

    await sheet.addRow({ name });
    return NextResponse.json({ success: true, message: "Brand added successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// 🌟 ৩. PATCH: ব্র্যান্ডের নাম এডিট করার জন্য
export async function PATCH(req) {
  try {
    const { oldName, newName } = await req.json();
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[4];
    const rows = await sheet.getRows();

    const targetRow = rows.find(row => row.get('name') === oldName);
    
    if (targetRow) {
      targetRow.set('name', newName);
      await targetRow.save();
      return NextResponse.json({ success: true, message: "Brand updated successfully!" });
    }
    return NextResponse.json({ success: false, error: "ব্র্যান্ডটি খুঁজে পাওয়া যায়নি!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// 🌟 ৪. DELETE: ব্র্যান্ড ডিলিট করার জন্য
export async function DELETE(req) {
  try {
    const { name } = await req.json();
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[4];
    const rows = await sheet.getRows();

    const targetRow = rows.find(row => row.get('name') === name);
    
    if (targetRow) {
      await targetRow.delete();
      return NextResponse.json({ success: true, message: "Brand deleted successfully!" });
    }
    return NextResponse.json({ success: false, error: "ব্র্যান্ডটি খুঁজে পাওয়া যায়নি!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}