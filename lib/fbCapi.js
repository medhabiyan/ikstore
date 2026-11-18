// lib/fbCapi.js
import crypto from 'crypto';

// 🌟 ফেসবুকের নিয়ম অনুযায়ী ইউজারের ডেটা SHA256 দিয়ে Hash করার ফাংশন
const hashData = (data) => {
  if (!data) return null;
  // ডেটার স্পেস মুছে ছোট হাতের অক্ষরে রূপান্তর করে তারপর হ্যাশ করতে হয়
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export const sendCAPIEvent = async ({
  eventName,
  eventId,
  eventUrl,
  clientIp,
  userAgent,
  userData,
  customData,
  pixelId,
  accessToken,
  testEventCode
}) => {
  // পিক্সেল আইডি বা টোকেন না থাকলে রিকোয়েস্ট পাঠানো থেকে বিরত থাকবে
  if (!pixelId || !accessToken) {
    console.log("⚠️ CAPI Skipped: Pixel ID or Access Token is missing.");
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  // 🌟 ফেসবুক Graph API এর জন্য ডেটা সাজানো
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: currentTimestamp,
        action_source: "website",
        event_id: eventId, // Deduplication এর জন্য অত্যন্ত জরুরি
        event_source_url: eventUrl,
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          ph: hashData(userData?.phone), // Phone number hashed
          em: hashData(userData?.email), // Email hashed
          fn: hashData(userData?.firstName),
        },
        custom_data: customData,
      }
    ]
  };

  // টেস্টিংয়ের সময় Test Event Code যুক্ত করা
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  try {
    // 🌟 সরাসরি ফেসবুকের সার্ভারে POST রিকোয়েস্ট পাঠানো (v19.0 লেটেস্ট এপিআই)
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.events_received) {
      console.log(`✅ CAPI Event Sent Successfully: ${eventName} (Event ID: ${eventId})`);
      return true;
    } else {
      console.error(`❌ CAPI Event Failed:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ CAPI Fetch Error:`, error);
    return false;
  }
};