"use client";
import { useState } from "react";

export default function ProductTabs({ description, specifications }) {
  const [activeTab, setActiveTab] = useState("desc");
  const specsList = specifications ? specifications.split('|').map(s => s.trim()) : [];

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      
      {/* Tab Headers */}
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab("desc")}
          className={`flex-1 py-5 text-sm md:text-base font-bold tracking-widest uppercase transition-all ${
            activeTab === "desc" 
            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" 
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          Description
        </button>
        <button 
          onClick={() => setActiveTab("specs")}
          className={`flex-1 py-5 text-sm md:text-base font-bold tracking-widest uppercase transition-all ${
            activeTab === "specs" 
            ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/30" 
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tech Specs
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-10 text-slate-600 leading-relaxed min-h-[200px]">
        
        {/* Description Content */}
        {activeTab === "desc" && (
          <div className="animate-fade-in">
            {description ? (
              <p className="text-base md:text-lg text-slate-600 font-medium whitespace-pre-wrap">
                {description}
              </p>
            ) : (
              <p className="text-slate-400 italic">No description available for this product.</p>
            )}
          </div>
        )}

        {/* Specifications Content (Beautiful Table-like format) */}
        {activeTab === "specs" && (
          <div className="animate-fade-in">
            {specsList.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {specsList.map((spec, i) => (
                  <li key={i} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span className="font-semibold text-slate-700">{spec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic">No detailed specifications available.</p>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}