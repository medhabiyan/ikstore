"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPageList() {
  const [landingPages, setLandingPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ডেটা ফেচ করা
  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        // 🌟 শুধুমাত্র ল্যান্ডিং পেজ ফিল্টার করে উল্টে (reverse) দেওয়া হচ্ছে যাতে শেষেরটা প্রথমে আসে
        const filteredPages = data.products.filter(p => p.is_landing_page === 'TRUE').reverse();
        setLandingPages(filteredPages);
      }
    } catch (error) {
      console.error("Error fetching landing pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ডিলিট ফাংশন
  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ল্যান্ডিং পেজটি ডিলিট করতে চান?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLandingPages(landingPages.filter(page => page.id !== id));
      } else {
        alert("ডিলিট করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর!");
    } finally {
      setDeletingId(null);
    }
  };

  // দাম ফরম্যাট করার ফাংশন
  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat('en-IN').format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 font-['Noto_Sans_Bengali',sans-serif]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#8A1538]">ল্যান্ডিং পেজ সমূহ</h2>
          <p className="text-gray-500 text-sm mt-1">আপনার ওয়েবসাইটের স্পেশাল অফার পেজগুলো ম্যানেজ করুন</p>
        </div>
        <Link href="/admin/add-product" className="px-6 py-2.5 bg-[#2B2927] hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg transition-all">+ নতুন পেজ</Link>
      </div>

      {landingPages.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">কোনো ল্যান্ডিং পেজ পাওয়া যায়নি</h3>
          <p className="text-gray-500 text-sm">নতুন প্রোডাক্ট যোগ করার সময় 'Is Landing Page' অপশনটি চালু করুন।</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <th className="p-4 font-bold rounded-tl-xl">ছবি</th>
                <th className="p-4 font-bold">পেজের নাম ও স্লোগান</th>
                <th className="p-4 font-bold">অফার প্রাইস</th>
                <th className="p-4 font-bold text-right rounded-tr-xl">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {landingPages.map((page) => {
                const mainImage = page.image ? page.image.split(',')[0].trim() : "";
                
                return (
                  <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      {mainImage ? (
                        <img src={mainImage} alt={page.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-gray-200">No Img</div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#3B3433] text-sm md:text-base">{page.name}</p>
                      <p className="text-xs text-[#8A1538] font-semibold mt-1">"{page.lp_slogan || 'No Slogan'}"</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">/offer/{page.slug}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-[#3B3433]">৳ {formatPrice(page.price)}</p>
                      {page.regular_price && <p className="text-xs text-gray-400 line-through">৳ {formatPrice(page.regular_price)}</p>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 🌟 ল্যান্ডিং পেজ ভিউ বাটন (নতুন ট্যাবে ওপেন হবে) */}
                        <Link 
                          href={`/offer/${page.slug}`} 
                          target="_blank"
                          title="ল্যান্ডিং পেজ দেখুন"
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        
                        <Link 
                          href={`/admin/edit-product/${page.id}`}
                          title="এডিট করুন" 
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>

                        <button 
                          onClick={() => handleDelete(page.id)}
                          disabled={deletingId === page.id}
                          title="ডিলিট করুন"
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                        >
                          {deletingId === page.id ? (
                            <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin block"></span>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}