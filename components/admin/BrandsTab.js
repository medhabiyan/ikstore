"use client";
import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 50;

export default function BrandsTab({ brands = [], fetchBrands, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [currentName, setCurrentName] = useState(""); 
  const [newName, setNewName] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, toastMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
  };

  const filteredBrands = brands.filter(brand => 
    (brand.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const currentBrands = filteredBrands.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // 🌟 ফর্ম সাবমিট (Add এবং Edit উভয়ের জন্য)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = modalMode === 'edit' ? 'PATCH' : 'POST';
      const bodyData = modalMode === 'edit' 
        ? { oldName: currentName, newName: newName } 
        : { name: newName };

      const res = await fetch('/api/brands', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const result = await res.json();

      if (result.success) {
        setIsModalOpen(false);
        setNewName("");
        if (fetchBrands) fetchBrands(); 
        triggerToast(result.message);
      } else {
        alert("সমস্যা হয়েছে: " + result.error);
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 ডিলিট ফাংশন
  const handleDelete = async (name) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${name}' ব্র্যান্ডটি ডিলিট করতে চান?`)) return;

    try {
      const res = await fetch('/api/brands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const result = await res.json();

      if (result.success) {
        if (fetchBrands) fetchBrands();
        triggerToast("Brand deleted successfully!");
      } else {
        alert("সমস্যা হয়েছে: " + result.error);
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setNewName("");
    setIsModalOpen(true);
  };

  const openEditModal = (name) => {
    setModalMode("edit");
    setCurrentName(name); 
    setNewName(name); 
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 🌟 টোস্ট মেসেজ */}
      <div className={`fixed bottom-8 right-4 md:right-8 z-[9999] transition-all duration-500 ease-out transform ${showToast ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"}`}>
        <div className="bg-[#2B2927] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h4 className="font-bold text-sm">Success!</h4>
            <p className="text-[10px] text-gray-400">{toastMessage}</p>
          </div>
        </div>
      </div>

      {/* 🌟 Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-pop-up">
            <h3 className="text-xl font-black text-[#8A1538] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {modalMode === 'edit' ? "Edit Brand" : "Add New Brand"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Brand Name *</label>
                <input 
                  type="text" 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="e.g. Samsung, Nike" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8A1538] focus:ring-2 focus:ring-[#8A1538]/20 font-bold bg-gray-50 focus:bg-white text-[#3B3433] text-sm transition-all" 
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl bg-[#8A1538] text-white font-bold flex justify-center items-center text-sm shadow-lg shadow-[#8A1538]/20">
                  {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🌟 মেইন কন্টেইনার ================= */}
      <div className="animate-fade-in w-full space-y-6 overflow-x-hidden">
        
        {/* হেডার এবং বাটন */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-[#3B3433] tracking-tight truncate">Brands</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium truncate">আপনার প্রোডাক্টের ব্র্যান্ডগুলো ম্যানেজ করুন।</p>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto text-center bg-[#8A1538] text-white px-6 py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#6e112d] transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Add Brand
          </button>
        </div>

        {/* সার্চ বার */}
        <div className="relative w-full min-w-0">
          <input 
            type="text" 
            placeholder="ব্র্যান্ডের নাম দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[#3B3433] font-semibold text-sm md:text-base outline-none focus:ring-4 focus:ring-[#8A1538]/5 focus:border-[#8A1538] transition-all shadow-sm placeholder:text-gray-400" 
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* ================= 🌟 ব্র্যান্ড লিস্ট টেবিল ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 w-full overflow-hidden flex flex-col min-w-0">
          
          <div className="w-full overflow-x-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left whitespace-nowrap min-w-[500px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 md:p-6 pl-6">Brand Name</th>
                  <th className="p-4 md:p-6 text-center">Total Products</th>
                  <th className="p-4 md:p-6 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="3" className="p-20 text-center"><div className="w-8 h-8 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : currentBrands.length === 0 ? (
                  <tr><td colSpan="3" className="p-20 text-center text-gray-400 font-bold text-sm md:text-base">কোনো ব্র্যান্ড পাওয়া যায়নি!</td></tr>
                ) : (
                  currentBrands.map((brand, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      
                      <td className="p-4 md:p-6 pl-6 w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </div>
                          <span className="font-bold text-[#3B3433] text-sm md:text-base">{brand.name}</span>
                        </div>
                      </td>

                      <td className="p-4 md:p-6 text-center">
                        <span className="font-bold text-[#8A1538] bg-red-50 px-3 py-1.5 rounded-lg text-xs">
                          {brand.productCount || 0} Items
                        </span>
                      </td>

                      <td className="p-4 md:p-6 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(brand.name)} className="text-[10px] md:text-xs font-bold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition-all border border-emerald-100 hover:border-emerald-500" title="Edit Brand">
                            Edit
                          </button>
                          
                          <button onClick={() => handleDelete(brand.name)} className="p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all border border-red-100 hover:border-red-500" title="Delete Brand">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* পেজিনেশন */}
          {!isLoading && totalPages > 1 && (
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <span className="text-[11px] md:text-sm font-bold text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBrands.length)} of {filteredBrands.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2.5 bg-white border border-gray-200 text-[#3B3433] font-bold text-xs md:text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm">
                  Previous
                </button>
                <span className="px-4 py-2.5 text-xs md:text-sm font-black text-[#8A1538] bg-red-50 rounded-xl">
                  {currentPage} / {totalPages}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-white border border-gray-200 text-[#3B3433] font-bold text-xs md:text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm">
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes popUp { 
          0% { transform: scale(0.9); opacity: 0; } 
          100% { transform: scale(1); opacity: 1; } 
        }
        .animate-pop-up { animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}