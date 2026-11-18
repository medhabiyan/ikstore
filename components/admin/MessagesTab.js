"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 🌟 নেভিগেশনের জন্য যুক্ত করা হয়েছে

export default function MessagesTab({ messages = [], isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); // All, Unread, Read
  const router = useRouter(); // 🌟 রাউটার ইনিশিয়ালাইজ করা হয়েছে

  // সার্চ এবং ফিল্টার লজিক
  const filteredMessages = messages.filter(msg => {
    // API থেকে আসা ডেটা মাঝেমাঝে undefined হতে পারে, তাই সেফটির জন্য || "" দেওয়া হয়েছে
    const nameMatch = (msg.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (msg.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = (msg.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = nameMatch || emailMatch || subjectMatch;
    
    if (filter === "Unread") return matchesSearch && !msg.isRead;
    if (filter === "Read") return matchesSearch && msg.isRead;
    return matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-full">
      
      {/* ================= 🌟 হেডার সেকশন ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#3B3433] tracking-tight flex items-center gap-3">
            Customer Inbox 
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">কাস্টমারদের মেসেজ, অভিযোগ এবং ফিডব্যাক ম্যানেজ করুন।</p>
        </div>
      </div>

      {/* ================= 🌟 সার্চ এবং ফিল্টার ================= */}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="relative w-full md:flex-1">
          <input 
            type="text" 
            placeholder="নাম, ইমেইল বা বিষয় দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[#3B3433] font-semibold text-sm outline-none focus:ring-4 focus:ring-[#8A1538]/5 focus:border-[#8A1538] transition-all shadow-sm placeholder:text-gray-400" 
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
          {['All', 'Unread', 'Read'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                filter === status 
                ? 'bg-[#3B3433] text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#3B3433]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 🌟 ইনবক্স লিস্ট (জিমেইল স্টাইল) ================= */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full">
        
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
             <div className="w-10 h-10 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-[#3B3433]">কোনো মেসেজ পাওয়া যায়নি!</h3>
            <p className="text-sm text-gray-400 mt-1">আপনার ইনবক্স একদম ফাঁকা।</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredMessages.map((msg) => {
              // fullMessage থেকে প্রথম ৬০টি অক্ষর নিয়ে snippet বানানো হচ্ছে
              const snippetText = msg.fullMessage ? (msg.fullMessage.length > 60 ? msg.fullMessage.slice(0, 60) + '...' : msg.fullMessage) : 'কোনো বিস্তারিত মেসেজ নেই...';

              return (
                <div 
                  key={msg.id} 
                  onClick={() => router.push(`/admin/messages/${msg.id}`)} // 🌟 পুরো বারে ক্লিক ইভেন্ট যুক্ত করা হয়েছে
                  className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-5 transition-all hover:bg-gray-50/80 cursor-pointer ${!msg.isRead ? 'bg-blue-50/20' : 'bg-white'}`}
                >
                  {/* 1. অ্যাভাটার ও নাম */}
                  <div className="flex items-center gap-4 w-full md:w-56 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm ${!msg.isRead ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                      {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0 flex-1 flex justify-between md:block">
                      <p className={`truncate text-sm md:text-base ${!msg.isRead ? 'font-black text-[#3B3433]' : 'font-bold text-gray-600'}`}>
                        {msg.name}
                      </p>
                      <span className="md:hidden text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                        {msg.date}
                      </span>
                    </div>
                  </div>

                  {/* 2. সাবজেক্ট ও মেসেজ স্নিপেট */}
                  {/* 🌟 ভেতরের Link ট্যাগটি div করে দেওয়া হয়েছে যাতে এররের সৃষ্টি না হয় */}
                  <div className="flex-1 min-w-0 w-full pl-14 md:pl-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm ${!msg.isRead ? 'font-black text-[#3B3433]' : 'font-semibold text-gray-700'}`}>
                        {msg.subject}
                      </p>
                      <span className="hidden md:inline text-gray-400 text-sm">-</span>
                      <p className="truncate text-sm text-gray-500 hidden md:block">
                        {snippetText}
                      </p>
                    </div>
                    <p className="truncate text-xs text-gray-500 md:hidden mt-0.5">
                      {snippetText}
                    </p>
                  </div>

                  {/* 3. অ্যাকশন বাটন ও ডেট */}
                  <div className="hidden md:flex items-center justify-end w-48 gap-4 flex-shrink-0">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <a 
                        href={`mailto:${msg.email}`} 
                        onClick={(e) => e.stopPropagation()} // 🌟 মেইল বাটনে ক্লিক করলে যেন পেজ পরিবর্তন না হয় তাই এটি রাখা হয়েছে
                        className="p-2 text-gray-400 hover:text-[#8A1538] hover:bg-red-50 rounded-lg transition-colors"
                        title="Quick Reply via Email"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                      </a>
                      
                      <div 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Read Full Message"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </div>
                    </div>
                    
                    <span className={`text-xs font-bold transition-opacity group-hover:hidden ${!msg.isRead ? 'text-blue-600' : 'text-gray-400'}`}>
                      {msg.date}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}