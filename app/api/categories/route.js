import { NextResponse } from 'next/server';
import { getGoogleSheet } from "../../../lib/googleSheets";


export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[3]; // Categories tab
    const rows = await sheet.getRows();
   
    const categories = rows.map(row => ({
      name: row.get('name'),
      image: row.get('image') || "",
      is_home: row.get('is_home') || "FALSE" // 🌟 নতুন কলাম
    })).filter(cat => cat.name);


    return NextResponse.json({ success: true, categories: categories.reverse() });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" });
  }
}


export async function POST(req) {
  try {
    const { name, image, is_home } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "Name is required" });


    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[3];
   
    const rows = await sheet.getRows();
    const exists = rows.find(row => row.get('name')?.toLowerCase() === name.toLowerCase());
   
    if (exists) {
      return NextResponse.json({ success: false, error: "এই ক্যাটাগরিটি আগেই যুক্ত করা আছে!" });
    }


    await sheet.addRow({
      name,
      image: image || "",
      is_home: is_home ? "TRUE" : "FALSE"
    });
    return NextResponse.json({ success: true, message: "Category added successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}


export async function PATCH(req) {
  try {
    const { oldName, newName, image, is_home } = await req.json();
   
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[3];
    const rows = await sheet.getRows();


    const targetRow = rows.find(row => row.get('name') === oldName);
   
    if (targetRow) {
      targetRow.set('name', newName);
      targetRow.set('image', image || "");
      targetRow.set('is_home', is_home ? "TRUE" : "FALSE");
      await targetRow.save();
      return NextResponse.json({ success: true, message: "Category updated successfully!" });
    }
    return NextResponse.json({ success: false, error: "Category not found!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}


export async function DELETE(req) {
  try {
    const { name } = await req.json();
   
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[3];
    const rows = await sheet.getRows();


    const targetRow = rows.find(row => row.get('name') === name);
   
    if (targetRow) {
      await targetRow.delete();
      return NextResponse.json({ success: true, message: "Category deleted successfully!" });
    }
    return NextResponse.json({ success: false, error: "Category not found!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

