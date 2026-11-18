"use client";
import { useCartStore } from "../../store/useCartStore";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // 🌟 যদি কার্ট খালি থাকে (Empty State)
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] bg-[#FDFCF8] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-[#3B3433] mb-3 tracking-tight">আপনার কার্ট খালি!</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-md">মনে হচ্ছে আপনি এখনও কোনো প্রোডাক্ট কার্টে যুক্ত করেননি। আমাদের চমৎকার সব কালেকশন থেকে শপিং শুরু করুন।</p>
                <Link href="/" className="inline-flex items-center gap-2 bg-[#8A1538] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#6e112d] active:scale-95 transition-all shadow-lg shadow-red-900/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    শপিং চালিয়ে যান
                </Link>
            </div>
        );
    }

    // 🌟 কার্টে প্রোডাক্ট থাকলে (Filled State)
    return (
        <div className="min-h-screen bg-[#FDFCF8] py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#3B3433] tracking-tight">আপনার কার্ট</h1>
                        <p className="text-gray-500 font-medium mt-2">{cartItems.length}টি আইটেম সিলেক্ট করা হয়েছে</p>
                    </div>
                    <button onClick={clearCart} className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <span className="hidden sm:inline">কার্ট ক্লিয়ার করুন</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Side: Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {cartItems.map((item) => {
                            // 🌟 আইটেম আইডি (cartItemId অথবা id)
                            const uniqueId = item.cartItemId || item.id;
                            
                            return (
                            <div key={uniqueId} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow group">
                                
                                {/* Product Info */}
                                <div className="flex gap-5 items-center w-full sm:w-auto">
                                    <Link href={`/product/${item.slug || item.id}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image.split(',')[0].trim()} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        )}
                                    </Link>
                                    <div>
                                        <Link href={`/product/${item.slug || item.id}`} className="font-bold text-[#3B3433] text-lg hover:text-[#8A1538] transition-colors line-clamp-2">
                                            {item.name}
                                        </Link>
                                        
                                        {/* 🌟 ভেরিয়েন্ট ডেটা দেখানোর জায়গা */}
                                        {item.variant && (
                                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                {item.variant.split('|').map((v, i) => (
                                                    <span key={i} className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                                        {v.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="text-[#8A1538] font-black text-xl">৳{item.price}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls (Quantity & Delete) */}
                                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                                    
                                    {/* Modern Quantity Selector */}
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1">
                                        <button 
                                            onClick={() => updateQuantity(uniqueId, -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-[#8A1538] hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                        </button>
                                        <span className="font-black text-[#3B3433] w-10 text-center text-sm">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(uniqueId, 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-[#8A1538] hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>

                                    {/* Delete Button */}
                                    <button 
                                        onClick={() => removeFromCart(uniqueId)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-colors shadow-sm bg-white border border-gray-100"
                                        title="মুছে ফেলুন"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        )})}
                    </div>

                    {/* Right Side: Order Summary Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-8">
                            <h2 className="text-xl font-black text-[#3B3433] mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#E5B361]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                অর্ডার সামারি
                            </h2>
                            
                            <div className="space-y-4 text-sm font-medium text-gray-500 mb-6 border-b border-dashed border-gray-200 pb-6">
                                <div className="flex justify-between items-center">
                                    <span>সাবটোটাল</span>
                                    <span className="font-bold text-[#3B3433] text-base">৳{totalPrice}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>ডেলিভারি চার্জ</span>
                                    <span className="text-[#8A1538] font-bold bg-red-50 px-2 py-0.5 rounded text-xs">চেকআউটে হিসাব করা হবে</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-base font-bold text-[#3B3433]">সর্বমোট</span>
                                <span className="text-3xl font-black text-[#8A1538]">৳{totalPrice}</span>
                            </div>

                            {/* 🌟 Checkout Button */}
                            <Link 
                                href="/checkout"
                                className="w-full bg-[#3B3433] text-white py-4 rounded-2xl font-black text-lg hover:bg-black active:scale-[0.98] transition-all flex justify-center items-center gap-3 shadow-xl"
                            >
                                চেকআউট করুন
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l7-7m7-7H3" /></svg>
                            </Link>

                            <Link href="/" className="w-full mt-4 py-3 text-center block text-sm font-bold text-gray-400 hover:text-[#8A1538] transition-colors">
                                আরও শপিং করুন
                            </Link>
                        </div>
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