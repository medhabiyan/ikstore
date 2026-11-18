import { getGoogleSheet } from "../../../lib/googleSheets";

// পেমেন্ট সেটিংস ফেচ করার জন্য
export async function GET() {
  try {
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[6]; // ৭ নম্বর ট্যাব (ইন্ডেক্স ৬)
    const rows = await sheet.getRows();
    
    const settings = {};
    rows.forEach(row => {
      settings[row.get('key')] = row.get('value');
    });

    return Response.json({ success: true, settings });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to fetch payment settings" });
  }
}

// পেমেন্ট সেটিংস সেভ বা আপডেট করার জন্য
export async function POST(req) {
  try {
    const body = await req.json();
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[6];
    const rows = await sheet.getRows();

    // অবজেক্টের প্রতিটি কী-ভ্যালু জোড়া সেভ বা আপডেট করা
    for (const [key, value] of Object.entries(body)) {
      const existingRow = rows.find(row => row.get('key') === key);
      if (existingRow) {
        existingRow.set('value', value);
        await existingRow.save();
      } else {
        await sheet.addRow({ key, value });
      }
    }

    return Response.json({ success: true, message: "Payment settings updated" });
  } catch (error) {
    console.error("Save failed:", error);
    return Response.json({ success: false, error: "Internal Server Error" });
  }
}