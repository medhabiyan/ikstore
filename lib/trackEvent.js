// lib/trackEvent.js

export const trackEvent = (eventName, payload = {}, specificEventId = null) => {
  const eventId = specificEventId || (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36));

  if (typeof window !== 'undefined') {
    
    // 🌟 ১. Facebook Pixel (Browser Side)
    if (window.fbq && typeof window.fbq === 'function' && window.fbq.loaded) {
      window.fbq('track', eventName, payload, { eventID: eventId });
      console.log(`✅ Pixel Fired: ${eventName}`);
    } else {
      window.deferredFbEvents = window.deferredFbEvents || [];
      window.deferredFbEvents.push(['track', eventName, payload, { eventID: eventId }]);
    }

    // 🌟 ২. Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, eventID: eventId, ...payload });
    } else {
       window.dataLayer = window.dataLayer || [];
       window.dataLayer.push({ event: eventName, eventID: eventId, ...payload });
    }

    // 🌟 ৩. NEW: Server Side (CAPI) Bridge!
    // Purchase ইভেন্ট বাদে বাকি সব ইভেন্ট আমরা এই API দিয়ে সার্ভারে পাঠাবো।
    // (Purchase ইভেন্ট অলরেডি orders API দিয়ে সিকিউরভাবে যাচ্ছে, তাই ডাবল পাঠাবো না)
    if (eventName !== 'Purchase') {
      fetch('/api/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventName,
          eventId: eventId,
          payload: payload,
          url: window.location.href
        })
      }).catch(err => console.error("Failed to send to CAPI Bridge:", err));
      console.log(`✅ Sent to CAPI Server: ${eventName}`);
    }
  }

  return eventId;
};