"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const ITEMS_PER_PAGE = 50; 

export default function ProductsTab({ products = [], fetchProducts, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [quickEditData, setQuickEditData] = useState(null);
  const [isQuickEditing, setIsQuickEditing] = useState(false);

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

  const filteredProducts = products.filter(product => {
    return (
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
  };

  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    setIsQuickEditing(true);

    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickEditData) 
      });

      const result = await res.json();

      if (result.success) {
        setQuickEditData(null); 
        fetchProducts(); 
        triggerToast("Product updated successfully!");
      } else {
        alert("সমস্যা হয়েছে: " + result.error);
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    } finally {
      setIsQuickEditing(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete '${name}'? This action cannot be undone!`);
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      const result = await res.json();

      if (result.success) {
        fetchProducts(); 
        triggerToast("Product deleted successfully!");
      } else {
        alert("সমস্যা হয়েছে: " + result.error);
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    }
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

      {/* 🌟 কুইক এডিট মডেল */}
      {quickEditData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-pop-up">
            <h3 className="text-xl font-black text-[#8A1538] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Quick Edit Product
            </h3>
            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Product Name *</label>
                <input type="text" required value={quickEditData.name || ''} onChange={e => setQuickEditData({ ...quickEditData, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8A1538] font-bold bg-gray-50 text-[#3B3433] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Permalink / URL *</label>
                <input type="text" required value={quickEditData.permalink || quickEditData.slug || ''} onChange={e => setQuickEditData({ ...quickEditData, permalink: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8A1538] font-bold bg-gray-50 text-[#3B3433] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Sale Price (৳) *</label>
                  <input type="number" required value={quickEditData.price} onChange={e => setQuickEditData({ ...quickEditData, price: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8A1538] font-black text-[#3B3433] bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Regular Price (৳)</label>
                  <input type="number" value={quickEditData.regular_price || ''} onChange={e => setQuickEditData({ ...quickEditData, regular_price: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8A1538] font-black text-[#3B3433] bg-gray-50 text-sm" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Stock Quantity *</label>
                <input type="number" required value={quickEditData.stock} onChange={e => setQuickEditData({ ...quickEditData, stock: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8A1538] font-black text-[#3B3433] bg-gray-50 text-sm" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setQuickEditData(null)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={isQuickEditing} className="flex-1 py-3.5 rounded-xl bg-[#8A1538] text-white font-bold flex justify-center items-center text-sm shadow-lg shadow-[#8A1538]/20">
                  {isQuickEditing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🌟 মেইন কন্টেইনার (পুরোপুরি আবদ্ধ) ================= */}
      <div className="animate-fade-in w-full space-y-6">
        
        {/* হেডার এবং বাটন (কখনোই ডানদিকে বের হবে না) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#3B3433] tracking-tight">Product Management</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Manage your inventory, pricing, and add new products.</p>
          </div>

          <Link
            href="/admin/add-product"
            className="w-full sm:w-auto text-center bg-[#8A1538] text-white px-6 py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#6e112d] transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add New Product
          </Link>
        </div>

        {/* সার্চ বার */}
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="প্রোডাক্টের নাম, ক্যাটাগরি বা ID দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[#3B3433] font-semibold text-sm md:text-base outline-none focus:ring-4 focus:ring-[#8A1538]/5 focus:border-[#8A1538] transition-all shadow-sm placeholder:text-gray-400" 
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* ================= 🌟 প্রোডাক্ট লিস্ট টেবিল (ন্যাটিভ হরাইজন্টাল স্ক্রলবার) ================= */}
        {/* এই অংশটি মেইন বডিকে ওভারফ্লো করা থেকে ১০০% প্রতিরোধ করবে */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 w-full overflow-hidden">
          
          {/* স্ক্রলিং কন্টেইনার */}
          <div className="w-full overflow-x-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left whitespace-nowrap min-w-[850px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 md:p-6 pl-6">Product Info</th>
                  <th className="p-4 md:p-6">Category</th>
                  <th className="p-4 md:p-6 text-center">Stock</th>
                  <th className="p-4 md:p-6 text-right">Price</th>
                  <th className="p-4 md:p-6 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="5" className="p-20 text-center"><div className="w-8 h-8 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : currentProducts.length === 0 ? (
                  <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold text-sm md:text-base">কোনো প্রোডাক্ট পাওয়া যায়নি!</td></tr>
                ) : (
                  currentProducts.map((product, index) => {
                    const firstImg = product.image ? product.image.split(',')[0].trim() : "";
                    const stockCount = Number(product.stock);
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-4 md:p-6 pl-6 flex items-center gap-4">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-gray-100 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                            {firstImg ? <img src={firstImg} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-gray-300 text-[10px] uppercase font-bold">No Img</span>}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#3B3433] text-sm block truncate max-w-[200px] md:max-w-[280px]">{product.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{product.id}</span>
                          </div>
                        </td>

                        <td className="p-4 md:p-6">
                          <span className="font-bold text-gray-600 text-xs md:text-sm bg-gray-100 px-3 py-1.5 rounded-lg">{product.category}</span>
                        </td>

                        <td className="p-4 md:p-6 text-center">
                          <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black tracking-wide ${stockCount > 5 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            stockCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {stockCount > 0 ? `${stockCount} IN STOCK` : 'OUT OF STOCK'}
                          </span>
                        </td>

                        <td className="p-4 md:p-6 text-right font-black text-[#3B3433] text-sm md:text-lg">
                          ৳{product.price}
                        </td>

                        <td className="p-4 md:p-6 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setQuickEditData(product)} className="text-[10px] md:text-xs font-bold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 px-3 py-2 rounded-xl transition-all border border-emerald-100 hover:border-emerald-500" title="Quick Edit">
                              Edit
                            </button>
                            
                            <Link href={`/admin/edit-product/${product.id}`} className="text-[10px] md:text-xs font-bold text-amber-600 hover:text-white bg-amber-50 hover:bg-amber-500 px-3 py-2 rounded-xl transition-all border border-amber-100 hover:border-amber-500">
                              Full Edit
                            </Link>
                            
                            <Link href={`/product/${product.slug}`} target="_blank" className="p-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-500 rounded-xl transition-all border border-blue-100 hover:border-blue-500" title="Live View">
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </Link>
                            
                            <button onClick={() => handleDeleteProduct(product.id, product.name)} className="p-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all border border-red-100 hover:border-red-500" title="Delete Product">
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* পেজিনেশন */}
          {!isLoading && totalPages > 1 && (
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <span className="text-[11px] md:text-sm font-bold text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
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
        
        /* ন্যাটিভ কাস্টম স্ক্রলবার */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}