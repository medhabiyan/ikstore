"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "../store/useCartStore"; 

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // কার্টের ডাটা নেওয়ার জন্য
  const { cartItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // স্ক্রল করলে হেডারের শ্যাডো ও ব্যাকগ্রাউন্ড পরিবর্তনের লজিক
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // কার্টের মোট আইটেম সংখ্যা হিসাব করা (Hydration Error এড়াতে mounted চেক)
  const cartItemCount = mounted ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  // নেভিগেশন লিঙ্কগুলোর লিস্ট
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" }, // যদি আপনার শপ পেজ থাকে
    { name: "Contact", href: "/contact" }, // যদি ট্র্যাকিং পেজ থাকে
  ];

  // অ্যাডমিন পেজে হেডার লুকানোর লজিক (অপশনাল: আপনি চাইলে অ্যাডমিন পেজেও রাখতে পারেন)
  if (pathname.startsWith('/admin')) return null;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" 
          : "bg-white py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-black text-[#3B3433] tracking-tight hover:scale-105 transition-transform">
            IK Store<span className="text-[#8A1538]">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-bold transition-colors ${
                  pathname === link.href 
                    ? "text-[#8A1538]" 
                    : "text-gray-500 hover:text-[#3B3433]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons Group (Cart & Admin) */}
          <div className="flex items-center gap-4">
            
            {/* Admin Link (Hidden on mobile) */}
            {/* <Link href="/admin" className="hidden md:flex p-2 text-gray-400 hover:text-[#3B3433] transition-colors rounded-full hover:bg-gray-50" title="Admin Panel">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </Link> */}

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-[#8A1538] transition-colors group">
              <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#8A1538] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-fade-in">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="md:hidden p-2 text-gray-600 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-4 animate-slide-up z-40">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-bold pb-2 border-b border-gray-50 ${
                pathname === link.href ? "text-[#8A1538]" : "text-gray-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {/* <Link 
            href="/admin" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-400 pb-2 flex items-center gap-2"
          >
            Admin Panel
          </Link> */}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
      `}</style>
    </header>
  );
}