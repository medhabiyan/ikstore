"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const VISIBLE_STATUSES = ['All', 'Pending Payment', 'Processing', 'Completed'];
const MORE_STATUSES = ['On Hold', 'Shipped', 'Refunded', 'Canceled', 'Draft'];
const ALL_STATUS_LIST = [...VISIBLE_STATUSES.slice(1), ...MORE_STATUSES];
const ITEMS_PER_PAGE = 50; // প্রতি পেজে ৫০টি অর্ডার দেখাবে (পারফরম্যান্সের জন্য)

export default function OrdersTab({ orders = [], handleStatusChange, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // পেজিনেশনের জন্য স্টেট
  const [currentPage, setCurrentPage] = useState(1);

  // টোস্টের জন্য পারফেক্ট স্টেট
  const [toastMessage, setToastMessage] = useState("");
  const [toastKey, setToastKey] = useState(0); 

  // টোস্ট অটোমেটিক হাইড করার লজিক
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, toastKey]);

  // ফিল্টার বা সার্চ করলে পেজ ১-এ নিয়ে যাওয়ার লজিক
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getCount = (status) => {
    if (status === "All") return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.order_id?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // 🌟 পেজিনেশন লজিক (হাজার হাজার অর্ডারেও ফাস্ট রাখার জন্য)
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const currentOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // স্ট্যাটাস আপডেট লজিক
  const onStatusUpdate = (orderId, newStatus) => {
    handleStatusChange(orderId, newStatus); 
    setToastMessage(`অর্ডার #${orderId} এর স্ট্যাটাস '${newStatus}'-এ পরিবর্তিত হয়েছে।`);
    setToastKey(prev => prev + 1); // প্রতিবার নতুন অ্যানিমেশন ট্রিগার করার জন্য
  };

  return (
    <>
      {/* ================= 🌟 ১০০% ফিক্সড সাকসেস টোস্ট 🌟 ================= */}
      {/* এই অংশটি মেইন div এর বাইরে রাখা হয়েছে যাতে এটি সবসময় স্ক্রিনের ভিজিবল অংশে থাকে */}
      {toastMessage && (
        <div key={toastKey} className="fixed bottom-8 right-4 md:right-8 z-[9999] animate-pop-up">
          <div className="bg-[#2B2927] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm">আপডেট সফল হয়েছে!</h4>
              <p className="text-[10px] text-gray-400">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* মেইন কন্টেইনার */}
      <div className="animate-fade-in space-y-5 md:space-y-6 relative">
        
        {/* ================= 🌟 সার্চ এবং ফিল্টার সেকশন 🌟 ================= */}
        <div className="flex flex-col gap-4">
          
          {/* সার্চ বার */}
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="নাম, ফোন বা আইডি দিয়ে খুঁজুন..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[#3B3433] font-semibold text-sm md:text-base outline-none focus:ring-4 focus:ring-[#8A1538]/5 focus:border-[#8A1538] transition-all shadow-sm placeholder:text-gray-400" 
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* ফিল্টার বাটন এবং ড্রপডাউন */}
          <div className="flex items-center gap-2">
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
              {VISIBLE_STATUSES.map(status => (
                <button 
                  key={status} 
                  onClick={() => { setFilterStatus(status); setIsMoreOpen(false); }} 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] md:text-sm font-bold whitespace-nowrap transition-all border ${
                    filterStatus === status 
                      ? 'bg-[#3B3433] text-white border-[#3B3433] shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {status}
                  <span className={`px-2 py-0.5 rounded-md text-[9px] md:text-[10px] ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {getCount(status)}
                  </span>
                </button>
              ))}
            </div>

            {/* More Filters ড্রপডাউন */}
            <div className="relative flex-shrink-0 pb-2">
              <button 
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] md:text-sm font-bold whitespace-nowrap transition-all border ${
                  MORE_STATUSES.includes(filterStatus)
                    ? 'bg-[#8A1538] text-white border-[#8A1538]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {MORE_STATUSES.includes(filterStatus) ? filterStatus : "More Filters"}
                <svg className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-up">
                  {MORE_STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setIsMoreOpen(false); }}
                      className="w-full text-left px-5 py-2.5 text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#8A1538] flex justify-between items-center transition-colors"
                    >
                      {status}
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{getCount(status)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 🌟 অর্ডার লিস্ট টেবিল 🌟 ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 min-h-[400px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 md:p-6 text-center">SL</th>
                  <th className="p-4 md:p-6">Order Info</th>
                  <th className="p-4 md:p-6">Customer</th>
                  <th className="p-4 md:p-6 text-right">Amount</th>
                  <th className="p-4 md:p-6">Status</th>
                  <th className="p-4 md:p-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="6" className="p-20 text-center"><div className="w-8 h-8 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : currentOrders.length === 0 ? (
                  <tr><td colSpan="6" className="p-20 text-center text-gray-400 font-bold text-sm md:text-base">কোনো অর্ডার পাওয়া যায়নি!</td></tr>
                ) : (
                  currentOrders.map((order, idx) => {
                    const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1; // আসল সিরিয়াল নম্বর বের করা
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-4 md:p-6 text-center text-[10px] md:text-sm font-bold text-gray-400">
                          {actualIndex.toString().padStart(2, '0')}
                        </td>
                        
                        <td className="p-4 md:p-6">
                          <Link href={`/admin/orders/${order.order_id}`} className="font-black text-[#8A1538] hover:underline text-sm md:text-base block">
                            #{order.order_id}
                          </Link>
                          <span className="text-[10px] md:text-xs text-gray-400 font-medium block mt-1">{order.date}</span>
                        </td>
                        
                        <td className="p-4 md:p-6">
                          <p className="font-bold text-[#3B3433] text-xs md:text-sm">{order.customer_name}</p>
                          <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">{order.phone}</p>
                        </td>
                        
                        <td className="p-4 md:p-6 text-right font-black text-[#3B3433] text-sm md:text-lg">
                          ৳{order.total_price}
                        </td>
                        
                        <td className="p-4 md:p-6">
                          <select 
                            value={order.status} 
                            onChange={(e) => onStatusUpdate(order.order_id, e.target.value)}
                            className={`text-[10px] md:text-xs font-black rounded-lg px-3 py-2 outline-none cursor-pointer border-none shadow-sm transition-colors ${
                              order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 
                              order.status === 'Pending Payment' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 
                              order.status === 'Canceled' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            {ALL_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        
                        <td className="p-4 md:p-6 text-center">
                          <Link href={`/admin/orders/${order.order_id}`} className="inline-flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-gray-50 text-gray-400 hover:bg-[#8A1538] hover:text-white rounded-xl transition-all shadow-sm active:scale-90 group-hover:scale-110">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 🌟 পেজিনেশন কন্ট্রোলস (হাজার হাজার অর্ডারের জন্য) */}
          {!isLoading && totalPages > 1 && (
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-[11px] md:text-sm font-bold text-gray-400">
                দেখাচ্ছে {(currentPage - 1) * ITEMS_PER_PAGE + 1} থেকে {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} পর্যন্ত (মোট: {filteredOrders.length}টি)
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 text-[#3B3433] font-bold text-xs md:text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-xs md:text-sm font-black text-[#8A1538] bg-red-50 rounded-xl">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 text-[#3B3433] font-bold text-xs md:text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* টোস্ট অ্যানিমেশন স্টাইল */}
      <style jsx>{`
        @keyframes popUp { 
          0% { transform: translateY(100px); opacity: 0; } 
          100% { transform: translateY(0); opacity: 1; } 
        }
        .animate-pop-up { animation: popUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
}