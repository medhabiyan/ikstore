import { getGoogleSheet } from "../../../lib/googleSheets";
import ProductCard from "../../../components/ProductCard";
import Link from "next/link";

export default async function CategoryPage({ params }) {
  const awaitedParams = await params;
  const rawSlug = awaitedParams.slug;

  if (!rawSlug) {
    return <div className="text-center py-20 font-bold">Category slug is missing!</div>;
  }
  
  // 🌟 বুলেটপ্রুফ লজিক: লিঙ্কে যাই থাকুক, আমরা সেটাকে ডিকোড করে ছোট হাতের বানিয়ে নেব
  const slug = decodeURIComponent(rawSlug).toLowerCase();

  const doc = await getGoogleSheet();
  const sheet = doc.sheetsByIndex[0]; 
  const rows = await sheet.getRows();

  const filteredProducts = rows.filter((row) => {
    const rawCategory = row.get('category');
    const category = rawCategory ? String(rawCategory).trim() : 'Uncategorized';
    
    // গুগল শিটের ক্যাটাগরিকেও ছোট হাতের করে স্লাগ বানানো হলো
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    
    // এখন দুইটাই ছোট হাতের, তাই ১০০% ম্যাচ করবে!
    return categorySlug === slug;
  }).map(row => row.toObject());

  // ক্যাটাগরির নাম সুন্দর করে দেখানোর জন্য
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-[#8A1538] transition-colors flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#3B3433] tracking-tight mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-500 font-medium">
            Browsing all products in <span className="text-[#8A1538]">{categoryName}</span> category.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={idx} product={{
                ...product,
                slug: product.permalink || product.slug || product.id
              }} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-[#3B3433]">এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি!</h2>
            <p className="text-gray-400 mt-2">লিঙ্কটি চেক করুন অথবা ডাটাবেজে ক্যাটাগরির বানান চেক করুন।</p>
            <Link href="/" className="inline-block mt-6 text-[#8A1538] font-bold hover:underline">
              অন্যান্য প্রোডাক্ট দেখুন
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}