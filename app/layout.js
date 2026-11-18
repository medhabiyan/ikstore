"use client"; 
import './globals.css';
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from 'react'; // 🌟 useEffect ইম্পোর্ট করা হলো
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MarketingTracker from '../components/MarketingTracker';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // চেক করা হচ্ছে ইউজার অ্যাডমিন পেজে আছে কি না
  const isAdminPage = pathname?.startsWith('/admin') || false; // সেফটি চেক যোগ করা হলো

  // 🌟 কাস্টম হেডার স্ক্রিপ্ট (Head Tag) ডায়নামিকভাবে বসানোর লজিক
  useEffect(() => {
    const fetchAndInjectScript = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        
        if (data.success && data.settings?.custom_header_script) {
          const scriptContent = data.settings.custom_header_script;
          
          // একটি ভার্চুয়াল ডিভ তৈরি করে তার মধ্যে ইউজারের দেওয়া পুরো কোড রাখা হচ্ছে
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = scriptContent;

          // এবার সেই কোডগুলো একটা একটা করে ওয়েবসাইটের <head>-এর ভেতর পুশ করা হবে
          Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeType === 1) { // যদি এটি কোনো HTML ট্যাগ হয় (যেমন: <meta>, <script>)
              if (node.tagName.toLowerCase() === 'script') {
                // স্ক্রিপ্ট ট্যাগ হলে ব্রাউজারকে বোঝানোর জন্য নতুন করে ক্রিয়েট করে বসাতে হয়
                const newScript = document.createElement('script');
                Array.from(node.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.text = node.text; // ভেতরের কোডটুকু কপি করা
                document.head.appendChild(newScript);
              } else {
                // মেটা (meta) বা অন্যান্য ভেরিফিকেশন ট্যাগ হলে সরাসরি বসিয়ে দেওয়া
                document.head.appendChild(node.cloneNode(true));
              }
            }
          });
        }
      } catch (error) {
        console.error("Head script load error:", error);
      }
    };

    fetchAndInjectScript();
  }, []);

  return (
    <html lang="bn">
      <body className="bg-white text-zinc-900 antialiased">
        
        {/* 🌟 Suspense দিয়ে ট্র্যাকার র‍্যাপ করা হলো যাতে বিল্ড এরর না আসে */}
        <Suspense fallback={null}>
          <MarketingTracker />
        </Suspense>

        {/* 🌟 Navbar-কেও Suspense দিয়ে র‍্যাপ করা হলো */}
        {!isAdminPage && (
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
        )} 
        
        <main className={`w-full min-h-screen flex flex-col ${!isAdminPage ? 'pt-20' : ''}`}>
          {children}
        </main>

        {!isAdminPage && <Footer />}
      </body>
    </html>
  );
}