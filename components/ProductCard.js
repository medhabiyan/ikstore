"use client";
import Link from "next/link";
import { useCartStore } from "../store/useCartStore"; // Zustand স্টোর ইম্পোর্ট করা হলো

// দাম ফরম্যাট করার ফাংশন
const formatPrice = (price) => {
  if (!price) return "0";
  const numericPrice = Number(price.toString().replace(/,/g, ''));
  if (isNaN(numericPrice)) return price; 
  return new Intl.NumberFormat('en-IN').format(numericPrice);
};

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore(); // স্টোর থেকে addToCart ফাংশন আনা হলো

  // মাল্টিপল ইমেজ থাকলে প্রথমটা নেব
  const mainImage = product.image ? product.image.split(',')[0].trim() : "";
  
  // ডিসকাউন্ট ক্যালকুলেশন
  let discountBadge = null;
  if (product.regular_price && Number(product.regular_price) > Number(product.price)) {
    const discount = Math.round(((product.regular_price - product.price) / product.regular_price) * 100);
    discountBadge = `-${discount}%`;
  }

  // কার্টে অ্যাড করার ফাংশন (কোনো অ্যালার্ট ছাড়া)
  const handleAddToCart = (e) => {
    e.preventDefault(); // বাটন ক্লিক করলে যেন পেজ রিলোড বা লিংকে না যায়
    addToCart({ ...product, quantity: 1 });
  };

  // সরাসরি চেকআউটে যাওয়ার ফাংশন
  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart({ ...product, quantity: 1 });
    window.location.href = '/checkout';
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      
      {/* Top: Image Section (🌟 স্কয়ার রেশিও এবং ক্রপিং বন্ধ করা হয়েছে) */}
      <Link href={`/product/${product.slug || product.id}`} className="relative block aspect-square bg-white overflow-hidden p-2">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 rounded-xl">No Image</div>
        )}
        
        {/* Badges (Discount or Stock) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discountBadge && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider shadow-sm">
              {discountBadge}
            </span>
          )}
          {Number(product.stock) <= 0 && (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wider">
              STOCK OUT
            </span>
          )}
        </div>
      </Link>

      {/* Middle & Bottom: Info & Actions */}
      <div className="p-4 md:p-5 flex flex-col flex-grow border-t border-slate-50">
        
        {/* Brand / Category */}
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">
          {product.brand || product.category}
        </span>

        {/* Title */}
        <Link href={`/product/${product.slug || product.id}`} className="hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 mb-3">
            {product.name}
          </h3>
        </Link>

        {/* Spacer to push price and buttons to the bottom */}
        <div className="flex-grow"></div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2.5 mb-4">
          <span className="text-lg md:text-xl font-black text-slate-900">
            ৳{formatPrice(product.price)}
          </span>
          {product.regular_price && (
            <span className="text-xs font-semibold text-slate-400 line-through decoration-slate-300">
              ৳{formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center gap-3 mt-auto">
          {/* Cart Icon (Left) */}
          <button 
            onClick={handleAddToCart}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
            title="Add to Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </button>

          {/* Buy Now Button (Right) */}
          <button 
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
          >
            Buy Now
          </button>
        </div>

      </div>
    </div>
  );
}