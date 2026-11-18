"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function AddProductPage() {
  const router = useRouter(); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  
  // 🌟 ইমেজ স্টেট: ছবির প্রিভিউ এবং সিরিয়াল মেইনটেইন করার জন্য
  const [imageList, setImageList] = useState([]); 
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🌟 ল্যান্ডিং পেজ এবং প্রাইমারি ভেরিয়েন্টের স্টেট
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [primaryName, setPrimaryName] = useState("Color");
  const [variants, setVariants] = useState([]);
  const [variantInput, setVariantInput] = useState({ name: "", price: "", file: null });

  // 🌟 ডাইনামিক এট্রিবিউট স্টেট
  const [attributes, setAttributes] = useState([]); 
  const [attrInput, setAttrInput] = useState({ label: "", values: "" });

  const [formData, setFormData] = useState({
    name: "", permalink: "", price: "", regular_price: "", category: "", brand: "", stock: "", warranty: "", specifications: "", description: "",    
    lp_slogan: "", lp_headline: "", lp_features_title: "", lp_features_list: "", lp_gallery_quote: "", lp_fomo_text: "",
  });

  useEffect(() => {
    async function fetchAttributes() {
      try {
        const [catRes, brandRes] = await Promise.all([ fetch('/api/attributes?type=category'), fetch('/api/attributes?type=brand') ]);
        if (catRes.ok) { const catData = await catRes.json(); if (catData.success) setCategories(catData.data || []); }
        if (brandRes.ok) { const brandData = await brandRes.json(); if (brandData.success) setBrands(brandData.data || []); }
      } catch (error) { console.error("Error fetching attributes", error); } finally { setIsLoadingAttributes(false); }
    }
    fetchAttributes();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ================= 🌟 ভেরিয়েন্ট ও এট্রিবিউট হ্যান্ডলার =================
  const handleAddVariant = () => {
    if (!variantInput.name || !variantInput.price) { alert("ভেরিয়েন্টের নাম এবং দাম দিন!"); return; }
    setVariants([...variants, variantInput]);
    setVariantInput({ name: "", price: "", file: null }); 
  };

  const handleAddAttribute = () => {
    if (!attrInput.label || !attrInput.values) { alert("এট্রিবিউটের নাম এবং ভ্যালু দিন!"); return; }
    setAttributes([...attributes, attrInput]);
    setAttrInput({ label: "", values: "" });
  };
  // =======================================================================

  // ================= 🌟 স্মার্ট ইমেজ ম্যানেজমেন্ট লজিক =================
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file) 
    }));
    setImageList(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    const newList = [...imageList];
    URL.revokeObjectURL(newList[index].preview);
    newList.splice(index, 1);
    setImageList(newList);
  };

  const moveImage = (index, direction) => {
    const newList = [...imageList];
    if (direction === 'left' && index > 0) {
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    } else if (direction === 'right' && index < newList.length - 1) {
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    }
    setImageList(newList);
  };

  const handleHeroImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const removeHeroImage = () => {
    setHeroImageFile(null);
    if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
    setHeroImagePreview(null);
  };
  // =====================================================================

  const uploadImagesToCloudinary = async (files) => {
    const uploadedUrls = [];
    const cloudName = "dw6tdjbzb"; 
    const uploadPreset = "ehlk35wj"; 

    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("upload_preset", uploadPreset); 
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
      const json = await res.json();
      if (json.secure_url) uploadedUrls.push(json.secure_url);
    }
    return uploadedUrls.join(","); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrls = "";
      if (imageList.length > 0) {
        setLoadingText(`মেইন ও গ্যালারি ছবি আপলোড হচ্ছে...`);
        const filesToUpload = imageList.map(item => item.file);
        finalImageUrls = await uploadImagesToCloudinary(filesToUpload);
      }

      let finalHeroImageUrl = "";
      if (isLandingPage && heroImageFile) {
        setLoadingText(`হিরো ছবি আপলোড হচ্ছে...`);
        finalHeroImageUrl = await uploadImagesToCloudinary([heroImageFile]);
      }

      let finalVariantsString = "";
      if (variants.length > 0) {
        setLoadingText(`ভেরিয়েন্টের ছবি আপলোড হচ্ছে...`);
        const variantPromises = variants.map(async (v) => {
          let vUrl = "";
          if (v.file) { vUrl = await uploadImagesToCloudinary([v.file]); }
          return `${v.name}:${v.price}:${vUrl}`;
        });
        const resolvedVariants = await Promise.all(variantPromises);
        finalVariantsString = resolvedVariants.join(", ");
      }

      setLoadingText("শিটে সেভ হচ্ছে...");

      const processedAttrs = attributes.map(a => `${a.label}=${a.values}`).join(" | ");
      const processedSpecs = formData.specifications 
        ? formData.specifications.split(',').map(s => s.trim()).filter(Boolean).join('|')
        : "";

      const productData = { 
        ...formData, 
        image: finalImageUrls,
        lp_hero_image: finalHeroImageUrl, 
        variants: finalVariantsString,
        is_landing_page: isLandingPage ? "TRUE" : "FALSE",
        primary_variant_name: primaryName, 
        attributes: processedAttrs,
        specifications: processedSpecs 
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const result = await res.json();
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => { setShowSuccess(false); router.push("/admin?tab=products"); }, 2000);
      } else { alert("সমস্যা হয়েছে: " + result.error); }
    } catch (error) { alert("সার্ভার এরর!"); } finally { setIsSubmitting(false); setLoadingText(""); }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3B3433] p-6 md:p-10 relative font-['Noto_Sans_Bengali',sans-serif]">
      
      {showSuccess && (
        <div className="fixed bottom-10 right-10 z-[100] animate-slide-up">
          <div className="bg-[#2B2927] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div><h4 className="font-bold text-sm">সফলভাবে যুক্ত হয়েছে!</h4></div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#8A1538]">নতুন প্রোডাক্ট ও ল্যান্ডিং পেজ</h1>
            <p className="text-gray-500 text-sm mt-1">স্মার্ট ইমেজ রেশিও এবং ল্যান্ডিং পেজ কনফিগারেশন</p>
          </div>
          <Link href="/admin?tab=products" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm">ফিরে যান</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
          
          {/* ================= 🌟 ল্যান্ডিং পেজ ও হিরো ইমেজ সেকশন ================= */}
          <div className="bg-[#8A1538]/5 p-6 rounded-[2rem] border border-[#8A1538]/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#8A1538] text-base">Enable Premium Landing Page</h4>
                <p className="text-xs text-gray-600 mt-1">এই প্রোডাক্টের জন্য ল্যান্ডিং পেজ ডিজাইনটি কি সচল করবেন?</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isLandingPage} onChange={() => setIsLandingPage(!isLandingPage)} className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#8A1538]"></div>
              </label>
            </div>

            {isLandingPage && (
              <div className="mt-8 pt-8 border-t border-[#8A1538]/10 space-y-6 animate-fade-in">
                
                <div className="bg-white p-5 rounded-2xl border border-[#8A1538]/20 shadow-sm">
                  <label className="block text-sm font-bold text-[#8A1538] mb-1">ল্যান্ডিং পেজ হিরো ইমেজ (ঐচ্ছিক তবে প্রস্তাবিত)</label>
                  <p className="text-[10px] text-gray-500 mb-4">শুধুমাত্র ল্যান্ডিং পেজের ওপরের অংশের জন্য। প্রস্তাবিত সাইজ: <span className="font-bold">Portrait (২:৩ রেশিও) বা 800x1200px</span></p>
                  
                  {heroImagePreview ? (
                    <div className="relative w-32 h-48 rounded-xl overflow-hidden border-2 border-[#8A1538]">
                      <img src={heroImagePreview} alt="Hero" className="w-full h-full object-cover" />
                      <button type="button" onClick={removeHeroImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full sm:w-48 px-4 py-8 bg-[#8A1538]/5 border-2 border-dashed border-[#8A1538]/30 rounded-2xl text-center hover:bg-[#8A1538]/10 transition-all cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleHeroImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <svg className="w-8 h-8 mx-auto mb-2 text-[#8A1538]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <p className="text-xs font-bold text-[#8A1538]">হিরো ছবি সিলেক্ট করুন</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ছোট স্লোগান (Hero Slogan)</label>
                    <input type="text" name="lp_slogan" value={formData.lp_slogan} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm" placeholder="উদাঃ আভিজাত্যের নতুন সংজ্ঞা" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">প্রোডাক্ট হেডলাইন</label>
                    <input type="text" name="lp_headline" value={formData.lp_headline} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm" placeholder="উদাঃ প্রিমিয়াম জাফরান পাঞ্জাবি" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ফিচার সেকশন টাইটেল</label>
                  <input type="text" name="lp_features_title" value={formData.lp_features_title} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm" placeholder="কেন এটি আপনার সংগ্রহে থাকা উচিত?" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ফিচার লিস্ট (কমা দিয়ে আলাদা করুন)</label>
                  <textarea name="lp_features_list" value={formData.lp_features_list} onChange={handleInputChange} rows="2" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm" placeholder="উন্নত ফেব্রিক্স, ধবধবে সাদা কালার, স্মার্ট লুক..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Gallery Quote (কোটেশন)</label>
                    <input type="text" name="lp_gallery_quote" value={formData.lp_gallery_quote} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm" placeholder="শুভ্রতায় মিশে থাকুক আপনার আভিজাত্য" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">FOMO / স্টক মেসেজ</label>
                    <input type="text" name="lp_fomo_text" value={formData.lp_fomo_text} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm text-red-600 font-bold" placeholder="স্টক সীমিত! আজই অর্ডার করুন" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= 🌟 সাধারণ প্রোডাক্ট তথ্য ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">প্রোডাক্টের নাম *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ইউনিক URL (Permalink) *</label>
              <input required type="text" name="permalink" value={formData.permalink} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ক্যাটাগরি</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] cursor-pointer">
                <option value="">সিলেক্ট করুন</option>
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ব্র্যান্ড</label>
              <select name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] cursor-pointer">
                <option value="">সিলেক্ট করুন</option>
                {brands.map((b, i) => <option key={i} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">রেগুলার দাম (৳) (ঐচ্ছিক)</label>
              <input type="number" name="regular_price" value={formData.regular_price} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">বর্তমান দাম (৳) *</label>
              <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] font-bold text-[#8A1538]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">স্টক (কত পিস আছে) *</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538]" placeholder="উদাঃ 50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ওয়ারেন্টি (ঐচ্ছিক)</label>
              <input type="text" name="warranty" value={formData.warranty} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538]" placeholder="উদাঃ ৬ মাসের গ্যারান্টি" />
            </div>
          </div>

          {/* ================= 🌟 প্রাইমারি ভেরিয়েন্ট ও ছবি আপলোড ================= */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
            <label className="block text-xs font-bold text-[#8A1538] uppercase tracking-widest">প্রাইমারি ভেরিয়েন্ট বিল্ডার (যা দাম ও ছবি বদলাবে)</label>
            
            <div>
              <input 
                type="text" 
                placeholder="ভেরিয়েন্টের নাম দিন (যেমন: Color বা Model)" 
                value={primaryName} 
                onChange={(e) => setPrimaryName(e.target.value)} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#8A1538] text-sm bg-white font-bold text-[#8A1538]" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" placeholder="অপশন (যেমন: Black)" value={variantInput.name} onChange={(e) => setVariantInput({...variantInput, name: e.target.value})} className="px-3 py-2.5 border rounded-xl outline-none text-sm bg-white" />
              <input type="number" placeholder="দাম (৳)" value={variantInput.price} onChange={(e) => setVariantInput({...variantInput, price: e.target.value})} className="px-3 py-2.5 border rounded-xl outline-none text-sm bg-white" />
              <input type="file" accept="image/*" onChange={(e) => setVariantInput({...variantInput, file: e.target.files[0]})} className="text-[10px] w-full pt-2" title="ভেরিয়েন্টের নির্দিষ্ট ছবি" />
              <button type="button" onClick={handleAddVariant} className="bg-[#8A1538] text-white rounded-xl font-bold text-sm py-2 hover:bg-[#6e112d] transition-colors shadow-sm">+ Add Variant</button>
            </div>
            
            {variants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
                {variants.map((v, i) => (
                  <div key={i} className="bg-white border px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                    {v.name} <span className="text-[#8A1538]">(৳{v.price})</span> {v.file && "🖼️"}
                    <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 font-bold ml-1 hover:text-red-700">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= 🌟 ডাইনামিক এট্রিবিউট ================= */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">ডাইনামিক এট্রিবিউট (উদাঃ সাইজ)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Label (উদাঃ Size)" value={attrInput.label} onChange={(e) => setAttrInput({...attrInput, label: e.target.value})} className="px-3 py-2.5 border rounded-xl outline-none text-sm bg-white" />
              <input type="text" placeholder="Values (M, L, XL)" value={attrInput.values} onChange={(e) => setAttrInput({...attrInput, values: e.target.value})} className="px-3 py-2.5 border rounded-xl outline-none text-sm bg-white" />
              <button type="button" onClick={handleAddAttribute} className="bg-gray-800 text-white rounded-xl font-bold text-sm py-2 hover:bg-black transition-colors shadow-sm">+ Add</button>
            </div>
            {attributes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
                {attributes.map((a, i) => (
                  <div key={i} className="bg-white border px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                    {a.label}: <span className="text-gray-500">{a.values}</span>
                    <button type="button" onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} className="text-red-500 font-bold ml-1 hover:text-red-700">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= 🌟 স্পেসিফিকেশন ও বিবরণ ================= */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">স্পেসিফিকেশন / ফিচারসমূহ</label>
              <p className="text-[10px] text-gray-400 mb-2">প্রতিটি পয়েন্ট কমা <code className="bg-gray-100 text-red-500 px-1 rounded">,</code> দিয়ে আলাদা করে লিখুন।</p>
              <textarea name="specifications" value={formData.specifications} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm leading-relaxed" placeholder="যেমন: ১০০% খাঁটি, কোন কেমিক্যাল নেই, তাজা প্যাকিং"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">প্রোডাক্টের বিস্তারিত বিবরণ</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] text-sm leading-relaxed" placeholder="প্রোডাক্টের বিস্তারিত বর্ণনা লিখুন..."></textarea>
            </div>
          </div>

          {/* ================= 🌟 প্রোডাক্ট মেইন ইমেজ (Square) ও রি-অর্ডার ================= */}
          <div className="border-t border-gray-100 pt-8">
            <label className="block text-sm font-bold text-[#3B3433] mb-1">
              প্রোডাক্ট মেইন ও গ্যালারি ইমেজ (একাধিক ছবি সিলেক্ট করতে পারেন) *
            </label>
            <p className="text-[10px] text-gray-500 mb-4">প্রস্তাবিত সাইজ: <span className="font-bold">Square (১:১ রেশিও) বা 800x800px</span></p>
            
            <div className="w-full px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl text-center hover:bg-gray-100 transition-all cursor-pointer relative mb-6">
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-sm font-bold">এখানে ক্লিক করে ছবি সিলেক্ট করুন</p>
              </div>
            </div>

            {imageList.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 mb-4 uppercase tracking-widest">ছবির সিরিয়াল সাজান (প্রথমটি মেইন ইমেজ হবে)</h4>
                <div className="flex flex-wrap gap-4">
                  {imageList.map((imgObj, index) => (
                    <div key={index} className={`relative flex flex-col items-center w-28 p-2 rounded-xl border-2 transition-all ${index === 0 ? 'border-emerald-500 bg-emerald-50/30 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                      
                      {index === 0 && <span className="absolute -top-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">মেইন ইমেজ</span>}
                      
                      <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm z-10">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>

                      <img src={imgObj.preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg mb-2 bg-white" />
                      
                      <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-gray-200/50">
                        <button type="button" onClick={() => moveImage(index, 'left')} disabled={index === 0} className={`p-1.5 rounded-md transition ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                        <button type="button" onClick={() => moveImage(index, 'right')} disabled={index === imageList.length - 1} className={`p-1.5 rounded-md transition ${index === imageList.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* ====================================================================================== */}

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#2B2927] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all flex justify-center items-center gap-3 shadow-xl disabled:opacity-70 mt-8">
            {isSubmitting ? ( <><span className="w-5 h-5 border-2 border-white/30 border-t-[#E5B361] rounded-full animate-spin"></span> {loadingText}</> ) : "প্রোডাক্ট ও ল্যান্ডিং পেজ সেভ করুন"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}