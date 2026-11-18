"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { trackEvent } from "../lib/trackEvent"; // 🌟 আমাদের নতুন ম্যাজিক ট্র্যাকার ইম্পোর্ট

const cleanPrice = (price) => {
  if (!price) return 0;
  return Number(price.toString().replace(/[^0-9.-]+/g, ""));
};

const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat('en-IN').format(cleanPrice(price));
};

export default function OfferCheckout({ product }) {
  const router = useRouter(); 
  
  // 🌟 ভেরিয়েন্ট ও প্রোডাক্ট স্টেট
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  
  // 🌟 ফর্ম ও পেমেন্ট স্টেট
  const [deliveryFee, setDeliveryFee] = useState(120); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", bkashNumber: "", trxId: "" });

  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [mfsMethods, setMfsMethods] = useState([]);

  // 🌟 ট্র্যাকিংয়ের জন্য স্টেট
  const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);

  // প্রাইমারি ভেরিয়েন্ট প্রসেসিং
  const variants = product.variants ? product.variants.split(',').filter(Boolean).map(v => {
    const parts = v.split(':');
    const name = parts[0]?.trim() || "";
    const price = parts[1]?.trim() || product.price;
    let image = parts.slice(2).join(':').trim();
    if (image === "undefined") image = "";
    return { name, price, image };
  }).filter(v => v.name !== "") : [];

  const parsedAttributes = product.attributes ? product.attributes.split('|').filter(Boolean).map(attr => {
    const [label, valuesStr] = attr.split('=');
    return {
      label: label?.trim() || "",
      values: valuesStr ? valuesStr.split(',').map(v => v.trim()).filter(Boolean) : []
    };
  }).filter(a => a.label !== "" && a.values.length > 0) : [];

  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) setSelectedVariant(variants[0]);
    
    const initialAttrs = {};
    parsedAttributes.forEach(attr => {
      if (!selectedAttributes[attr.label]) initialAttrs[attr.label] = attr.values[0];
    });
    if (Object.keys(initialAttrs).length > 0) setSelectedAttributes(prev => ({ ...prev, ...initialAttrs }));
  }, []);

  // 🌟 ডাটাবেস থেকে পেমেন্ট সেটিংস ফেচ করা
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const res = await fetch('/api/payment-settings');
        const data = await res.json();
        if (data.success && data.settings && data.settings.payment_methods) {
          const parsedMethods = JSON.parse(data.settings.payment_methods);
          const activeMethods = parsedMethods.filter(m => m.isActive !== false);
          setMfsMethods(activeMethods);
          if (activeMethods.length > 0) {
            setPaymentMethod(activeMethods[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch payment settings:", err);
      }
    };
    fetchPaymentSettings();
  }, []);

  const currentPrice = selectedVariant ? cleanPrice(selectedVariant.price) : cleanPrice(product.price);
  const subTotal = currentPrice * quantity;
  const grandTotal = subTotal + deliveryFee;

  // 🌟 ১. ViewContent ইভেন্ট (Queue System এর মাধ্যমে)
  useEffect(() => {
    if (product) {
      trackEvent('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: currentPrice,
        currency: 'BDT'
      });
    }
  }, [product, currentPrice]);

  // 🌟 ২. InitiateCheckout ইভেন্ট
  const handleFormInteraction = () => {
    if (!hasInitiatedCheckout && product) {
      trackEvent('InitiateCheckout', {
        content_name: product.name,
        content_ids: [product.id],
        value: grandTotal,
        currency: 'BDT',
        contents: [{ id: product.id, quantity: quantity, item_price: currentPrice }]
      });
      setHasInitiatedCheckout(true);
    }
  };

  const handleAttributeSelect = (label, value) => setSelectedAttributes(prev => ({ ...prev, [label]: value }));
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    handleFormInteraction(); 
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('নাম্বারটি কপি করা হয়েছে!');
  };

  const handleOrder = async (e) => {
    e.preventDefault();

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

    // 🌟 ৩. Subscribe ইভেন্ট (আপনার কথামতো বাটনে ক্লিক করলেই ফায়ার হবে)
    trackEvent('Subscribe', { value: grandTotal, currency: 'BDT' });

    let finalVariantOptions = [];
    if (selectedVariant) finalVariantOptions.push(`${product.primary_variant_name || 'Option'}: ${selectedVariant.name}`);
    Object.entries(selectedAttributes).forEach(([key, val]) => finalVariantOptions.push(`${key}: ${val}`));
    const finalVariantString = finalVariantOptions.join(' | ');

    const orderItemName = `${product.name}${finalVariantString ? ` [${finalVariantString}]` : ""} (x${quantity})`;

    const cartItemData = [{
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      variant: finalVariantString
    }];

    // 🚀 CAPI ও API এর জন্য ডেটা প্রিপারেশন
    const orderData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      totalPrice: grandTotal,
      sub_total: subTotal,           // 🌟 API এর জন্য যোগ করা হলো
      delivery_charge: deliveryFee,  // 🌟 API এর জন্য যোগ করা হলো
      items: orderItemName,
      cart_data: JSON.stringify(cartItemData), // 🌟 JSON.stringify করে পাঠানো হলো
      payment_method: actualPaymentMethod,
      bkash_number: selectedMfs?.id !== 'cod' ? formData.bkashNumber : 'N/A',
      trx_id: selectedMfs?.id !== 'cod' ? formData.trxId : 'N/A'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();

      if (data.success) {
        // 🌟 ৪. Purchase ইভেন্ট (সঠিক Deduplication এর সাথে)
        trackEvent('Purchase', { 
            content_name: product.name, 
            content_ids: [product.id],
            content_type: 'product',
            value: grandTotal, 
            currency: 'BDT',
            contents: [{ id: product.id, quantity: quantity, item_price: currentPrice }]
        }, data.orderId); // 🌟 এই orderId টাই eventId হিসেবে যাবে

        // 🌟 ৫. থ্যাংক ইউ পেজে জিরো দেখানোর সমস্যার সমাধান
        router.push(`/thank-you?order_id=${data.orderId}&total=${grandTotal}&subtotal=${subTotal}&shipping=${deliveryFee}`); 
      } else {
        alert(data.error || "দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আপনার ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16" onMouseEnter={handleFormInteraction} onTouchStart={handleFormInteraction}>
      
      {/* Left Column: Form & Payment Info */}
      <div className="space-y-8">
        
        {/* ১. কাস্টমার ইনফো */}
        <div>
          <h3 className="text-xl font-bold border-b pb-2 mb-6">১. আপনার তথ্য দিন</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">আপনার নাম *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="পুরো নাম লিখুন" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">মোবাইল নম্বর *</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] transition-all tracking-widest" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">সম্পূর্ণ ঠিকানা *</label>
              <textarea required name="address" value={formData.address} onChange={handleInputChange} placeholder="গ্রাম/মহল্লা, থানা, জেলা" rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] transition-all resize-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ডেলিভারি এরিয়া *</label>
              <div className="flex gap-4">
                 <label className={`flex-1 text-center py-3 border rounded-xl cursor-pointer text-sm font-bold transition-all ${deliveryFee === 60 ? 'border-[#8A1538] text-[#8A1538] bg-red-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" checked={deliveryFee === 60} onChange={() => setDeliveryFee(60)} className="hidden" />
                    ঢাকার ভেতরে (৳৬০)
                 </label>
                 <label className={`flex-1 text-center py-3 border rounded-xl cursor-pointer text-sm font-bold transition-all ${deliveryFee === 120 ? 'border-[#8A1538] text-[#8A1538] bg-red-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" checked={deliveryFee === 120} onChange={() => setDeliveryFee(120)} className="hidden" />
                     ঢাকার বাইরে (৳১২০)
                 </label>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 ২. পেমেন্ট অপশন */}
        <div>
          <h3 className="text-xl font-bold border-b pb-2 mb-6">২. পেমেন্ট অপশন</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {mfsMethods.map((method) => (
              <label key={method.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method.id ? 'border-[#8A1538] bg-red-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 ${paymentMethod === method.id ? 'border-[#8A1538]' : 'border-gray-300'}`}>
                  {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-[#8A1538]"></div>}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm capitalize leading-tight">{method.provider}</span>
                  {method.id !== 'cod' && <span className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-wider">{method.type}</span>}
                </div>
              </label>
            ))}
          </div>

          {/* সিলেক্টেড পেমেন্ট মেথডের ডিটেইলস */}
          {(() => {
            const selectedMfs = mfsMethods.find(m => m.id === paymentMethod);
            if (!selectedMfs) return null;

            return (
              <div className="border border-red-100 bg-[#FFF9F9] p-5 rounded-xl animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    
                    {selectedMfs.id !== 'cod' && (
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="bg-[#A46522] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{selectedMfs.type}</span>
                        <span className="text-[#8A1538] font-black text-lg tracking-widest">{selectedMfs.number}</span>
                        <button type="button" onClick={() => copyToClipboard(selectedMfs.number)} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold hover:bg-gray-50 transition-colors flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> কপি
                        </button>
                      </div>
                    )}
                    
                    <div className={`text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-line bg-white p-4 border border-gray-100 rounded-lg ${selectedMfs.id !== 'cod' ? 'mb-5' : ''}`}>
                      {selectedMfs.instructions}
                    </div>

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

                  {selectedMfs.qrCodeUrl && selectedMfs.id !== 'cod' && (
                    <div className="w-full sm:w-28 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4">
                      <div className="w-20 h-20 bg-white p-1 border border-gray-200 rounded-lg shadow-sm mb-2">
                         <img src={selectedMfs.qrCodeUrl} alt="QR Code" className="w-full h-full object-cover rounded" />
                      </div>
                      <p className="text-[9px] text-center text-gray-500 font-bold tracking-widest uppercase">স্ক্যান টু পে</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

      </div>

      {/* Right Column: Order Summary & Variants */}
      <div className="bg-[#FFF9F9] p-6 md:p-8 rounded-2xl border border-red-100 h-fit lg:sticky lg:top-8">
        <h3 className="text-xl font-bold border-b pb-2 mb-6">৩. অর্ডার সামারি</h3>

        <div className="space-y-5 mb-8">
            
            {variants.length > 0 && (
              <div>
                <span className="text-sm font-bold text-gray-700 block mb-2">{product.primary_variant_name || "Option"} সিলেক্ট করুন:</span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedVariant(v)} className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedVariant?.name === v.name ? 'border-[#8A1538] bg-red-50 text-[#8A1538]' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'}`}>
                      {v.image && <img src={v.image} alt={v.name} className="w-5 h-5 rounded-full object-cover" />} {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {parsedAttributes.map((attr, idx) => (
              <div key={idx}>
                <span className="text-sm font-bold text-gray-700 block mb-2">{attr.label} সিলেক্ট করুন:</span>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val, i) => (
                    <button key={i} type="button" onClick={() => handleAttributeSelect(attr.label, val)} className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all ${selectedAttributes[attr.label] === val ? 'border-[#8A1538] bg-red-50 text-[#8A1538]' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'}`}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
               <span className="text-sm font-bold text-gray-700 block mb-2">পরিমাণ:</span>
               <div className="flex items-center w-32 bg-white border border-gray-200 rounded-lg p-1">
                  <button type="button" onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded">-</button>
                  <span className="flex-1 text-center font-black">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded">+</button>
               </div>
            </div>
        </div>

        <div className="space-y-3 text-sm font-bold text-gray-600 border-t border-red-200 pt-6 mb-8">
            <div className="flex justify-between">
              <span>প্রোডাক্টের মূল্য (x{quantity})</span>
              <span className="text-gray-800">৳ {formatPrice(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ</span>
              <span className="text-gray-800">৳ {formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-red-200 text-lg">
              <span className="text-[#3B3433] font-black">সর্বমোট বিল</span>
              <span className="text-[#8A1538] font-black text-2xl">৳ {formatPrice(grandTotal)}</span>
            </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-[#3B3433] text-white py-4 rounded-xl font-black text-xl hover:bg-black active:scale-[0.98] transition-all flex justify-center items-center gap-3 shadow-xl">
          {isSubmitting ? <span className="w-6 h-6 border-4 border-white/30 border-t-[#E5B361] rounded-full animate-spin"></span> : "অর্ডার কনফার্ম করুন"}
        </button>

      </div>
    </form>
  );
}