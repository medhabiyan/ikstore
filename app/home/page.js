"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("সব");
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const categoryRef = useRef(null);

  // ১. ট্রাস্ট ব্যাজ ডাটা
  const trustBadges = [
    { icon: "🌿", title: "শতভাগ কেমিক্যাল মুক্ত", desc: "একদম প্রাকৃতিক ও নিরাপদ" },
    { icon: "🥩", title: "১০০% হালাল মাংস", desc: "নিজস্ব তত্ত্বাবধানে জবাইকৃত" },
    { icon: "🚚", title: "দ্রুত হোম ডেলিভারি", desc: "সারা দেশে দ্রুত পৌঁছে দেই" },
    { icon: "💰", title: "ক্যাশ অন ডেলিভারি", desc: "পণ্য বুঝে পেয়ে টাকা দিন" }
  ];

  // ২. বৈশিষ্ট্য ডাটা
  const featuredData = {
    left: {
      title: "বৈশিষ্ট্য ১: শতভাগ খাঁটি ও তাজা",
      description: "প্রান্তিক কৃষক ও খামার থেকে সরাসরি সংগৃহীত\nসম্পূর্ণ ভেজালমুক্ত ও নিরাপদ পণ্য।",
      image: "https://res.cloudinary.com/dw6tdjbzb/image/upload/q_auto/f_auto/v1778390278/Beef_xmsxow.jpg"
    },
    right: {
      title: "বৈশিষ্ট্য ২: বিশ্বস্ত ও দ্রুত ডেলিভারি",
      description: "আপনার অর্ডার করা পণ্য খুব দ্রুত এবং\nসতেজ অবস্থায় দোরগোড়ায় পৌঁছে দেওয়ার নিশ্চয়তা।",
      image: "https://res.cloudinary.com/dw6tdjbzb/image/upload/q_auto/f_auto/v1778390277/cow-brain_ftd8tx.jpg"
    }
  };

  // ৩. টেস্টিমোনিয়াল ডাটা
  const testimonialsData = [
    {
      quote: "তাদের পণ্যের মান আসলেই অসাধারণ। একদম গ্রামের আসল স্বাদ পেয়েছি। ডেলিভারিও খুব দ্রুত ছিল।",
      name: "আব্দুর রহমান", tag: "নিয়মিত ক্রেতা", img: "https://placehold.co/100x100/e2e8f0/64748b"
    },
    {
      quote: "প্রথমবার অনলাইনে কাঁচা বাজার অর্ডার করে একটু ভয়ে ছিলাম, কিন্তু তাদের পণ্যের প্যাকেজিং এবং সতেজতা দেখে মুগ্ধ হয়েছি।",
      name: "সাদিয়া ইসলাম", tag: "ভেরিফাইড ক্রেতা", img: "https://placehold.co/100x100/e2e8f0/64748b"
    },
    {
      quote: "অনলাইন কেয়ার বাজারের সার্ভিস খুবই প্রফেশনাল। কাস্টমার সাপোর্ট থেকে শুরু করে পণ্যের মান—সবকিছুতেই তারা সেরা।",
      name: "মেহেদী হাসান", tag: "নিয়মিত ক্রেতা", img: "https://placehold.co/100x100/e2e8f0/64748b"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success) {
          const featuredCategories = catData.categories.filter(cat => cat.is_home === "TRUE");
          setCategories(featuredCategories);
        }

        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodData.success) {
          const reversedProds = prodData.products.reverse();
          setProducts(reversedProds);
          setFilteredProducts(reversedProds);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🌟 ক্যাটাগরি ট্যাব ফিল্টারিং লজিক
  useEffect(() => {
    if (activeTab === "সব") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => p.category === activeTab);
      setFilteredProducts(filtered);
    }
  }, [activeTab, products]);

  // ক্যাটাগরি অটো-লুপ ক্যারোজেল লজিক
  useEffect(() => {
    let interval;
    if (categories.length > 4 && categoryRef.current) {
      interval = setInterval(() => {
        if (categoryRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 5) {
            categoryRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            categoryRef.current.scrollBy({ left: 200, behavior: 'smooth' });
          }
        }
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [categories]);

  const scrollLeft = () => { if (categoryRef.current) categoryRef.current.scrollBy({ left: -300, behavior: 'smooth' }); };
  const scrollRight = () => { if (categoryRef.current) categoryRef.current.scrollBy({ left: 300, behavior: 'smooth' }); };
  const generateSlug = (name) => (name || "").toLowerCase().trim().replace(/\s+/g, '-');
  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);

  return (
    <div className="w-full font-bengali text-[#3A2415] bg-[#FDF8EC]">
      
      {/* ================= 🌟 হিরো ব্যানার ================= */}
      <section className="bg-gradient-to-b from-[#F3D7B1] to-[#FDF8EC] pt-12 md:pt-20 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0 z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="bg-[#5C2C16]/10 px-4 py-1.5 rounded-full text-[#5C2C16] font-extrabold mb-4 text-xs md:text-sm tracking-wider uppercase">
              অনলাইন কেয়ার বাজার
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#2F1608] leading-[1.2] mb-5 tracking-tight drop-shadow-sm">
              ঘরে বসেই করুন<br/>নির্ভেজাল বাজার
            </h1>
            <p className="text-[#5C2C16] font-medium text-sm md:text-base mb-8 max-w-md leading-relaxed hidden md:block">
              দেশি খামার ও প্রান্তিক কৃষকদের থেকে সংগৃহীত শতভাগ খাঁটি, সতেজ ও নিরাপদ পণ্যের নির্ভরযোগ্য ঠিকানা।
            </p>
            <Link href="/shop" className="inline-block bg-[#4E2413] text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold hover:bg-[#3B1A0E] transition-all shadow-[0_8px_20px_rgba(78,36,19,0.3)] text-sm md:text-base active:scale-95">
              বাজার ঘুরে দেখুন
            </Link>
          </div>
          <div className="md:w-1/2 relative flex justify-center md:justify-end items-end h-full w-full">
            <img src="https://res.cloudinary.com/dw6tdjbzb/image/upload/q_auto/f_auto/v1777450398/Home_Page_Photo_1_cfhxmw.png" alt="Fresh Products" className="w-full max-w-sm md:max-w-md object-cover rounded-t-2xl md:rounded-t-3xl shadow-sm" />
          </div>
        </div>
      </section>

      {/* ================= 🌟 ট্রাস্ট ব্যাজ সেকশন ================= */}
      <section className="bg-white py-8 md:py-12 border-b border-[#F0E4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-[#FDF8EC] transition-colors group">
                <span className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">{badge.icon}</span>
                <h4 className="font-bold text-[#4E2413] text-sm md:text-base mb-1">{badge.title}</h4>
                <p className="text-[#8B5A33] text-[10px] md:text-xs font-medium">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 🌟 ক্যাটাগরি হাইলাইট (লুপ ক্যারোজেল) ================= */}
      <section className="bg-[#FDF8EC] py-10 md:py-16 border-b border-[#F0E4D3]">
        <div className="max-w-6xl mx-auto px-4 relative">
          {categories.length > 4 && (
            <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white text-[#5C2C16] hidden md:block hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div ref={categoryRef} className={`flex flex-row gap-6 sm:gap-8 md:gap-14 overflow-x-auto pb-4 md:pb-0 custom-scrollbar ${categories.length <= 4 ? 'justify-center' : 'justify-start md:px-10'}`}>
            {isLoading ? (
              <div className="flex gap-4 md:gap-10 mx-auto">{[1, 2, 3].map(i => <div key={i} className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-[#EADDCA] animate-pulse"></div>)}</div>
            ) : (
              categories.map((cat, index) => (
                <Link href={`/category/${generateSlug(cat.name)}`} key={index} className="flex flex-col items-center group flex-shrink-0 min-w-[80px] md:min-w-[144px]">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 rounded-full bg-white overflow-hidden flex items-center justify-center mb-3 md:mb-4 shadow-sm group-hover:shadow-[0_8px_25px_rgba(223,122,21,0.3)] transition-all group-hover:-translate-y-1 p-1.5 md:p-2 border-2 border-transparent group-hover:border-[#DF7A15]">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="object-cover w-full h-full rounded-full" /> : <div className="text-gray-300 text-[10px] md:text-xs font-bold text-center leading-tight">No Image</div>}
                  </div>
                  <h3 className="font-extrabold text-[#4E2413] text-sm md:text-lg group-hover:text-[#DF7A15] transition-colors">{cat.name}</h3>
                </Link>
              ))
            )}
          </div>
          {categories.length > 4 && (
            <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white text-[#5C2C16] hidden md:block hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </section>

      {/* ================= 🌟 আমাদের প্রোডাক্টসমূহ (ট্যাব ফিল্টার সহ) ================= */}
      <section className="py-12 md:py-24 bg-[#FDF8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8 md:mb-10 text-[#2F1608]">আমাদের প্রোডাক্টসমূহ</h2>
          
          {/* ক্যাটাগরি ট্যাব বার */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-14">
            {["সব", "মাছ", "মাংস", "পাখির মাংস", "তেল", "মাছের ডিম", "চিনি", "গুড়"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 md:px-7 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all duration-300 border-2 ${activeTab === tab ? 'bg-[#5C2C16] text-white border-[#5C2C16] shadow-md' : 'bg-white text-[#5C2C16] border-white hover:border-[#EADDCA]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading 
              ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-48 md:h-64 bg-[#EADDCA] animate-pulse rounded-2xl"></div>) 
              : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-[#8B5A33] font-bold text-lg">দুঃখিত! এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                </div>
              )
            }
          </div>

          <div className="mt-12 md:mt-16 flex justify-center">
            <Link href="/shop" className="px-8 py-3 md:px-10 md:py-4 border-2 border-[#5C2C16] text-[#5C2C16] text-sm md:text-base font-bold rounded-full hover:bg-[#5C2C16] hover:text-white transition-all duration-300 shadow-sm flex items-center gap-2 group">
              সব প্রোডাক্ট দেখুন <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 🌟 ফিচারড হাইলাইট ================= */}
      <section className="bg-[#FFFDF9] py-12 md:py-16 overflow-hidden border-t border-[#F0E4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:hidden flex-col gap-8">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FDF8EC] shadow-lg flex-shrink-0"><img src={featuredData.left.image} alt="Left" className="w-full h-full object-cover" /></div>
              <div><h3 className="text-xl font-extrabold text-[#4E2413] mb-1">{featuredData.left.title}</h3><p className="text-[#8B5A33] text-sm whitespace-pre-line leading-snug font-medium">{featuredData.left.description}</p></div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FDF8EC] shadow-lg flex-shrink-0"><img src={featuredData.right.image} alt="Right" className="w-full h-full object-cover" /></div>
              <div><h3 className="text-xl font-extrabold text-[#4E2413] mb-1">{featuredData.right.title}</h3><p className="text-[#8B5A33] text-sm whitespace-pre-line leading-snug font-medium">{featuredData.right.description}</p></div>
            </div>
          </div>
          <div className="hidden md:flex flex-row items-center justify-center gap-4 relative">
            <div className="w-1/3 text-left z-10"><h3 className="text-3xl font-extrabold text-[#4E2413] mb-3">{featuredData.left.title}</h3><p className="text-[#8B5A33] text-lg whitespace-pre-line leading-relaxed font-medium">{featuredData.left.description}</p></div>
            <div className="w-1/3 flex justify-center items-center relative h-72 w-full z-0">
              <div className="w-64 h-64 rounded-full overflow-hidden border-[6px] border-[#FFFDF9] absolute left-1/2 -translate-x-[80%] z-10 shadow-xl"><img src={featuredData.left.image} alt="Left" className="w-full h-full object-cover" /></div>
              <div className="w-64 h-64 rounded-full overflow-hidden border-[6px] border-[#FFFDF9] absolute left-1/2 -translate-x-[20%] z-0 shadow-xl"><img src={featuredData.right.image} alt="Right" className="w-full h-full object-cover" /></div>
            </div>
            <div className="w-1/3 text-left pl-12 z-10"><h3 className="text-3xl font-extrabold text-[#4E2413] mb-3">{featuredData.right.title}</h3><p className="text-[#8B5A33] text-lg whitespace-pre-line leading-relaxed font-medium">{featuredData.right.description}</p></div>
          </div>
        </div>
      </section>

      {/* ================= 🌟 ক্রেতাদের মতামত ================= */}
      <section className="py-12 md:py-24 bg-[#FDF8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8 md:mb-12 text-[#2F1608]">ক্রেতাদের মতামত</h2>
          <div className="flex md:hidden items-center justify-between gap-2">
            <button onClick={prevTestimonial} className="p-2 text-[#5C2C16] hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-md min-h-[220px] flex flex-col justify-between animate-fade-in border border-[#F0E4D3]">
              <p className="text-[#5C2C16] text-sm leading-relaxed mb-6 font-medium">{testimonialsData[currentTestimonial].quote}</p>
              <div className="flex items-center gap-3">
                <img src={testimonialsData[currentTestimonial].img} alt={testimonialsData[currentTestimonial].name} className="w-12 h-12 rounded-full object-cover border-2 border-[#FDF8EC]" />
                <div><h4 className="font-extrabold text-[#4E2413] text-sm">{testimonialsData[currentTestimonial].name}</h4><p className="text-[#DF7A15] font-bold text-[10px]">{testimonialsData[currentTestimonial].tag}</p></div>
              </div>
            </div>
            <button onClick={nextTestimonial} className="p-2 text-[#5C2C16] hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-6">
            {testimonialsData.map((test, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_-4px_rgba(92,44,22,0.08)] hover:shadow-xl transition-shadow flex flex-col justify-between border border-[#F0E4D3]">
                <p className="text-[#5C2C16] text-base leading-relaxed mb-8 font-medium">{test.quote}</p>
                <div className="flex items-center gap-4">
                  <img src={test.img} alt={test.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#FDF8EC]" />
                  <div><h4 className="font-extrabold text-[#4E2413] text-base">{test.name}</h4><p className="text-[#DF7A15] font-bold text-xs">{test.tag}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 🌟 যোগাযোগ সেকশন ================= */}
      <section className="pb-12 md:pb-24 bg-[#FDF8EC] px-4">
        <div className="max-w-5xl mx-auto bg-[#4E2413] rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-[0_15px_40px_-10px_rgba(78,36,19,0.4)] border border-[#3B1A0E]">
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-3">যেকোনো প্রয়োজনে যোগাযোগ করুন</h3>
            <p className="text-[#EADDCA] text-sm md:text-lg font-medium">প্রোডাক্ট সম্পর্কে জানতে বা অর্ডার করতে সরাসরি আমাদের সাথে কথা বলুন। আমরা সবসময় প্রস্তুত আপনাকে সেরা সেবাটি দেওয়ার জন্য।</p>
          </div>
          <Link href="/contact" className="bg-[#DF7A15] text-white px-8 py-4 md:px-12 md:py-5 rounded-full font-black hover:bg-[#C96C12] transition-colors text-sm md:text-lg shadow-lg whitespace-nowrap active:scale-95 border-2 border-[#DF7A15] hover:border-[#C96C12]">
            Contact Us
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&display=swap');
        .font-bengali { font-family: 'Noto Sans Bengali', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0.5; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}