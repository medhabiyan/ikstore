"use client";
import { useState, useEffect } from "react";

export default function ProductGallery({ imagesString, productName }) {
  const images = imagesString ? imagesString.split(",").map((img) => img.trim()) : [];
  const [mainImg, setMainImg] = useState(images[0] || "");
  
  // 🌟 ফিক্স: প্রপস চেঞ্জ হলে (ভেরিয়েন্ট সিলেক্ট করলে) যেন মেইন ছবি সাথে সাথে পাল্টে যায়
  useEffect(() => {
    if (images.length > 0) {
      setMainImg(images[0]);
    } else {
      setMainImg("");
    }
  }, [imagesString]);

  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)", 
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 🌟 মেইন ইমেজ কন্টেইনার (সব ডিভাইসে ১:১ স্কয়ার রেশিও ফিক্স করা হয়েছে) */}
      <div 
        className="w-full bg-white aspect-square rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm cursor-crosshair"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => {
          setIsZooming(false);
          setZoomStyle({ transformOrigin: "center center", transform: "scale(1)" });
        }}
        onMouseMove={handleMouseMove}
      >
        {mainImg ? (
          <img
            src={mainImg}
            alt={productName}
            className="w-full h-full object-contain transition-transform duration-200 ease-out"
            style={isZooming ? zoomStyle : { transform: "scale(1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
        )}
      </div>

      {/* 🌟 থাম্বনেইল গ্যালারি (এখানেও ক্রপিং বন্ধ করে object-contain দেওয়া হয়েছে) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-3 scrollbar-hide snap-x px-3"> 
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImg(img)}
              className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden transition-all duration-300 snap-center ${
                mainImg === img 
                ? "ring-4 ring-blue-600 ring-offset-2 shadow-xl opacity-100" 
                : "ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:ring-slate-300"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain p-1 bg-white" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}