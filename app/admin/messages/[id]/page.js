"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MessageDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 ডাটাবেজ থেকে আসল মেসেজ ফেচ করা
  useEffect(() => {
    if (!id) return;

    const fetchMessageDetails = async () => {
      try {
        // ১. API থেকে সব মেসেজ নিয়ে আসা
        const res = await fetch('/api/messages', { cache: 'no-store' });
        const data = await res.json();

        if (data.success) {
          // ২. URL-এর id অনুযায়ী আসল মেসেজটি ফিল্টার করে বের করা
          const foundMessage = data.messages.find(m => m.id === id);
          setMessage(foundMessage || null);

          // ৩. মেসেজটি যদি আগে 'Unread' (FALSE) থাকে, তবে সেটিকে 'Read' (TRUE) করে দেওয়া
          if (foundMessage && (foundMessage.isRead === 'FALSE' || foundMessage.isRead === false)) {
            await fetch('/api/messages', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id, isRead: 'TRUE' })
            });
          }
        }
      } catch (error) {
        console.error("Error fetching message details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessageDetails();
  }, [id]);

  // ডিলিট করার ফাংশন (ঐচ্ছিক, চাইলে ব্যবহার করতে পারেন)
  const handleDelete = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই মেসেজটি ডিলিট করতে চান?")) return;
    
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        router.push('/admin?tab=messages');
      } else {
        alert("ডিলিট করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black text-[#3B3433] mb-4">মেসেজটি পাওয়া যায়নি!</h2>
        <button onClick={() => router.push('/admin?tab=messages')} className="px-6 py-2.5 bg-[#8A1538] text-white font-bold rounded-xl hover:bg-[#6e112d] transition-all shadow-md">
          ইনবক্সে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3B3433] font-sans pb-20">
      
      {/* 🌟 টপ নেভিগেশন (Back Button) */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin?tab=messages')} 
            className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-200 hover:text-[#8A1538] transition-colors flex items-center justify-center shadow-sm"
            title="Back to Inbox"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-black text-[#3B3433]">Message Details</h1>
          </div>
        </div>
        
        {/* কুইক অ্যাকশন বাটন (Delete) */}
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete Message">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* 🌟 মেইন মেসেজ বডি */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-8 animate-fade-in">
        
        {/* মেসেজ কন্টেইনার */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* সাবজেক্ট এবং হেডার */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-2xl md:text-3xl font-black text-[#3B3433] leading-tight mb-8">
              {message.subject}
            </h2>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md uppercase">
                  {message.name ? message.name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-[#3B3433] text-base">{message.name}</h3>
                  <a href={`mailto:${message.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                    &lt;{message.email}&gt;
                  </a>
                </div>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Received On</span>
                <span className="text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block">
                  {message.date}
                </span>
              </div>
            </div>
          </div>

          {/* মেসেজ টেক্সট */}
          <div className="p-6 md:p-8 bg-gray-50/30">
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
              {message.fullMessage}
            </div>
          </div>

          {/* রিপ্লাই সেকশন */}
          <div className="p-6 md:p-8 border-t border-gray-100 bg-white">
            <a 
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
              className="inline-flex items-center gap-2 bg-[#8A1538] text-white px-8 py-4 rounded-2xl font-bold tracking-wide hover:bg-[#6e112d] transition-all shadow-lg shadow-[#8A1538]/20 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply via Email
            </a>
            <p className="text-xs text-gray-400 mt-4 font-medium">
              * রিপ্লাই বাটনে ক্লিক করলে আপনার ডিভাইসের ডিফল্ট মেইল অ্যাপ (যেমন: Gmail) ওপেন হয়ে যাবে।
            </p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}