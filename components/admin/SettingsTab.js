"use client";
import { useState, useEffect } from "react";

export default function SettingsTab({ settingsData, fetchSettings, isLoading }) {
  const [formData, setFormData] = useState({
    meta_pixel_id: "",
    capi_access_token: "",
    test_event_code: "", 
    gtm_id: "",
    custom_header_script: "", 
    meta_verification_code: "" // 🌟 নতুন স্মার্ট ফিল্ড
  });
  
  const [editable, setEditable] = useState({
    meta_pixel_id: false,
    capi_access_token: false,
    test_event_code: false,
    gtm_id: false,
    custom_header_script: false, 
    meta_verification_code: false // 🌟 নতুন ফিল্ডের স্টেট
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (settingsData) {
      setFormData({
        meta_pixel_id: settingsData.meta_pixel_id || "",
        capi_access_token: settingsData.capi_access_token || "",
        test_event_code: settingsData.test_event_code || "", 
        gtm_id: settingsData.gtm_id || "",
        custom_header_script: settingsData.custom_header_script || "", 
        meta_verification_code: settingsData.meta_verification_code || "" // 🌟 ডেটা সেট করা হলো
      });
    }
  }, [settingsData]);

  // টোস্ট অটো-হাইড করার ইফেক্ট
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 🌟 ম্যাজিক লজিক: হ্যান্ডেল ইনপুট চেঞ্জ
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "meta_verification_code") {
      let extractedValue = value.trim();

      // চেক ১: যদি ক্লায়েন্ট পুরো <meta ... content="12345"> ট্যাগ পেস্ট করে
      const metaMatch = extractedValue.match(/content=["']([^"']+)["']/i);
      if (metaMatch && metaMatch[1]) {
        extractedValue = metaMatch[1];
      } 
      // চেক ২: যদি ক্লায়েন্ট 12345.html ফাইলের নাম পেস্ট করে
      else if (extractedValue.toLowerCase().endsWith('.html')) {
        extractedValue = extractedValue.replace(/\.html$/i, '');
      }

      setFormData(prev => ({ ...prev, [name]: extractedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleEdit = (field) => {
    setEditable(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const clearField = (field) => {
    if (window.confirm(`আপনি কি এই ফিল্ডের ডেটা মুছে ফেলতে চান?`)) {
      setFormData(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        if (fetchSettings) fetchSettings();
        setShowToast(true);
        setEditable({ meta_pixel_id: false, capi_access_token: false, test_event_code: false, gtm_id: false, custom_header_script: false, meta_verification_code: false });
      } else {
        alert("সমস্যা হয়েছে: " + result.error);
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-20 text-center"><div className="w-8 h-8 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
  }

  // 🌟 ইনপুট ফিল্ড রেন্ডার ফাংশন (helpText প্যারামিটার যোগ করা হয়েছে)
  const renderField = (label, name, type = "input", rows = "2", helpText = "") => (
    <div className="relative w-full">
      <div className="flex flex-col mb-1.5">
         <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
         {helpText && <span className="text-[10px] text-emerald-600 font-bold mt-0.5">{helpText}</span>}
      </div>
      <div className="relative flex items-center">
        {type === "textarea" ? (
          <textarea 
            name={name}
            value={formData[name]} 
            onChange={handleInputChange} 
            readOnly={!editable[name]}
            rows={rows}
            className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-all resize-none text-xs font-mono font-bold ${editable[name] ? "border-[#8A1538] bg-white ring-2 ring-[#8A1538]/10 text-black" : "border-gray-100 bg-gray-50 text-gray-700"}`}
            placeholder={name === "custom_header_script" ? "<!-- Paste full <script> or <meta> tags here -->" : ""}
          ></textarea>
        ) : (
          <input 
            type="text" 
            name={name}
            value={formData[name]} 
            onChange={handleInputChange} 
            readOnly={!editable[name]}
            className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-all text-sm font-mono font-bold ${editable[name] ? "border-[#8A1538] bg-white ring-2 ring-[#8A1538]/10 text-black" : "border-gray-100 bg-gray-50 text-gray-700"}`}
            placeholder={name === "meta_verification_code" ? "Paste meta tag, filename or code" : ""}
          />
        )}
        
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => toggleEdit(name)}
            className={`p-1.5 rounded-lg transition-all ${editable[name] ? "bg-green-100 text-green-600" : "bg-white/80 text-gray-400 hover:text-[#8A1538] shadow-sm border border-gray-100"}`}
          >
            {editable[name] ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => clearField(name)}
            className="p-1.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`fixed bottom-8 right-8 z-[9999] transition-all duration-500 transform ${showToast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}>
        <div className="bg-[#2B2927] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
          <p className="text-sm font-bold">সেটিংস আপডেট হয়েছে!</p>
        </div>
      </div>

      <div className="animate-fade-in w-full space-y-4 max-w-4xl font-['Noto_Sans_Bengali',sans-serif]">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-[#3B3433] tracking-tight">Marketing & Tracking</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pixel, GTM & Verification</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Meta Pixel ID", "meta_pixel_id")}
            {renderField("Test Event Code", "test_event_code")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Google Tag Manager (GTM) ID", "gtm_id")}
            {/* 🌟 নতুন স্মার্ট ইনপুট ফিল্ড */}
            {renderField("Meta Domain Verification", "meta_verification_code", "input", "1", "Auto-extracts code from tag or filename")}
          </div>

          {renderField("Conversions API (CAPI) Token", "capi_access_token", "textarea", "2")}

          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
             <div className="mb-2">
                 <h3 className="text-sm font-bold text-gray-700">Custom Header Code</h3>
                 <p className="text-[11px] text-gray-500 mt-0.5">যেকোনো ভেরিফিকেশন কোড বা পিক্সেল স্ক্রিপ্ট সরাসরি এখানে পেস্ট করুন। এটি ওয়েবসাইটের &lt;head&gt; ট্যাগে বসবে।</p>
             </div>
             {renderField("Script / HTML", "custom_header_script", "textarea", "5")}
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-10 py-3.5 rounded-xl bg-[#8A1538] text-white font-bold shadow-xl hover:bg-[#6e112d] transition-all disabled:opacity-70 flex gap-3 items-center active:scale-95"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}