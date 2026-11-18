"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const ORDER_STATUSES = [
  'Pending Payment', 'Processing', 'On Hold', 'Shipped', 
  'Completed', 'Refunded', 'Canceled', 'Draft'
];

export default function OrderDetailsPage() {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products')
        ]);
        
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        
        if (ordersData.success) {
          setAllOrders(ordersData.orders);
          const foundOrder = ordersData.orders.find(o => o.order_id === id);
          if (foundOrder) {
            foundOrder.status = (!foundOrder.status || foundOrder.status === 'Pending') 
                                ? 'Pending Payment' : foundOrder.status;
            setOrder(foundOrder);
          }
        }
        if (productsData.success) {
          setProducts(productsData.products);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setOrder({ ...order, status: newStatus });

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id, status: newStatus })
      });

      const result = await res.json();

      if (result.success) {
        setToastMessage(`অর্ডার স্ট্যাটাস '${newStatus}' তে আপডেট করা হয়েছে!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); 
      } else {
        alert("সমস্যা হয়েছে: " + result.error);
        setOrder({ ...order }); 
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    } finally {
      setUpdating(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 🌟 প্রফেশনাল পিডিএফ ডাউনলোড (Native Print)
  const handleDownloadInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F4EB]/30">
        <div className="w-12 h-12 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return <div className="text-center py-20 font-bold text-xl">অর্ডারটি পাওয়া যায়নি!</div>;

  const isBkash = order.payment_method?.toLowerCase().includes('bkash');
  const displayPhone = order.phone?.toString().startsWith('0') || order.phone?.toString().startsWith('+') ? order.phone : `0${order.phone}`;

  const copyAllCustomerInfo = () => {
    const fullInfo = `Name: ${order.customer_name}\nPhone: ${displayPhone}\nAddress: ${order.address}`;
    handleCopy(fullInfo, 'all');
  };

  const copyForCourier = () => {
    const codAmount = (isBkash || order.status === 'Completed') ? 0 : order.total_price;
    const courierInfo = `Name: ${order.customer_name}\nPhone: ${displayPhone}\nAddress: ${order.address}\nCOD Amount: ৳${codAmount}`;
    handleCopy(courierInfo, 'courier');
  };

  const customerHistory = allOrders.filter(o => {
    const historyPhone = o.phone?.toString().startsWith('0') || o.phone?.toString().startsWith('+') ? o.phone : `0${o.phone}`;
    return historyPhone === displayPhone && o.order_id !== order.order_id;
  });

  let finalParsedItems = [];
  let calculatedSubTotal = 0;

  if (order.cart_data) {
     try {
       const cartDataArr = JSON.parse(order.cart_data);
       finalParsedItems = cartDataArr.map(item => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 1;
          const itemTotal = price * qty;
          calculatedSubTotal += itemTotal;
          return {
             name: item.name,
             variant: item.variant || null,
             qty: qty,
             price: price,
             itemTotal: itemTotal,
             image: item.image ? item.image.split(',')[0].trim() : null
          };
       });
     } catch (e) {
       console.error("Failed to parse cart_data", e);
     }
  }

  if (finalParsedItems.length === 0 && order.items) {
     finalParsedItems = order.items.split(/[,|]/).map(itemStr => {
       const match = itemStr.match(/(.*)\s\(x(\d+)\)/);
       let name = match ? match[1].trim() : itemStr.trim();
       const qty = match ? parseInt(match[2]) : 1;
       let variant = null;
       const variantMatch = name.match(/\[(.*?)\]/);
       if (variantMatch) {
          variant = variantMatch[1];
          name = name.replace(/\[.*?\]/, '').trim();
       }
       const matchedProduct = products.find(p => p.name === name);
       const price = matchedProduct ? Number(matchedProduct.price) : 0;
       const itemTotal = price * qty;
       calculatedSubTotal += itemTotal;
       return { name, variant, qty, price, itemTotal, image: matchedProduct?.image ? matchedProduct.image.split(',')[0].trim() : null };
     });
  }

  const finalSubTotal = order.sub_total ? Number(order.sub_total) : calculatedSubTotal;
  const calculatedDelivery = Number(order.total_price) - finalSubTotal;
  const finalDeliveryCharge = order.delivery_charge ? Number(order.delivery_charge) : (calculatedDelivery > 0 ? calculatedDelivery : 120);

  let paymentStatusBadge = null;
  let paymentStatusText = "Unpaid";
  if (order.status === 'Completed') {
      paymentStatusBadge = <span className="block text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded inline-block">Paid / পরিশোধিত</span>;
      paymentStatusText = "Paid";
  } else if (order.status === 'Canceled' || order.status === 'Refunded') {
      paymentStatusBadge = <span className="block text-xs font-bold text-red-600 mt-1 bg-red-50 px-2 py-0.5 rounded inline-block">{order.status}</span>;
      paymentStatusText = order.status;
  } else if (isBkash) {
      paymentStatusBadge = <span className="block text-xs font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block">Paid (Advance)</span>;
      paymentStatusText = "Paid (bKash)";
  } else {
      paymentStatusBadge = <span className="block text-xs font-bold text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded inline-block">Unpaid (COD) / বাকি</span>;
  }

  const CheckIcon = () => (
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <>
      {/* 🌟 🌟 🌟 MAIN DASHBOARD UI (Hidden during PDF Generation) 🌟 🌟 🌟 */}
      <div className="min-h-screen bg-[#FDFCF8] text-[#3B3433] font-sans pb-20 relative print:hidden">
        
        {showToast && (
          <div className="fixed bottom-10 right-10 z-[100] animate-slide-up">
            <div className="bg-[#2B2927] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-sm">সফলভাবে আপডেট হয়েছে!</h4>
                <p className="text-[10px] text-gray-400">{toastMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-b border-gray-200 px-6 md:px-10 py-5 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-[#8A1538] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-[#3B3433]">Order #{order.order_id}</h1>
              <p className="text-xs text-gray-500 font-medium">{order.date}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={handleDownloadInvoice} 
                className="flex items-center gap-2 bg-[#8A1538] hover:bg-[#6e112d] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Invoice
            </button>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border hidden md:inline-block transition-colors ${
                order.status === 'Pending Payment' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                (order.status === 'Canceled' || order.status === 'Refunded') ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-10 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-lg font-bold text-[#3B3433] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  অর্ডার করা আইটেমসমূহ
                </h2>
                
                <div className="space-y-4 mb-8">
                  {finalParsedItems.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                        {item.variant && (
                          <p className="text-[11px] text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">{item.variant}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">৳{item.price} × {item.qty}</p>
                      </div>
                      <div className="font-bold text-[#3B3433] whitespace-nowrap">
                        ৳{item.itemTotal || '---'}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-[#FDFDFD] p-6 rounded-2xl border border-dashed border-gray-300">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Order Summary</h3>
                  
                  <div className="space-y-3 text-sm font-medium text-gray-600">
                    <div className="flex justify-between">
                      <span>সাবটোটাল ({finalParsedItems.length} আইটেম)</span>
                      <span className="font-bold text-gray-800">৳{finalSubTotal || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ডেলিভারি চার্জ</span>
                      <span className="font-bold text-gray-800">৳{finalDeliveryCharge}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-800">সর্বমোট বিল</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-[#8A1538]">৳{order.total_price}</span>
                      {paymentStatusBadge}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-lg font-bold text-[#3B3433] mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  পেমেন্ট ইনফরমেশন
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">পেমেন্ট মেথড</p>
                      <p className={`font-bold text-base ${isBkash ? 'text-pink-600' : 'text-emerald-600'}`}>
                        {isBkash ? 'bKash (ম্যানুয়াল)' : 'Cash on Delivery'}
                      </p>
                    </div>
                    {isBkash ? <div className="w-8 h-8 rounded bg-pink-100 flex items-center justify-center text-xl">📱</div> : <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-xl">💵</div>}
                  </div>
                  
                  {isBkash && (
                    <div className="bg-pink-50/50 p-5 rounded-xl border border-pink-100 col-span-1 md:col-span-2 flex flex-wrap gap-6">
                      <div>
                        <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mb-1">বিকাশ নাম্বার</p>
                        <p className="font-mono font-bold text-pink-900 text-lg">
                          {order.bkash_number?.toString().startsWith('0') || order.bkash_number?.toString().startsWith('+') ? order.bkash_number : `0${order.bkash_number}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mb-1">TrxID</p>
                        <p className="font-mono font-bold text-pink-900 text-lg uppercase bg-white px-2 py-0.5 rounded shadow-sm">{order.trx_id || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-[#3B3433] flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    কাস্টমার ইনফো
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={copyAllCustomerInfo} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                      {copiedField === 'all' ? <><CheckIcon /> Copied!</> : <>📋 Copy All</>}
                    </button>
                    <button onClick={copyForCourier} className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
                      {copiedField === 'courier' ? <><CheckIcon /> Ready</> : <>🚚 Courier</>}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-start group">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">নাম</p>
                      <p className="font-bold text-[#3B3433] text-base">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start group">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">মোবাইল নাম্বার</p>
                      <p className="font-bold text-[#3B3433] font-mono text-base">{displayPhone}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start group bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">ডেলিভারি অ্যাড্রেস</p>
                      <p className="font-medium text-gray-700 text-sm leading-relaxed">{order.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-lg font-bold text-[#3B3433] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <svg className="w-5 h-5 text-[#E5B361]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  কাস্টমার হিস্ট্রি
                </h2>
                {customerHistory.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <span className="text-2xl mb-2 block">🌟</span>
                    <p className="text-sm font-bold text-gray-500">এটি কাস্টমারের প্রথম অর্ডার!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                    {customerHistory.map((hist, i) => (
                      <Link href={`/admin/orders/${hist.order_id}`} key={i} className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 border border-gray-100 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-blue-600 text-xs">#{hist.order_id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hist.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {hist.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-gray-500 font-medium">{hist.date?.split(' ')[0]}</span>
                          <span className="font-bold text-[#3B3433] text-sm">৳{hist.total_price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#2B2927] rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full mix-blend-overlay filter blur-xl"></div>
                 <h2 className="text-sm font-bold text-[#E5B361] mb-6 uppercase tracking-widest border-b border-gray-600 pb-4">স্ট্যাটাস আপডেট</h2>
                 <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E5B361] appearance-none font-bold cursor-pointer disabled:opacity-50 transition-all hover:bg-white/20"
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status} value={status} className="text-gray-900 bg-white font-bold">{status}</option>
                    ))}
                 </select>
                 {updating && <p className="text-xs text-[#E5B361] mt-3 animate-pulse text-center">স্ট্যাটাস আপডেট হচ্ছে...</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 🌟 🌟 INVOICE TEMPLATE (NATIVE PDF) - Only Visible on Print 🌟 🌟 🌟 */}
      {/* এটি স্ক্রিনে সম্পূর্ণ লুকানো থাকবে, শুধুমাত্র ডাউনলোড বাটনে চাপলেই এটা প্রিন্ট হবে */}
      <div 
        className="hidden print:block bg-white text-black w-full"
        style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "15mm" }}
      >
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#8A1538] pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-[#8A1538] tracking-tight mb-2">IK Store</h1>
              <p className="text-gray-500 text-sm font-medium">Premium Tools Store</p>
              <p className="text-gray-500 text-sm mt-2">রংপুর সদর, রংপুর, বাংলাদেশ।</p>
              <p className="text-gray-500 text-sm">Phone: 01349-058676</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">Invoice</h2>
              <p className="text-gray-600 font-medium mt-2">Order ID: <span className="font-bold text-black">{order.order_id}</span></p>
              <p className="text-gray-600 font-medium">Date: <span className="font-bold text-black">{order.date}</span></p>
              <div className="mt-3 inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold text-sm">
                 Status: {paymentStatusText}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#E5B361] uppercase tracking-widest mb-3 border-b pb-2">Bill To / Delivery Detail</h3>
            <p className="text-lg font-bold text-gray-800">{order.customer_name}</p>
            <p className="text-gray-600 font-medium my-1">Phone: <span className="font-bold text-black">{displayPhone}</span></p>
            <p className="text-gray-600 font-medium w-2/3 leading-relaxed">Address: {order.address}</p>
          </div>

          {/* Order Table */}
          <div className="mb-8">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-[#8A1538] text-white">
                   <th className="py-3 px-4 font-bold text-sm uppercase">Item Description</th>
                   <th className="py-3 px-4 font-bold text-sm uppercase text-center">Qty</th>
                   <th className="py-3 px-4 font-bold text-sm uppercase text-right">Price</th>
                   <th className="py-3 px-4 font-bold text-sm uppercase text-right">Total</th>
                 </tr>
               </thead>
               <tbody>
                 {finalParsedItems.map((item, i) => (
                   <tr key={i} className="border-b border-gray-200">
                     <td className="py-4 px-4">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500 mt-1">{item.variant}</p>}
                     </td>
                     <td className="py-4 px-4 text-center font-bold text-gray-700">{item.qty}</td>
                     <td className="py-4 px-4 text-right text-gray-600">BDT {item.price}</td>
                     <td className="py-4 px-4 text-right font-bold text-gray-800">BDT {item.itemTotal}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Summary / Total */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2">
              <div className="flex justify-between py-2 text-gray-600 font-medium">
                <span>Subtotal:</span>
                <span>BDT {finalSubTotal}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600 font-medium border-b border-gray-200">
                <span>Delivery Charge:</span>
                <span>BDT {finalDeliveryCharge}</span>
              </div>
              <div className="flex justify-between py-4 text-xl font-black text-[#8A1538]">
                <span>Grand Total:</span>
                <span>BDT {order.total_price}</span>
              </div>
              
              {/* COD / Payment Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Payment Method</p>
                <p className="font-bold text-gray-800">{isBkash ? 'bKash (Advance)' : 'Cash on Delivery (COD)'}</p>
                
                <div className="mt-4 pt-3 border-t border-gray-300">
                  <p className="text-sm font-bold text-gray-600">Amount to Collect (COD):</p>
                  <p className="text-2xl font-black text-black mt-1">
                     BDT {(isBkash || order.status === 'Completed') ? '0' : order.total_price}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-auto pt-8 border-t border-gray-200 text-center">
             <p className="text-gray-500 font-bold mb-1">Thank you for shopping with IK Store!</p>
             <p className="text-xs text-gray-400">If you have any questions about this invoice, please contact us at 01404147734</p>
          </div>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        
        /* 🌟 পিডিএফ প্রিন্ট করার সময় ব্রাউজারের হেডার/ফুটার মুছে ফেলার জন্য */
        @media print {
          @page { margin: 0; }
          body { background-color: white !important; }
        }
      `}</style>
    </>
  );
}