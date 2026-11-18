"use client";
import { useState, useEffect } from "react";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import { trackEvent } from "../lib/trackEvent";

// দাম ফরম্যাট করার ফাংশন (UI এর জন্য)
const formatPrice = (price) => {
  if (!price) return "";
  const numericPrice = Number(price.toString().replace(/,/g, ''));
  if (isNaN(numericPrice)) return price; 
  return new Intl.NumberFormat('en-US').format(numericPrice);
};

// দাম থেকে কমা সরিয়ে শুধু নম্বর বের করার ফাংশন (ট্র্যাকারের জন্য)
const cleanPrice = (price) => {
  if (!price) return 0;
  return Number(price.toString().replace(/[^0-9.-]+/g, ""));
};

export default function ProductInteractive({ product, specsList }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // ViewContent ইভেন্ট ফায়ার করা
  useEffect(() => {
    if (product) {
      trackEvent('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: cleanPrice(product.price),
        currency: 'BDT'
      });
    }
  }, [product]);

  // ভেরিয়েন্ট প্রসেসিং
  const variants = product.variants ? product.variants.split(',').filter(Boolean).map(v => {
    const parts = v.split(':');
    const name = parts[0]?.trim() || "";
    const price = parts[1]?.trim() || product.price;
    let image = parts.slice(2).join(':').trim();
    if (image === "undefined") image = "";
    return { name, price, image };
  }).filter(v => v.name !== "") : [];

  // ডাইনামিক এট্রিবিউট প্রসেসিং
  const parsedAttributes = product.attributes ? product.attributes.split('|').filter(Boolean).map(attr => {
    const [label, valuesStr] = attr.split('=');
    return {
      label: label?.trim() || "",
      values: valuesStr ? valuesStr.split(',').map(v => v.trim()).filter(Boolean) : []
    };
  }).filter(a => a.label !== "" && a.values.length > 0) : [];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayImagesString = selectedVariant && selectedVariant.image ? `${selectedVariant.image},${product.image}` : product.image;

  const isSelectionComplete = (!variants.length || selectedVariant) && parsedAttributes.every(attr => selectedAttributes[attr.label]);

  let finalVariantOptions = [];
  if (selectedVariant) finalVariantOptions.push(`${product.primary_variant_name || 'Option'}: ${selectedVariant.name}`);
  Object.entries(selectedAttributes).forEach(([key, val]) => finalVariantOptions.push(`${key}: ${val}`));

  const cartProduct = { ...product, price: currentPrice, image: displayImagesString, variant: finalVariantOptions.join(' | ') || null };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16 items-start">
      
      {/* গ্যালারি সেকশন */}
      <div className="lg:col-span-6 w-full">
         <ProductGallery imagesString={displayImagesString} productName={product.name} />
      </div>

      {/* ইনফো সেকশন */}
      <div className="lg:col-span-6 flex flex-col pt-0 md:pt-4">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          {product.brand && (
            <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">{product.brand}</span>
          )}
        </div>

        <h1 className="text-xl md:text-4xl font-extrabold tracking-tight mb-2 md:mb-3 text-slate-900 leading-tight">
          {product.name}
        </h1>

        <div className="flex items-baseline gap-2 md:gap-3 mb-5 md:mb-6">
          <span className="text-2xl md:text-5xl font-black text-blue-600">
            ৳{formatPrice(currentPrice)}
          </span>
          {product.regular_price && (
            <span className="text-sm md:text-xl text-slate-400 line-through font-semibold">
              ৳{formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {variants.length > 0 && (
          <div className="mb-4 md:mb-5">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2">Select {product.primary_variant_name || "Option"}:</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {variants.map((v, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedVariant(v)} 
                  className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl border-2 font-bold text-xs md:text-sm transition-all ${selectedVariant?.name === v.name ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {parsedAttributes.map((attr, idx) => (
          <div key={idx} className="mb-4 md:mb-5">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2">Select {attr.label}:</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {attr.values.map((val, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.label]: val }))} 
                  className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl border-2 font-bold text-xs md:text-sm transition-all ${selectedAttributes[attr.label] === val ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* পরিমাণ সেকশন */}
        <div className="mb-5 md:mb-6">
          <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2">পরিমাণ:</h3>
          <div className="flex items-center w-fit bg-slate-50 border border-slate-200 rounded-full p-1 shadow-sm">
            <button onClick={handleDecrease} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 hover:text-blue-600 hover:shadow-sm transition-all font-bold">
              -
            </button>
            <span className="w-10 text-center text-sm font-black text-slate-800">{quantity}</span>
            <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 hover:text-blue-600 hover:shadow-sm transition-all font-bold">
              +
            </button>
          </div>
        </div>

        {/* স্পেসিফিকেশন ট্যাগ */}
        {specsList.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {specsList.map((spec, i) => (
                <span key={i} className="px-2.5 py-1 md:px-4 md:py-2 bg-gray-50 border border-gray-100 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold text-slate-600">{spec}</span>
              ))}
            </div>
          </div>
        )}

        {/* অ্যাকশন বাটন সেকশন */}
        <div className="mt-2 mb-6">
           <ProductActions product={cartProduct} quantity={quantity} isSelectionComplete={isSelectionComplete} />
        </div>
      </div>
    </div>
  );
}