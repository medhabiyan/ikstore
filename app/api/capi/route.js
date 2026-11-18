import { sendCAPIEvent } from "../../../lib/fbCapi";

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventName, eventId, payload, url } = body;

    // ডাটাবেস বা সেটিংস এপিআই থেকে টোকেন নিয়ে আসা
    const baseUrl = req.nextUrl.origin;
    const settingsRes = await fetch(`${baseUrl}/api/settings`);
    const settingsData = await settingsRes.json();
    const settings = settingsData.settings || {};

    if (!settings.meta_pixel_id || !settings.capi_access_token) {
      return Response.json({ success: false, error: "CAPI Settings missing" });
    }

    // ক্লায়েন্টের আইপি এবং ব্রাউজার ইনফো (CAPI এর জন্য জরুরি)
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // CAPI তে ইভেন্ট পাঠানো
    await sendCAPIEvent({
      eventName: eventName,
      eventId: eventId,
      eventUrl: url,
      clientIp: clientIp,
      userAgent: userAgent,
      customData: payload,
      pixelId: settings.meta_pixel_id,
      accessToken: settings.capi_access_token,
      testEventCode: settings.test_event_code
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("CAPI Bridge Error:", error);
    return Response.json({ success: false, error: "Internal Server Error" });
  }
}