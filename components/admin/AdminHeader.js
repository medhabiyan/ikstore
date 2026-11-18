"use client";

export default function AdminHeader({ activeTab, setIsMobileMenuOpen }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* মোবাইল মেনু বাটন */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        <div>
          <h1 className="text-xl font-black text-[#3B3433] capitalize tracking-tight">
            {activeTab} <span className="text-[#8A1538]">Management</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* নোটিফিকেশন বা সার্চ বাটন এখানে যোগ করা যাবে */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase">Live Server</span>
        </div>
      </div>
    </header>
  );
}