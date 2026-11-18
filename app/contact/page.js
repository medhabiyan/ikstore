"use client";
import { useState } from "react";
import { Noto_Sans_Bengali } from 'next/font/google';

// Noto Sans Bengali ফন্ট সেটআপ
const notoSansBengali = Noto_Sans_Bengali({ 
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();

      if (result.success) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        alert("দুঃখিত, মেসেজ পাঠানো যায়নি: " + result.error);
      }
    } catch (error) {
      alert("নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#FDFDFD] pt-24 pb-20 relative overflow-hidden ${notoSansBengali.className}`}>
      
      {/* 🌟 সূক্ষ্ম ব্যাকগ্রাউন্ড গ্লো (মিনিমাল লুকের জন্য) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* হেডার সেকশন */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl md:text-5xl font-black text-[#3B3433] tracking-tight mb-4">
            যোগাযোগ করুন<span className="text-[#8A1538]">.</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            আপনার যেকোনো প্রশ্ন, মতামত বা অভিযোগ জানাতে নিচের ফর্মটি পূরণ করুন। আমাদের সাপোর্ট টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 🌟 ইনফরমেশন কার্ডস (বাম পাশ) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* ফোন নম্বর কার্ড */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="w-14 h-14 bg-red-50 group-hover:bg-[#8A1538] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#8A1538] group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-1">ফোন নম্বর</h3>
                <p className="text-[#3B3433] font-black text-lg">+880 1994-618577</p>
                <p className="text-gray-500 text-sm mt-0.5 font-medium">সকাল ১০টা - রাত ৮টা</p>
              </div>
            </div>

            {/* ইমেইল কার্ড */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="w-14 h-14 bg-indigo-50 group-hover:bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-1">ইমেইল অ্যাড্রেস</h3>
                <p className="text-[#3B3433] font-black text-base">imdadkhan2662022@gmail.com</p>
              </div>
            </div>

            {/* ঠিকানা কার্ড */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-emerald-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-1">অফিসের ঠিকানা</h3>
                <p className="text-[#3B3433] font-black text-base">Manirampur Bazar, Jashore.</p>
                {/* <p className="text-gray-500 text-sm mt-0.5 font-medium">১০৩/২, গ্রীণ রোড, ঢাকা।</p> */}
              </div>
            </div>

          </div>

          {/* 🌟 কন্টাক্ট ফর্ম (ডান পাশ) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-100 p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#3B3433] mb-2">আপনার নাম <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 transition-all bg-[#FDFDFD] focus:bg-white text-[#3B3433] font-semibold placeholder-gray-300" 
                    placeholder="আপনার পুরো নাম লিখুন" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#3B3433] mb-2">ইমেইল অ্যাড্রেস <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 transition-all bg-[#FDFDFD] focus:bg-white text-[#3B3433] font-semibold placeholder-gray-300" 
                    placeholder="example@mail.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3B3433] mb-2">বিষয় (Subject) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 transition-all bg-[#FDFDFD] focus:bg-white text-[#3B3433] font-semibold placeholder-gray-300" 
                  placeholder="কী বিষয়ে জানতে চান?" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3B3433] mb-2">আপনার মেসেজ <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  rows="5" 
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 transition-all bg-[#FDFDFD] focus:bg-white text-[#3B3433] font-semibold placeholder-gray-300 resize-none" 
                  placeholder="আপনার বার্তাটি বিস্তারিত লিখুন..."
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-4 bg-[#8A1538] text-white rounded-2xl font-bold tracking-wide hover:bg-[#6e112d] transition-all duration-300 hover:shadow-xl hover:shadow-[#8A1538]/20 flex justify-center items-center gap-3">
                  {isSubmitting ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      মেসেজ পাঠান
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>

              {/* সাকসেস মেসেজ */}
              {isSuccess && (
                <div className="p-5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm flex items-center gap-3 animate-fade-in mt-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex justify-center items-center flex-shrink-0 text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  আপনার মেসেজ সফলভাবে পাঠানো হয়েছে! আমরা দ্রুতই যোগাযোগ করব।
                </div>
              )}

            </form>
          </div>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}