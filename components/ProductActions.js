"use client";
import { useCartStore } from "../store/useCartStore";
import { trackEvent } from "../lib/trackEvent"; 

const cleanPrice = (price) => {
  if (!price) return 0;
  return Number(price.toString().replace(/[^0-9.-]+/g, ""));
};

export default function ProductActions({ product, quantity, isSelectionComplete }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const cartItem = {
    ...product,
    cartItemId: `${product.id}-${product.variant || 'default'}`, 
  };

  const fireAddToCartPixel = () => {
    const unitPrice = cleanPrice(product.price);
    const totalValue = unitPrice * quantity;
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
      contents: [{ id: product.id, quantity: quantity, item_price: unitPrice }]
    });
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) { addToCart(cartItem); }
    fireAddToCartPixel();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) { addToCart(cartItem); }
    fireAddToCartPixel();
    window.location.href = '/checkout'; 
  };

  const phoneNumber = "8801349058676"; 
  const whatsappMessage = encodeURIComponent(`হ্যালো, আমি আপনাদের ওয়েবসাইট থেকে "${product.name}" প্রোডাক্টটি সম্পর্কে জানতে চাচ্ছি।`);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
  const callLink = `tel:+${phoneNumber}`;

  return (
    <div className="flex flex-col gap-4">
      
      {/* 🌟 অগ্রিম পেমেন্ট মেসেজ (সবসময় উজ্জ্বল এবং ব্লিংকিং থাকবে) */}
      <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center animate-pulse">
        <p className="text-red-700 font-extrabold text-xs md:text-sm tracking-wide">
          ⚠️ অগ্রিম ১ টাকাও দিতে হবে না। পণ্য হাতে পেয়ে টাকা দেবেন।
        </p>
      </div>

      {/* 🛒 Add to Cart ও Order Now বাটন (মোবাইলে স্টিকি, সিলেক্ট না করলে আবছা থাকবে) */}
      <div className="flex flex-col gap-2">
        {!isSelectionComplete && (
          <p className="text-[11px] font-bold text-red-500 mb-1 animate-bounce">
            * অর্ডার করতে উপরের সব অপশন সিলেক্ট করুন
          </p>
        )}
        
        <div className={`
          ${!isSelectionComplete ? "opacity-50 pointer-events-none" : "opacity-100"}
          fixed bottom-0 left-0 w-full p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex gap-2 
          md:relative md:p-0 md:bg-transparent md:border-none md:backdrop-blur-none transition-all
        `}>
          <button 
            onClick={handleAddToCart}
            className="flex-1 md:flex-none md:w-1/2 flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-100 py-3 rounded-xl font-bold text-sm active:scale-95 shadow-[0_4px_10px_rgba(59,130,246,0.05)] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Add to Cart
          </button>
          
          <button 
            onClick={handleBuyNow}
            className="flex-[1.5] md:flex-none md:w-1/2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-black text-sm uppercase active:scale-95 hover:shadow-[0_8px_20px_rgba(139,92,246,0.3)] cursor-pointer"
          >
            Order Now
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </div>
      </div>

      {/* 📞 কল এবং হোয়াটসঅ্যাপ (সবসময় স্বাধীন, নন-স্টিকি এবং ১০০% একটিভ) */}
      <div className="flex gap-3 w-full mt-1">
        <a href={callLink} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold text-sm border border-slate-200 shadow-sm active:scale-95 cursor-pointer hover:bg-slate-100 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          কল করুন
        </a>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-sm shadow-sm active:scale-95 cursor-pointer hover:bg-[#20bd5a] transition-all">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.38 0 0 5.384 0 12.036c0 2.124.551 4.195 1.597 6.01L.027 24l6.108-1.599a11.968 11.968 0 005.896 1.536h.005c6.65 0 12.03-5.385 12.03-12.037 0-3.226-1.255-6.257-3.536-8.536A11.983 11.983 0 0012.031 0zm0 19.98c-1.802 0-3.568-.485-5.114-1.402l-.367-.217-3.8.995.996-3.708-.238-.38A9.99 9.99 0 012.035 12.04C2.035 6.52 6.531 2.03 12.036 2.03c2.668 0 5.176 1.04 7.062 2.926 1.886 1.886 2.925 4.394 2.925 7.08 0 5.519-4.495 10.013-10.013 10.013h-.005v.001zm5.492-7.514c-.301-.151-1.782-.88-2.058-.98-.276-.101-.477-.151-.678.151-.2.301-.778.98-.954 1.18-.176.2-.351.226-.653.076-1.455-.726-2.576-1.35-3.538-2.617-.275-.366.3-.344.88-.894.1-.1.2-.201.3-.301.101-.151.151-.251.251-.452.1-.2.05-.376-.025-.526-.075-.151-.678-1.631-.928-2.233-.243-.585-.49-.505-.678-.515-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.054 1.03-1.054 2.51 0 1.48 1.08 2.91 1.23 3.111.151.2 2.11 3.216 5.11 4.512.715.308 1.272.492 1.706.63.715.227 1.365.195 1.88.118.575-.085 1.782-.728 2.033-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352z"/></svg>
          WhatsApp
        </a>
      </div>

      {/* মোবাইল স্টিকি বাটনের জন্য নিচে জায়গা রাখা */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
}