"use client";
import { useState, useEffect, use } from "react"; 
import Link from "next/link";
import OfferCheckout from "../../../components/OfferCheckout";

// কারেন্সি ফরম্যাট করার ফাংশন
const formatPrice = (price) => {
  if (!price) return "0";
  const numericPrice = Number(price.toString().replace(/[^0-9.-]+/g, ""));
  if (isNaN(numericPrice)) return price; 
  return new Intl.NumberFormat('en-IN').format(numericPrice);
};

export default function OfferPage({ params }) {
  // params কে আনর‍্যাপ করা (Next.js 15+ এর নিয়ম)
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSticky, setShowSticky] = useState(false);

  // ১. ডেটা ফেচিং লজিক
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const decodedSlug = decodeURIComponent(slug);
          const found = data.products.find(p => p.slug === decodedSlug);
          setProduct(found);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // ২. ফ্লোটিং বাটন লজিক: ৮০০px স্ক্রল করলে দেখাবে, চেকআউটে গেলে লুকাবে
  useEffect(() => {
    const handleScroll = () => {
      const checkoutSection = document.getElementById("order-form");
      let isCheckoutVisible = false;

      if (checkoutSection) {
        const rect = checkoutSection.getBoundingClientRect();
        isCheckoutVisible = rect.top <= window.innerHeight; 
      }

      if (window.scrollY > 800 && !isCheckoutVisible) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]"><div className="w-10 h-10 border-4 border-[#800020] border-t-transparent rounded-full animate-spin"></div></div>;

  if (!product || product.is_landing_page !== 'TRUE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF8] p-6 text-center">
        <h2 className="text-2xl font-black text-[#800020] mb-4">অফারটি পাওয়া যায়নি!</h2>
        <Link href="/" className="bg-[#800020] text-white px-10 py-3 rounded-full font-bold shadow-lg">হোমে ফিরে যান</Link>
      </div>
    );
  }

  // ================= 🌟 স্মার্ট ইমেজ লজিক =================
  const allImages = product.image ? product.image.split(",").map(img => img.trim()).filter(Boolean) : [];
  
  // চেক করা হচ্ছে আলাদা হিরো ইমেজ আছে কি না
  const hasDedicatedHero = !!product.lp_hero_image;
  
  // হিরো ইমেজ: থাকলে নতুনটা, না থাকলে গ্যালারির প্রথমটা
  const heroImage = hasDedicatedHero ? product.lp_hero_image : (allImages[0] || "");
  
  // গ্যালারি ইমেজ: হিরো ইমেজ আলাদা থাকলে গ্যালারিতে সব স্কয়ার ছবি দেখাবে, না থাকলে প্রথমটা বাদে বাকিগুলো দেখাবে
  const galleryImages = hasDedicatedHero ? allImages.slice(0, 5) : allImages.slice(1, 6);
  // ==========================================================

  const features = product.lp_features_list ? product.lp_features_list.split(',').map(f => f.trim()).filter(Boolean) : [];

  return (
    <div className="bg-[#FCFBF8] min-h-screen font-['Noto_Sans_Bengali',sans-serif] text-[#2C2A29] selection:bg-[#B8905B]/30">
      
      {/* ১. হিরো সেকশন */}
      <section className="relative pt-2 md:pt-6 pb-16 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F3EFE6] -z-10 rounded-l-[100px] opacity-50 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="w-full lg:w-1/2 flex justify-center order-1">
            <div className="relative group">
              <div className="absolute inset-0 border-2 border-[#B8905B]/20 translate-x-4 translate-y-4 rounded-t-[160px] rounded-b-[20px] -z-10"></div>
              
              {/* হিরো ইমেজ কন্টেইনার (কার্ভ শেপ) */}
              <div className="p-2 bg-white rounded-t-[160px] rounded-b-[24px] shadow-2xl border border-[#E5DFD3]">
                <img src={heroImage} alt={product.name} className="w-full max-w-[400px] h-[450px] md:h-[600px] object-cover rounded-t-[150px] rounded-b-[16px]" />
              </div>
              
              <div className="absolute -left-4 top-1/4 bg-[#B8905B] text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full shadow-xl -rotate-12">
                {product.brand || "Premium"}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 text-center lg:text-left order-2">
            <span className="inline-block text-[#B8905B] font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-3">{product.lp_slogan}</span>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-[#2C2A29] leading-tight mb-4">
              {product.name} <br/>
              <span className="text-base md:text-lg font-light italic text-[#5A5753] mt-1 block">{product.lp_headline}</span>
            </h1>

            <p className="text-[#5A5753] text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">{product.description}</p>
            <div className="flex items-baseline justify-center lg:justify-start gap-3 mb-10">
               <span className="text-4xl md:text-6xl font-black text-[#800020]">৳ {formatPrice(product.price)}</span>
               {product.regular_price && <span className="text-xl md:text-2xl text-[#A9A49E] line-through">৳ {formatPrice(product.regular_price)}</span>}
            </div>
            <a href="#order-form" className="inline-flex items-center gap-3 px-12 py-5 bg-[#800020] text-white text-lg font-bold shadow-2xl hover:-translate-y-1 transition-all">অর্ডার করতে ক্লিক করুন ➔</a>
          </div>
        </div>
      </section>

      {/* ২. ফিচার সেকশন */}
      <section className="bg-[#F3EFE6] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-black text-[#2C2A29]">{product.lp_features_title}</h3>
            <div className="w-20 h-1 bg-[#B8905B] mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 border border-[#E5DFD3] rounded-tr-[40px] rounded-bl-[40px] shadow-sm">
                <div className="w-10 h-10 bg-[#800020]/5 rounded-full flex items-center justify-center mb-4 text-[#800020] font-black">{i+1}</div>
                <p className="text-lg font-bold text-[#2C2A29]">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ৩. গ্যালারি (🌟 এখানে স্কয়ার এবং object-contain দেওয়া হয়েছে) */}
      {galleryImages.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
              {galleryImages.map((img, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-2xl shadow-md border border-[#E5DFD3] aspect-square flex items-center justify-center overflow-hidden">
                  <img src={img} alt="Gallery" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
              <div className="bg-[#2C2A29] flex items-center justify-center p-8 text-center border-4 border-[#B8905B]/30 col-span-2 md:col-span-1 rounded-2xl min-h-[200px]">
                 <p className="text-[#E5DFD3] text-lg md:text-xl font-light italic leading-relaxed">"{product.lp_gallery_quote}"</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ৪. আলাদা FOMO সেকশন */}
      {product.lp_fomo_text && (
        <section className="py-12 bg-[#800020] shadow-[0_-10px_40px_rgba(128,0,32,0.2)]">
           <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.1em] animate-pulse">
                ⚡ {product.lp_fomo_text}
              </h2>
           </div>
        </section>
      )}

      {/* ৫. চেকআউট সেকশন */}
      <section id="order-form" className="py-20 lg:py-32 bg-[#F3EFE6] px-4 md:px-8">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h4 className="text-[#B8905B] font-bold uppercase text-xs tracking-widest mb-2">নিরাপদ চেকআউট</h4>
              <h2 className="text-3xl md:text-5xl font-black text-[#2C2A29]">অর্ডার কনফার্ম করুন</h2>
            </div>
            <div className="bg-white border-2 border-[#E5DFD3] shadow-2xl p-4 md:p-10 rounded-xl md:rounded-[2rem]">
               <OfferCheckout product={product} />
            </div>
         </div>
      </section>

      {/* স্টিকি বাটন */}
      <div className={`fixed bottom-6 left-0 w-full px-6 z-50 lg:hidden transition-all duration-500 transform ${showSticky ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <a href="#order-form" className="flex items-center justify-center bg-[#800020] text-white py-4 rounded-xl font-black text-lg shadow-2xl border-2 border-white/10">এখনই অর্ডার করুন</a>
      </div>
    </div>
  );
}