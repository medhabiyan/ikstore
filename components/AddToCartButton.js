"use client";
import { useCartStore } from "../store/useCartStore";
import { trackEvent } from "../lib/trackEvent"; 

// 🌟 দাম থেকে কমা বা টেক্সট সরিয়ে শুধু নম্বর বের করার ফাংশন
const cleanPrice = (price) => {
  if (!price) return 0;
  return Number(price.toString().replace(/[^0-9.-]+/g, ""));
};

export default function AddToCartButton({ product, quantity = 1 }) { // 🌟 quantity প্রপস রিসিভ করা হলো
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    
    // ১. কার্টে প্রোডাক্ট যোগ করা (quantity সহ)
    addToCart({ ...product, quantity }); 

    // ২. 🌟 পিক্সেল এবং GTM-এ AddToCart ইভেন্ট পাঠানো
    const unitPrice = cleanPrice(product.price || product.salePrice || 0);
    const totalValue = unitPrice * quantity; // কাস্টমার ৩টা নিলে ৩টার দাম ফেসবুকে যাবে

    trackEvent('AddToCart', {
      content_name: product.title || product.name, 
      content_ids: [product.id || product._id],    
      content_type: 'product',
      value: totalValue, // 🌟 সঠিক হিসাব করা দাম পাঠানো হচ্ছে
      currency: 'BDT',
      contents: [{
        id: product.id || product._id,
        quantity: quantity,
        item_price: unitPrice
      }]
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-zinc-900 text-white py-3 mt-4 text-sm font-bold tracking-wide hover:bg-black active:scale-[0.98] transition-all"
    >
      ADD TO CART
    </button>
  );
}