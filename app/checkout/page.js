"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "../../store/useCartStore"; 
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { trackEvent } from "../../lib/trackEvent"; // 🌟 ব্রাউজার ট্র্যাকিংয়ের জন্য

const cleanPrice = (price) => {
  if (!price) return 0;
  return Number(price.toString().replace(/[^0-9.-]+/g, ""));
};

const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat('en-IN').format(cleanPrice(price));
};

export default function CheckoutPage() {
  const router = useRouter(); 
  const { cartItems, updateQuantity, clearCart, updateVariant } = useCartStore(); 
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState([]); 

  const [deliveryFee, setDeliveryFee] = useState(120); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); 
  
  // 🌟 ট্র্যাকিং ডুপ্লিকেশন ঠেকানোর স্টেট
  const [hasTrackedCheckout, setHasTrackedCheckout] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [mfsMethods, setMfsMethods] = useState([]);

  const [formData, setFormData] = useState({
    name: "", phone: "", address: "", bkashNumber: "", trxId: ""
  });

  useEffect(() => {
    setMounted(true);
    
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    const fetchPaymentSettings = async () => {
      try {
        const res = await fetch('/api/payment-settings');
        const data = await res.json();
        if (data.success && data.settings && data.settings.payment_methods) {
          const parsedMethods = JSON.parse(data.settings.payment_methods);
          
          // 🌟 শুধুমাত্র Active মেথডগুলো ফিল্টার করে আনা হচ্ছে
          const activeMethods = parsedMethods.filter(m => m.isActive !== false);
          setMfsMethods(activeMethods);

          // 🌟 সর্টিং করা লিস্টের একদম প্রথম মেথডটা ডিফল্টভাবে সিলেক্ট হবে
          if (activeMethods.length > 0) {
            setPaymentMethod(activeMethods[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch payment settings:", err);
      }
    };

    fetchProducts();
    fetchPaymentSettings();
  }, []);

  // 🚀 ব্রাউজার সাইড ট্র্যাকিং (Pixel + GTM): InitiateCheckout
  useEffect(() => {
    if (mounted && cartItems.length > 0 && !hasTrackedCheckout) {
      const subTotalValue = cartItems.reduce((total, item) => total + (cleanPrice(item.price) * item.quantity), 0);
      const grandTotalValue = subTotalValue + deliveryFee; // ডেলিভারি চার্জ সহ মোট বিল
      const itemIds = cartItems.map(item => item.id);
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      
      const contents = cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        item_price: cleanPrice(item.price)
      }));

      trackEvent('InitiateCheckout', {
        content_ids: itemIds, 
        content_type: 'product', 
        num_items: totalItems, 
        value: grandTotalValue, 
        currency: 'BDT',
        contents: contents
      });
      setHasTrackedCheckout(true);
    }
  }, [mounted, cartItems, hasTrackedCheckout, deliveryFee]);

  if (!mounted) return null;

  const subTotal = cartItems.reduce((total, item) => total + (cleanPrice(item.price) * item.quantity), 0);
  const grandTotal = subTotal + (cartItems.length > 0 ? deliveryFee : 0);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVariantSelect = (uniqueId, currentVariantStr, key, value, newPrice = null) => {
    const currentSelections = {};
    if (currentVariantStr) {
       currentVariantStr.split('|').forEach(part => {
           const [k, v] = part.split(':').map(s => s.trim());
           if (k && v) currentSelections[k] = v;
       });
    }
    currentSelections[key] = value;
    const newVariantString = Object.entries(currentSelections).map(([k, v]) => `${k}: ${v}`).join(' | ');
    updateVariant(uniqueId, newVariantString, newPrice);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    
    // ভ্যারিয়েন্ট ভ্যালিডেশন
    const missingVariant = cartItems.find(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return false;
      const pVariants = product.variants ? product.variants.split(',').filter(Boolean) : [];
      const dAttrs = product.attributes ? product.attributes.split('|').filter(Boolean) : [];
      if (pVariants.length === 0 && dAttrs.length === 0) return false;

      const currentSelections = {};
      if (item.variant) {
          item.variant.split('|').forEach(part => {
              const [k, v] = part.split(':').map(s => s.trim());
              if (k && v) currentSelections[k] = v;
          });
      }

      const missingPrimary = pVariants.length > 0 && !currentSelections[product.primary_variant_name || "Option"];
      const missingDynamic = dAttrs.some(attr => {
          const label = attr.split('=')[0]?.trim();
          return label && !currentSelections[label];
      });

      return missingPrimary || missingDynamic;
    });

    if (missingVariant) {
      alert(`অনুগ্রহ করে '${missingVariant.name}' এর সব সাইজ/কালার/অপশন সিলেক্ট করুন।`);
      return;
    }

    // 🌟 পেমেন্ট ভ্যালিডেশন
    const selectedMfs = mfsMethods.find(m => m.id === paymentMethod);
    let actualPaymentMethod = selectedMfs ? selectedMfs.provider : "Unknown";

    if (selectedMfs && selectedMfs.id !== "cod") {
      actualPaymentMethod = `${selectedMfs.provider} (${selectedMfs.type})`;

      if (!formData.bkashNumber || formData.bkashNumber.length !== 11 || !formData.bkashNumber.startsWith("01")) {
        alert("অনুগ্রহ করে যে নম্বর থেকে টাকা পাঠিয়েছেন, সেই সঠিক ১১-ডিজিটের মোবাইল নাম্বার দিন!");
        return;
      }
      if (!formData.trxId) {
        alert("অনুগ্রহ করে TrxID দিন!");
        return;
      }
    }

    setIsSubmitting(true);

    const orderedItems = cartItems.map(item => {
      const variantText = item.variant ? ` [${item.variant}]` : "";
      return `${item.name}${variantText} - ৳${item.price} (x${item.quantity})`;
    }).join(" | ");

    // 🚀 সার্ভার সাইড (CAPI) এর জন্য ডেটা প্রিপারেশন
    const orderData = {
      name: formData.name, 
      phone: formData.phone, 
      address: formData.address,
      totalPrice: grandTotal, 
      sub_total: subTotal, 
      delivery_charge: deliveryFee,
      items: orderedItems, 
      cart_data: JSON.stringify(cartItems),
      payment_method: actualPaymentMethod,
      bkash_number: selectedMfs?.id !== 'cod' ? formData.bkashNumber : 'N/A',
      trx_id: selectedMfs?.id !== 'cod' ? formData.trxId : 'N/A'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData) // এই রিকোয়েস্টটি সার্ভারে CAPI Purchase ফায়ার করবে
      });
      const data = await res.json();

      if (data.success) {
        setIsRedirecting(true); 

        // 🚀 🌟 ব্রাউজার সাইড Purchase ফায়ার করা (Deduplication আইডি সহ)
        const contentIds = cartItems.map(item => item.id);
        const contents = cartItems.map(item => ({
           id: item.id,
           quantity: item.quantity,
           item_price: cleanPrice(item.price)
        }));

        trackEvent('Purchase', {
           content_ids: contentIds,
           content_type: 'product',
           value: grandTotal,
           currency: 'BDT',
           contents: contents
        }, data.orderId); // 🌟 এই orderId টাই eventId হিসেবে যাবে

        clearCart(); 
        // Thank You পেজে রিডাইরেক্ট
        router.push(`/thank-you?order_id=${data.orderId}&total=${grandTotal}&subtotal=${subTotal}&shipping=${deliveryFee}`); 
      } else {
        alert(data.error || "দুঃখিত, কোনো সমস্যা হয়েছে।");
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('নাম্বারটি কপি করা হয়েছে!');
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-[#3B3433]">অর্ডার সিকিউর করা হচ্ছে...</h2>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-[#3B3433] mb-4">আপনার কার্ট একদম খালি!</h2>
        <Link href="/shop" className="bg-[#8A1538] text-white px-8 py-3 rounded font-bold hover:bg-[#6e112d] transition-all">শপিং শুরু করুন</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#3B3433] font-sans pb-20">
      <div className="pt-8 pb-6 px-4 md:px-8 max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/shop" className="flex items-center gap-2 text-gray-500 hover:text-[#8A1538] transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> ফিরে যান
        </Link>
        <div className="text-center">
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">নিরাপদ চেকআউট</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B3433] tracking-tight">অর্ডার কনফার্মেশন</h1>
        </div>
        <div className="w-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          <div className="lg:col-span-7 flex flex-col gap-10">
            {/* ডেলিভারি ইনফো */}
            <div className="border border-gray-200 p-6 md:p-8 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-[#3B3433] mb-6 border-b border-gray-100 pb-4">ডেলিভারি তথ্য</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">আপনার নাম *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="পুরো নাম লিখুন" className="w-full px-4 py-3 bg-[#F6F4EB] border border-transparent focus:border-gray-300 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">মোবাইল নম্বর *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-[#F6F4EB] border border-transparent focus:border-gray-300 outline-none transition-all text-sm tracking-widest" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">সম্পূর্ণ ঠিকানা *</label>
                  <textarea required name="address" value={formData.address} onChange={handleInputChange} placeholder="গ্রাম/মহল্লা, থানা, জেলা" rows="3" className="w-full px-4 py-3 bg-[#F6F4EB] border border-transparent focus:border-gray-300 outline-none transition-all resize-none text-sm"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ডেলিভারি এরিয়া *</label>
                  <div className="flex gap-4">
                     <label className={`flex-1 text-center py-3 border cursor-pointer text-sm font-medium transition-all ${deliveryFee === 60 ? 'border-[#8A1538] text-[#8A1538] bg-red-50/30' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <input type="radio" name="delivery" checked={deliveryFee === 60} onChange={() => setDeliveryFee(60)} className="hidden" />
                        ঢাকার ভেতরে (৳৬০)
                     </label>
                     <label className={`flex-1 text-center py-3 border cursor-pointer text-sm font-medium transition-all ${deliveryFee === 120 ? 'border-[#8A1538] text-[#8A1538] bg-red-50/30' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <input type="radio" name="delivery" checked={deliveryFee === 120} onChange={() => setDeliveryFee(120)} className="hidden" />
                        ঢাকার বাইরে (৳১২০)
                     </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 পেমেন্ট অপশন (ইউনিফাইড & রেস্পন্সিভ গ্রিড) */}
            <div className="border border-gray-200 p-6 md:p-8 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-[#3B3433] mb-6 border-b border-gray-100 pb-4">পেমেন্ট অপশন</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {mfsMethods.map((method) => (
                  <label key={method.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method.id ? 'border-[#8A1538] bg-red-50/10 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 ${paymentMethod === method.id ? 'border-[#8A1538]' : 'border-gray-300'}`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-[#8A1538]"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#3B3433] text-sm capitalize leading-tight">{method.provider}</span>
                      {method.id !== 'cod' && <span className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-wider">{method.type}</span>}
                    </div>
                  </label>
                ))}
              </div>

              {/* 🌟 সিলেক্টেড মেথডের বিস্তারিত (COD এবং MFS এর জন্য আলাদা) */}
              {(() => {
                const selectedMfs = mfsMethods.find(m => m.id === paymentMethod);
                if (!selectedMfs) return null;

                return (
                  <div className="border border-orange-200 bg-[#FCFBF8] p-5 md:p-6 animate-fade-in rounded-xl">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        
                        {/* যদি COD না হয়, তবে নাম্বার এবং কপি বাটন দেখাবে */}
                        {selectedMfs.id !== 'cod' && (
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <span className="bg-[#A46522] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">{selectedMfs.type}</span>
                            <span className="text-[#8A1538] font-black text-xl tracking-wider">{selectedMfs.number}</span>
                            <button type="button" onClick={() => copyToClipboard(selectedMfs.number)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold hover:bg-gray-300 transition-colors flex items-center gap-1 active:scale-95">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> কপি করুন
                            </button>
                          </div>
                        )}
                        
                        {/* ইনস্ট্রাকশন (সবার জন্য) */}
                        <div className={`text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-line bg-white/50 p-4 border border-gray-100 rounded-lg ${selectedMfs.id !== 'cod' ? 'mb-6' : ''}`}>
                          {selectedMfs.instructions}
                        </div>

                        {/* ইনপুট ফিল্ড (শুধুমাত্র MFS এর জন্য) */}
                        {selectedMfs.id !== 'cod' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">যে নম্বর থেকে টাকা পাঠিয়েছেন (১১ ডিজিট) *</label>
                              <input type="tel" name="bkashNumber" value={formData.bkashNumber} onChange={handleInputChange} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-white border border-gray-200 text-sm outline-none focus:border-[#8A1538] rounded-lg tracking-widest" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">TrxID (ট্রানজেকশন আইডি) *</label>
                              <input type="text" name="trxId" value={formData.trxId} onChange={handleInputChange} placeholder="যেমন: 8N7A6B5C" className="w-full px-4 py-3 bg-white border border-gray-200 text-sm outline-none focus:border-[#8A1538] rounded-lg uppercase" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* QR কোড (যদি থাকে) */}
                      {selectedMfs.qrCodeUrl && selectedMfs.id !== 'cod' && (
                        <div className="w-full md:w-32 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                          <div className="w-24 h-24 bg-white p-1 border border-gray-200 rounded-xl shadow-sm mb-2">
                             <img src={selectedMfs.qrCodeUrl} alt="QR Code" className="w-full h-full object-cover rounded-lg" />
                          </div>
                          <p className="text-[10px] text-center text-gray-500 font-bold tracking-widest uppercase">স্ক্যান করে পে করুন</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 🛒 অর্ডারের বিবরণ */}
          <div className="lg:col-span-5">
            <div className="bg-[#2B2927] p-6 md:p-8 shadow-2xl lg:sticky lg:top-8 text-white rounded-xl">
              <h2 className="text-sm font-bold text-[#E5B361] mb-6 uppercase tracking-widest border-b border-gray-600 pb-4">অর্ডারের বিবরণ</h2>
              
              <div className="space-y-6 mb-8">
                {cartItems.map((item) => {
                  const uniqueId = item.cartItemId || item.id;
                  const firstImg = item.image ? item.image.split(',')[0].trim() : "";
                  const productDetails = products.find(p => p.id === item.id);
                  
                  const primaryName = productDetails?.primary_variant_name || "Option";
                  const primaryVariants = productDetails?.variants ? productDetails.variants.split(',').filter(Boolean).map(v => {
                    const parts = v.split(':');
                    return { name: parts[0]?.trim() || "", price: Number(parts[1]?.trim()) || productDetails.price };
                  }).filter(v => v.name !== "") : [];

                  const parsedAttributes = productDetails?.attributes ? productDetails.attributes.split('|').filter(Boolean).map(attr => {
                    const [label, valuesStr] = attr.split('=');
                    return { label: label?.trim() || "", values: valuesStr ? valuesStr.split(',').map(v => v.trim()).filter(Boolean) : [] };
                  }).filter(a => a.label !== "" && a.values.length > 0) : [];

                  const currentSelections = {};
                  if (item.variant) {
                      item.variant.split('|').forEach(part => {
                          const [k, v] = part.split(':').map(s => s.trim());
                          if (k && v) currentSelections[k] = v;
                      });
                  }

                  const hasIncompleteSelection = (primaryVariants.length > 0 && !currentSelections[primaryName]) || 
                                                 parsedAttributes.some(attr => !currentSelections[attr.label]);

                  return (
                    <div key={uniqueId} className={`flex gap-4 items-start border-b border-gray-700 pb-4 last:border-0 ${hasIncompleteSelection ? 'animate-pulse' : ''}`}>
                      <div className="w-16 h-16 bg-white flex-shrink-0 p-1 border border-gray-600 rounded">
                        {firstImg ? <img src={firstImg} alt={item.name} className="w-full h-full object-cover rounded-sm" /> : <div className="w-full h-full bg-gray-200"></div>}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm leading-tight truncate">{item.name}</h3>
                        <div className="text-[#E5B361] font-bold text-sm mt-1">৳{formatPrice(item.price)}</div>
                        
                        <div className="mt-3 space-y-3">
                            {primaryVariants.length > 0 && (
                               <div>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{primaryName}</p>
                                 <div className="flex flex-wrap gap-2">
                                   {primaryVariants.map((v, idx) => {
                                     const isSelected = currentSelections[primaryName] === v.name;
                                     return (
                                       <button key={idx} type="button" onClick={() => handleVariantSelect(uniqueId, item.variant, primaryName, v.name, v.price)}
                                         className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${isSelected ? 'bg-[#E5B361] text-black border-[#E5B361] shadow-md' : 'bg-white/5 text-gray-300 border-gray-600 hover:border-gray-400'}`}>
                                         {v.name}
                                       </button>
                                     );
                                   })}
                                 </div>
                               </div>
                            )}

                            {parsedAttributes.map((attr, idx) => (
                               <div key={`attr-${idx}`}>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{attr.label}</p>
                                 <div className="flex flex-wrap gap-2">
                                   {attr.values.map((val, i) => {
                                     const isSelected = currentSelections[attr.label] === val;
                                     return (
                                       <button key={i} type="button" onClick={() => handleVariantSelect(uniqueId, item.variant, attr.label, val)}
                                         className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${isSelected ? 'bg-purple-500 text-white border-purple-500 shadow-md' : 'bg-white/5 text-gray-300 border-gray-600 hover:border-gray-400'}`}>
                                         {val}
                                       </button>
                                     );
                                   })}
                                 </div>
                               </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center gap-3 border border-gray-500 px-2 py-1 text-white rounded">
                           <button type="button" onClick={() => updateQuantity(uniqueId, -1)} className="text-gray-400 hover:text-white font-bold cursor-pointer px-1">-</button>
                           <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                           <button type="button" onClick={() => updateQuantity(uniqueId, 1)} className="text-gray-400 hover:text-white font-bold cursor-pointer px-1">+</button>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 text-sm font-medium text-gray-300 border-t border-gray-600 pt-6 mb-6">
                <div className="flex justify-between items-center">
                  <span>পণ্যের মূল্য</span>
                  <span className="font-bold text-white">৳ {formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-bold text-white">৳ {formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-600 text-base mt-2">
                  <span className="font-bold text-white">সর্বমোট বিল</span>
                  <span className="font-black text-[#E5B361] text-2xl">৳ {formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#8A1538] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#6e112d] transition-all flex justify-center items-center gap-2 shadow-lg">
                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "কনফার্ম করুন"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}