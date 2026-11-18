"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "../lib/trackEvent"; // 🌟 আমাদের ম্যাজিক ট্র্যাকার ইম্পোর্ট করা হলো

export default function MarketingTracker() {
  const [settings, setSettings] = useState(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // পেজ লোড হলে সেটিংস (Pixel ID, GTM ID) নিয়ে আসবে
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error("Tracking Error:", err));
  }, []);

  // 🌟 কাস্টমার এক পেজ থেকে অন্য পেজে গেলে PageView ফায়ার করবে (ব্রাউজার + সার্ভার দুই দিক দিয়েই!)
  useEffect(() => {
    if (settings?.meta_pixel_id) {
      // window.fbq চেক করার দরকার নেই, কারণ trackEvent নিজেই Queue মেইনটেইন করে
      trackEvent('PageView', {
        page_path: pathname
      });
    }
  }, [pathname, searchParams, settings]);

  if (!settings) return null;

  return (
    <>
      {/* 🌟 Meta Pixel Base Code & Queue Processor */}
      {settings.meta_pixel_id && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', '${settings.meta_pixel_id}');
              
              // 🌟 এখান থেকে হার্ডকোডেড PageView রিমুভ করা হয়েছে, কারণ আমাদের React useEffect সেটা আরও নিখুঁতভাবে হ্যান্ডেল করছে।

              // 🌟 ম্যাজিক: লাইনে দাঁড়িয়ে থাকা (Queued) ইভেন্টগুলো এখন ফায়ার হবে
              if (window.deferredFbEvents && window.deferredFbEvents.length > 0) {
                window.deferredFbEvents.forEach(function(e) {
                  fbq(e[0], e[1], e[2], e[3]);
                });
                window.deferredFbEvents = []; // ফায়ার হওয়ার পর লাইন ক্লিয়ার
              }
            `,
          }}
        />
      )}

      {/* 🌟 Google Tag Manager Base Code */}
      {settings.gtm_id && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.gtm_id}');
            `,
          }}
        />
      )}
    </>
  );
}