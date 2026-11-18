import { getGoogleSheet } from "../../../lib/googleSheets";

// 🌟 ১. GET: সব মেসেজ ডাটাবেজ থেকে আনার জন্য
export async function GET() {
  try {
    const doc = await getGoogleSheet();
    // ⚠️ নিশ্চিত করুন যে Messages শিটটি আপনার গুগল শিটের ৩য় স্থানে (index 2) আছে
    const messageSheet = doc.sheetsByIndex[5]; 
    const rows = await messageSheet.getRows();
    
    // গুগল শিটের ডেটাকে জেসনে (JSON) কনভার্ট করা হচ্ছে
    const messages = rows.map(row => {
      const data = row.toObject();
      // Google Sheet-এ TRUE/FALSE টেক্সট হিসেবে থাকে, তাই সেটিকে বুলিয়ানে রূপান্তর করা হচ্ছে
      data.isRead = data.isRead === 'TRUE' || data.isRead === true;
      return data;
    });

    // নতুন মেসেজগুলো একদম উপরে দেখানোর জন্য .reverse() করা হয়েছে
    return Response.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json({ success: false, error: "Failed to fetch messages" });
  }
}

// 🌟 ২. PATCH: মেসেজ ওপেন করলে Read হিসেবে স্ট্যাটাস আপডেট করার জন্য
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, isRead } = body;

    if (!id) {
      return Response.json({ success: false, error: "Message ID is required" }, { status: 400 });
    }

    const doc = await getGoogleSheet();
    const messageSheet = doc.sheetsByIndex[5]; 
    const rows = await messageSheet.getRows();

    // নির্দিষ্ট ID-এর মেসেজটি খোঁজা হচ্ছে
    const targetRow = rows.find(row => row.get('id') === id);

    if (targetRow) {
      // স্ট্যাটাস TRUE বা FALSE সেট করা হচ্ছে
      targetRow.set('isRead', isRead ? 'TRUE' : 'FALSE'); 
      await targetRow.save(); 
      return Response.json({ success: true, message: "Message status updated" });
    } else {
      return Response.json({ success: false, error: "Message not found in Google Sheet" }, { status: 404 });
    }

  } catch (error) {
    console.error("Message update failed:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// 🌟 ৩. DELETE: মেসেজ ডিলিট করার জন্য (ভবিষ্যতের সুবিধার জন্য দিয়ে রাখলাম)
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ success: false, error: "Message ID is required" }, { status: 400 });
    }

    const doc = await getGoogleSheet();
    const messageSheet = doc.sheetsByIndex[5]; 
    const rows = await messageSheet.getRows();

    const targetRow = rows.find(row => row.get('id') === id);

    if (targetRow) {
      await targetRow.delete(); 
      return Response.json({ success: true, message: "Message deleted successfully" });
    } else {
      return Response.json({ success: false, error: "Message not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Message deletion failed:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}