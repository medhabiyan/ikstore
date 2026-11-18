"use client";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 🌟 রাউটার ইম্পোর্ট করা হলো

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  newOrdersCount, 
  handleLogout, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) {
  const router = useRouter(); // 🌟 রাউটার ইনিশিয়ালাইজ

  const menuItems = [
    { id: "overview", label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "orders", label: "Orders", badge: newOrdersCount, icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { id: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "landing-pages", label: "Landing Pages", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { id: "messages", label: "Messages", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "categories", label: "Categories", icon: "M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01" },
    { id: "brands", label: "Brands", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { id: "payment-settings", label: "Payment Config", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-[#2B2927] text-gray-300 flex flex-col z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-black text-white tracking-tight">IK Store<span className="text-[#E5B361]">.</span></h2>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Admin Panel</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { 
                setActiveTab(item.id); 
                router.push(`?tab=${item.id}`, { scroll: false }); // 🌟 URL আপডেট হবে কিন্তু পেজ লাফাবে না
                setIsMobileMenuOpen(false); 
              }} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id ? 'bg-[#8A1538] text-white' : 'hover:bg-white/5 text-gray-400'}`}
            >
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {item.label}
              </div>
              {item.badge > 0 && <span className="bg-[#E5B361] text-[#2B2927] text-[10px] font-black px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 bg-black/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors px-4 py-3 font-bold rounded-xl hover:bg-red-500/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}