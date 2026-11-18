"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // মোবাইলের টেস্টিমোনিয়াল স্লাইডারের জন্য স্টেট
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // 🌟 ক্যাটাগরি ক্যারোজেলের জন্য Ref
  const categoryRef = useRef(null);

  // ============================================================
  // ১. ফিচারড হাইলাইট ডাটা (সেন্টার ওভারল্যাপিং ডিজাইনের জন্য)
  // ============================================================
  const featuredData = {
    left: {
      title: "স্মার্ট ও ইউনিক গ্যাজেট",
      description: "দৈনন্দিন জীবনকে সহজ করতে\nআধুনিক ও কার্যকরী সব গ্যাজেট",
      image: "https://res.cloudinary.com/dw6tdjbzb/image/upload/v1794981548/smart_gadget_fqabuf.png"
    },
    right: {
      title: "প্রিমিয়াম কোয়ালিটি ও টুলস",
      description: "সেরা পারফরম্যান্সের নিশ্চয়তা\nটেকসই ইলেকট্রনিকস ও এক্সেসরিজ",
      image: "https://res.cloudinary.com/dw6tdjbzb/image/upload/v1794981547/smart_tools_jzobes.png"
    }
  };

  // ============================================================
  // ২. টেস্টিমোনিয়াল ডাটা (ইলেকট্রনিকস ও গ্যাজেট রিলেটেড বাংলায়)
  // ============================================================
  const testimonialsData = [
    {
      quote: "ডিজিটাল মেজারিং চামচটি রান্নার কাজে দারুণ সুবিধা দিচ্ছে! মাপ একদম নিখুঁত আসে এবং কোয়ালিটিও খুব ভালো।",
      name: "তানজিনা আক্তার", tag: "গৃহিণী", img: "https://placehold.co/100x100/e2e8f0/64748b"
    },
    {
      quote: "OCOOPA হ্যান্ড ওয়ার্মারটি শীতে ব্যবহারের জন্য অসাধারণ একটি গ্যাজেট। ব্যাটারি ব্যাকআপ এবং হিটিং পারফরম্যান্স দুর্দান্ত।",
      name: "রাশেদুল করিম", tag: "গ্যাজেট প্রেমী", img: "https://placehold.co/100x100/e2e8f0/64748b"
    },
    {
      quote: "IMDAD Electronics থেকে অর্ডার করে খুব দ্রুত ডেলিভারি পেয়েছি। তাদের প্রতিটি গ্যাজেটই ইউনিক এবং দামও একদম সাধ্যের মধ্যে।",
      name: "সাজিদ হাসান", tag: "নিয়মিত ক্রেতা", img: "https://placehold.co/100x100/e2e8f0/64748b"
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
          setProducts(prodData.products.reverse());
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const scrollLeft = () => {
    if (categoryRef.current) categoryRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (categoryRef.current) categoryRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const generateSlug = (name) => {
    return (name || "").toLowerCase().trim().replace(/\s+/g, '-');
  };

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);

  return (
    <div className="w-full font-bengali text-[#0F2830] bg-[#F8FAFC]">
      
      {/* ================= 🌟 হিরো ব্যানার (ইমেজ একদম নিচের বর্ডারের সাথে লাগোয়া) ================= */}
      <section className="bg-gradient-to-r from-[#E0F7FA]/60 via-[#E0F7FA]/30 to-white pt-10 md:pt-16 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-end justify-between">
          
          {/* বামের লেখা ও বাটন - নিচে পর্যাপ্ত প্যাডিং দেওয়া হয়েছে */}
          <div className="md:w-1/2 z-10 flex flex-col items-center md:items-start text-center md:text-left pt-6 md:pt-12 pb-10 md:pb-24">
            <p className="text-gray-500 font-bold mb-4 text-xs md:text-sm tracking-wider uppercase bg-[#E0F7FA] px-4 py-1.5 rounded-full inline-block">
              IMDAD Electronics • Best Online Gadgets
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black text-[#0F2830] leading-[1.1] mb-5 tracking-tight drop-shadow-sm">
              স্মার্ট ইলেকট্রনিকস<br/>ও ইউনিক গ্যাজেট
            </h1>
            <p className="text-gray-600 font-medium text-sm md:text-base mb-8 max-w-md leading-relaxed hidden md:block">
              দৈনন্দিন জীবন ও কাজকে আরও সহজ করতে সেরা মানের ইলেকট্রিক গ্যাজেট, এক্সেসরিজ এবং স্মার্ট টুলসের বিশ্বস্ত অনলাইন শপ।
            </p>
            <Link href="/shop" className="inline-block bg-[#FF5A36] text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-bold hover:bg-[#E04B2A] transition-all shadow-lg text-sm md:text-base active:scale-95">
              গ্যাজেট এক্সপ্লোর করুন
            </Link>
          </div>

          {/* ডানের ইমেজের ডিভ - md:self-end এবং -mb-2 দিয়ে একদম নিচে নামানো হয়েছে */}
          <div className="md:w-1/2 relative flex justify-center md:justify-end items-end w-full md:self-end -mb-1 md:-mb-2">
            <div className="absolute bottom-0 right-4 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-[#80DEEA]/40 rounded-full -z-10 blur-2xl"></div>
            <img 
              src="https://res.cloudinary.com/dw6tdjbzb/image/upload/v1794981549/Imdad_Hero_dj2uyj.png" 
              alt="IMDAD Electronics Smart Gadgets" 
              className="w-full max-w-[360px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[580px] h-auto object-contain object-bottom z-10 drop-shadow-2xl block" 
            />
          </div>

        </div>
      </section>

      {/* ================= 🌟 ক্যাটাগরি হাইলাইট (গোল ইমেজ ফিক্স সহ) ================= */}
      <section className="bg-white py-10 md:py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 relative">
          
          {categories.length > 4 && (
            <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2.5 rounded-full hover:bg-gray-50 text-[#0F2830] hidden md:block hover:scale-110 transition-transform border border-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          <div 
            ref={categoryRef}
            className={`flex flex-row gap-8 sm:gap-10 md:gap-20 overflow-x-auto pb-4 md:pb-0 custom-scrollbar ${categories.length <= 4 ? 'justify-center' : 'justify-start md:px-10'}`}
          >
            {isLoading ? (
              <div className="flex gap-4 md:gap-10 mx-auto">{[1, 2, 3].map(i => <div key={i} className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 animate-pulse"></div>)}</div>
            ) : (
              categories.map((cat, index) => (
                <Link href={`/category/${generateSlug(cat.name)}`} key={index} className="flex flex-col items-center group flex-shrink-0">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#F8FAFC] overflow-hidden flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 border-[4px] md:border-[6px] border-white ring-1 ring-gray-100 p-1.5 md:p-3">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="object-cover w-full h-full rounded-full drop-shadow-sm" 
                      />
                    ) : (
                      <div className="text-gray-400 text-[10px] md:text-xs font-bold text-center">No Image</div>
                    )}
                  </div>
                  <h3 className="font-extrabold text-[#0F2830] text-xs md:text-base group-hover:text-[#FF5A36] transition-colors text-center">{cat.name}</h3>
                </Link>
              ))
            )}
          </div>

          {categories.length > 4 && (
            <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2.5 rounded-full hover:bg-gray-50 text-[#0F2830] hidden md:block hover:scale-110 transition-transform border border-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

        </div>
      </section>

      {/* ================= 🌟 Our Products ================= */}
      <section className="py-12 md:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8 md:mb-12 text-[#0F2830]">আমাদের কালেকশন</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading 
              ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>) 
              : products.map((product) => <ProductCard key={product.id} product={product} />)
            }
          </div>
          <div className="mt-10 md:mt-16 flex justify-center">
            <Link href="/shop" className="px-8 py-3 md:px-10 md:py-4 border-2 border-[#0F2830] text-[#0F2830] text-sm md:text-base font-bold rounded-full hover:bg-[#0F2830] hover:text-white transition-all duration-300 shadow-sm flex items-center gap-2 group">
              সব প্রোডাক্ট দেখুন <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 🌟 ফিচারড হাইলাইট (ওভারল্যাপিং ডিজাইন) ================= */}
      <section className="bg-white py-12 md:py-20 overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* মোবাইলের জন্য সাধারণ লেআউট */}
          <div className="flex md:hidden flex-col gap-8">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <img src={featuredData.left.image} alt={featuredData.left.title} className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0F2830] mb-1">{featuredData.left.title}</h3>
                <p className="text-gray-500 text-sm whitespace-pre-line leading-snug font-medium">{featuredData.left.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <img src={featuredData.right.image} alt={featuredData.right.title} className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0F2830] mb-1">{featuredData.right.title}</h3>
                <p className="text-gray-500 text-sm whitespace-pre-line leading-snug font-medium">{featuredData.right.description}</p>
              </div>
            </div>
          </div>

          {/* ডেস্কটপের জন্য ওভারল্যাপিং সার্কেল ডিজাইন */}
          <div className="hidden md:flex flex-row items-center justify-center gap-4 relative">
            <div className="w-1/3 text-left z-10">
              <h3 className="text-3xl font-extrabold text-[#0F2830] mb-3">{featuredData.left.title}</h3>
              <p className="text-gray-500 text-lg whitespace-pre-line leading-relaxed font-medium">{featuredData.left.description}</p>
            </div>
            <div className="w-1/3 flex justify-center items-center relative h-72 z-0">
              <div className="w-60 h-60 md:w-64 md:h-64 absolute left-1/2 -translate-x-[75%] z-10 flex items-center justify-center">
                <img src={featuredData.left.image} alt={featuredData.left.title} className="w-full h-full object-contain drop-shadow-xl" />
              </div>
              <div className="w-60 h-60 md:w-64 md:h-64 absolute left-1/2 -translate-x-[25%] z-0 flex items-center justify-center">
                <img src={featuredData.right.image} alt={featuredData.right.title} className="w-full h-full object-contain drop-shadow-xl" />
              </div>
            </div>
            <div className="w-1/3 text-left pl-12 z-10">
              <h3 className="text-3xl font-extrabold text-[#0F2830] mb-3">{featuredData.right.title}</h3>
              <p className="text-gray-500 text-lg whitespace-pre-line leading-relaxed font-medium">{featuredData.right.description}</p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 🌟 Testimonials ================= */}
      <section className="py-12 md:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8 md:mb-12 text-[#0F2830]">ক্রেতাদের মতামত</h2>
          
          <div className="flex md:hidden items-center justify-between gap-2">
            <button onClick={prevTestimonial} className="p-2 text-[#0F2830] hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
            
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm min-h-[220px] flex flex-col justify-between animate-fade-in border border-gray-100">
              <p className="text-[#0F2830] text-sm leading-relaxed mb-6 font-bold">"{testimonialsData[currentTestimonial].quote}"</p>
              <div className="flex items-center gap-3">
                <img src={testimonialsData[currentTestimonial].img} alt={testimonialsData[currentTestimonial].name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                <div>
                  <h4 className="font-extrabold text-[#0F2830] text-sm">{testimonialsData[currentTestimonial].name}</h4>
                  <p className="text-gray-500 font-bold text-[10px]">{testimonialsData[currentTestimonial].tag}</p>
                </div>
              </div>
            </div>

            <button onClick={nextTestimonial} className="p-2 text-[#0F2830] hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-6">
            {testimonialsData.map((test, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-gray-100">
                <p className="text-[#0F2830] text-base leading-relaxed mb-8 font-bold">"{test.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={test.img} alt={test.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
                  <div>
                    <h4 className="font-extrabold text-[#0F2830] text-base">{test.name}</h4>
                    <p className="text-gray-500 font-bold text-xs">{test.tag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= 🌟 Contact Section ================= */}
      <section className="pb-12 md:pb-24 bg-[#F8FAFC] px-4">
        <div className="max-w-5xl mx-auto bg-[#0F2830] rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-2xl shadow-cyan-900/10 border border-cyan-900/50">
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-3">যেকোনো প্রয়োজনে যোগাযোগ করুন</h3>
            <p className="text-gray-300 text-sm md:text-lg font-medium">গ্যাজেট সম্পর্কে জানতে বা দ্রুত অর্ডার করতে সরাসরি আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় প্রস্তুত আপনাকে সেরা সেবাটি দেওয়ার জন্য।</p>
          </div>
          <Link href="/contact" className="bg-[#FF5A36] text-white px-8 py-4 md:px-12 md:py-5 rounded-full font-black hover:bg-[#E04B2A] transition-colors text-sm md:text-lg shadow-lg whitespace-nowrap active:scale-95 border-2 border-[#FF5A36] hover:border-[#E04B2A]">
            Contact Us
          </Link>
        </div>
      </section>

      {/* Noto Sans Bengali Font & Custom Styles */}
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