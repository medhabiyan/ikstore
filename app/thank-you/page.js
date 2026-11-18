"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { trackEvent } from "../../lib/trackEvent";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "Processing...";
  const orderTotal = searchParams.get("total") || 0; 
  const subTotal = searchParams.get("subtotal") || 0; 
  const shipping = searchParams.get("shipping") || 0; 

  const [hasTrackedPurchase, setHasTrackedPurchase] = useState(false);

  useEffect(() => {
    if (orderId && orderId !== "Processing..." && !hasTrackedPurchase) {
      
      // 🌟 ম্যাজিক ফিক্স: ৩য় প্যারামিটার হিসেবে orderId পাঠানো হলো (Deduplication এর জন্য)
      trackEvent('Purchase', {
        value: Number(orderTotal),
        currency: 'BDT', 
        transaction_id: orderId // GTM এর জন্য
      }, orderId); // 👈 এই orderId-টাই ব্রাউজারের eventID হিসেবে ফেসবুকে যাবে!
      
      setHasTrackedPurchase(true);
    }
  }, [orderId, orderTotal, hasTrackedPurchase]);

  return (
    <div className="max-w-2xl w-full bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-50 text-center animate-fade-in my-10">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-black text-[#3B3433] mb-3 tracking-tight">অর্ডার সফল হয়েছে!</h1>
      <p className="text-gray-500 text-sm mb-8 px-4">আপনার অর্ডারটি রিসিভ করা হয়েছে। কনফার্মেশনের জন্য শীঘ্রই কল করা হবে।</p>

      {/* 🌟 সুন্দর ব্রেকডাউন টেবিল (Zero Issue Fixed) */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-left">অর্ডার সামারি</h3>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-200">
            <tr className="py-3 flex justify-between">
              <td className="text-gray-600 py-3">অর্ডার আইডি</td>
              <td className="font-bold text-[#8A1538] py-3">#{orderId}</td>
            </tr>
            <tr className="py-3 flex justify-between">
              <td className="text-gray-600 py-3">সাব-টোটাল</td>
              <td className="font-bold text-gray-800 py-3">৳{subTotal}</td>
            </tr>
            <tr className="py-3 flex justify-between">
              <td className="text-gray-600 py-3">ডেলিভারি চার্জ</td>
              <td className="font-bold text-gray-800 py-3">৳{shipping}</td>
            </tr>
            <tr className="py-4 flex justify-between text-lg border-t-2 border-gray-300">
              <td className="font-black text-gray-900 py-4">সর্বমোট বিল</td>
              <td className="font-black text-[#8A1538] py-4">৳{orderTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/shop" className="bg-[#8A1538] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#6e112d] transition-all shadow-lg active:scale-95">
          আরও কেনাকাটা করুন
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xl font-bold text-gray-500 animate-pulse">Loading...</div>}>
        <ThankYouContent />
      </Suspense>
    </div>
  );
}