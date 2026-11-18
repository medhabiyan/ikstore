"use client";

export default function OverviewTab({ orders = [], products = [], isLoading }) {
  // হিসাব-নিকাশ (আগের লজিক হুবহু রাখা হয়েছে)
  const totalRevenue = orders
    .filter(o => o.status !== 'Canceled' && o.status !== 'Refunded')
    .reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);
  
  const newOrdersCount = orders.filter(o => o.status === "Pending Payment").length;
  const lowStockProducts = products.filter(p => Number(p.stock) <= 5);
  const recentOrders = orders.slice(0, 5); // সর্বশেষ ৫টি অর্ডার

  // কার্ডের ডেটা
  const stats = [
    { label: "মোট আয় (Sales)", value: `৳${totalRevenue.toLocaleString('en-IN')}`, color: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-200", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "নতুন অর্ডার", value: newOrdersCount, color: "from-amber-400 to-orange-500", shadow: "shadow-orange-200", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { label: "মোট প্রোডাক্ট", value: products.length, color: "from-emerald-400 to-teal-500", shadow: "shadow-teal-200", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { label: "স্টক আউট / লো-স্টক", value: lowStockProducts.length, color: "from-rose-400 to-red-500", shadow: "shadow-red-200", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full">
      
      {/* 🌟 ৪টি সামারি কার্ড (গ্রিড সিস্টেম: মোবাইলে ২ কলাম, ডেক্সটপে ৪ কলাম) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl md:rounded-[2rem] p-4 md:p-6 text-white shadow-md md:shadow-xl ${stat.shadow} transform transition-transform hover:-translate-y-1`}>
            {/* মোবাইলে আইকন উপরে, ডেক্সটপে ডানপাশে */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
              
              <div className="order-2 md:order-1 w-full overflow-hidden">
                <p className="text-white/80 text-[10px] md:text-[11px] font-bold mb-0.5 md:mb-1 uppercase tracking-wider truncate">{stat.label}</p>
                <h3 className="text-lg sm:text-xl md:text-3xl font-black truncate">{stat.value}</h3>
              </div>
              
              <div className="order-1 md:order-2 w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={stat.icon} />
                </svg>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* 🌟 নিচের দুই কলামের সেকশন (টেবিল এবং এলার্ট) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* বাম পাশ: সাম্প্রতিক অর্ডার টেবিল */}
        <div className="xl:col-span-2 bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 p-5 md:p-8 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-black text-[#3B3433]">সাম্প্রতিক অর্ডারসমূহ</h3>
            <span className="text-[10px] md:text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">সর্বশেষ ৫টি</span>
          </div>
          
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="pb-3 md:pb-4 pr-4">Order ID</th>
                  <th className="pb-3 md:pb-4 px-4">Customer</th>
                  <th className="pb-3 md:pb-4 px-4 text-right">Amount</th>
                  <th className="pb-3 md:pb-4 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-400 font-medium text-sm">কোনো অর্ডার পাওয়া যায়নি।</td></tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 md:py-4 pr-4 font-black text-[#8A1538] text-sm">#{order.order_id}</td>
                      <td className="py-3 md:py-4 px-4">
                        <span className="font-bold text-[#3B3433] block text-sm">{order.customer_name}</span>
                        <span className="text-[10px] md:text-xs text-gray-400">{order.phone}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 font-black text-[#3B3433] text-right text-sm">৳{order.total_price}</td>
                      <td className="py-3 md:py-4 pl-4 text-right">
                        <span className={`inline-flex px-2 md:px-3 py-1 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Pending Payment' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ডান পাশ: লো-স্টক এলার্ট */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-rose-100 p-5 md:p-8 shadow-sm flex flex-col h-full">
          <h3 className="text-lg md:text-xl font-black text-rose-600 mb-5 md:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            লো-স্টক এলার্ট
          </h3>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[250px] md:max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-rose-100">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-center text-emerald-600 font-bold text-sm border border-emerald-100 h-full flex items-center justify-center">
                সব প্রোডাক্টের স্টক পর্যাপ্ত আছে! 🎉
              </div>
            ) : (
              lowStockProducts.slice(0, 8).map((product, idx) => {
                const stockCount = Number(product.stock);
                return (
                  <div key={idx} className="flex justify-between items-center p-3 md:p-4 bg-rose-50/30 rounded-xl md:rounded-2xl border border-rose-50 hover:bg-rose-50 transition-colors">
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-xs md:text-sm text-[#3B3433] truncate">{product.name}</p>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-mono mt-0.5">{product.id}</p>
                    </div>
                    <span className={`px-2 py-1 md:px-2.5 text-[9px] md:text-[10px] font-black rounded-md md:rounded-lg whitespace-nowrap ${stockCount === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      {stockCount === 0 ? 'Out of Stock' : `${stockCount} Left`}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}