"use client";
import Link from "next/link";
import { Noto_Sans_Bengali } from 'next/font/google';

const notoSansBengali = Noto_Sans_Bengali({ 
  subsets: ['bengali'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-100 pt-16 pb-8 ${notoSansBengali.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* মেইন ফুটার কন্টেন্ট */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-12 mb-12">
          
          {/* ১. ব্র্যান্ড সেকশন (মোবাইলে প্রথম লাইনে থাকবে) */}
          <div className="space-y-4 md:w-2/5">
            <Link href="/" className="text-2xl font-black text-[#3B3433] tracking-tight">
              IK Store<span className="text-[#8A1538]">.</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed font-medium md:pr-10">
              সেরা মানের পণ্য নিয়ে আমরা আছি আপনার পাশে। দ্রুত ডেলিভারি এবং কোয়ালিটির নিশ্চয়তা আমাদের মূল লক্ষ্য।
            </p>
          </div>

          {/* ২. মেনু এবং অফিস সেকশন (মোবাইলে দ্বিতীয় লাইনে পাশাপাশি থাকবে) */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:w-3/5 md:flex md:justify-around">
            
            {/* মেনু */}
            <div className="flex flex-col items-start">
              <h4 className="text-[#3B3433] font-bold mb-5 md:mb-6 text-sm uppercase tracking-widest">Explore</h4>
              <ul className="space-y-4">
                {/* <li><Link href="/shop" className="text-gray-500 hover:text-[#8A1538] text-sm font-medium transition-colors">Product</Link></li> */}
                <li><Link href="/contact" className="text-gray-500 hover:text-[#8A1538] text-sm font-medium transition-colors">Contact</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-500 hover:text-[#8A1538] text-sm font-medium transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-500 hover:text-[#8A1538] text-sm font-medium transition-colors">Terms and Condition</Link></li>
              </ul>
            </div>

            {/* অফিস */}
            <div className="flex flex-col items-start">
              <h4 className="text-[#3B3433] font-bold mb-5 md:mb-6 text-sm uppercase tracking-widest">Office</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-gray-500 text-sm font-medium">Manirampur Bazar, Jashore.</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="text-[#3B3433] text-sm font-bold">+880 1994-618577</span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>

        {/* ৩. বটম ফুটার (আগের মতোই রাখা হয়েছে) */}
        <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-around items-center gap-4">
          <p className="text-gray-400 text-xs font-medium text-center md:text-left">
            © {currentYear} IK Store. All rights reserved. Built with PrimeWV.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest text-center">Premium Tools and Parts Store</p>
          </div>
        </div>
        
      </div>
    </footer>
  );
} 