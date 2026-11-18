// 🌟 এই একটি লাইনই আপনার ক্যাশিং সমস্যার সমাধান করবে
export const dynamic = 'force-dynamic'; 

import { getGoogleSheet } from "../../lib/googleSheets";
import ProductCard from "../../components/ProductCard";

// সার্ভার থেকে গুগল শিটের সব প্রোডাক্ট আনার ফাংশন
async function getAllProducts() {
  try {
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    return rows.map((row) => {
      const data = row.toObject();

      // Permalink লজিক: permalink কলামে ডেটা থাকলে সেটি নেবে, ফাঁকা থাকলে নাম থেকে বানাবে
      let generatedSlug = "";
      if (data.permalink && data.permalink.trim() !== "") {
        generatedSlug = data.permalink.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      } else if (data.name) {
        generatedSlug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }

      return {
        id: data.id,
        name: data.name,
        slug: generatedSlug,
        price: data.price,
        regular_price: data.regular_price,
        category: data.category,
        brand: data.brand,
        image: data.image,
        stock: data.stock,
      };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Explore Products
          </h1>
          <p className="text-slate-500 font-medium">
            খুঁজে নিন আপনার পছন্দের পণ্যগুলো সেরা দামে।
          </p>
        </div>

        {/* Responsive Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <ProductCard key={`${product.id || product.slug}-${index}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-slate-700">কোনো প্রোডাক্ট পাওয়া যায়নি!</h2>
            <p className="text-slate-500 mt-2">ডাটাবেজে ডেটা যোগ করলে এখানে দেখতে পাবেন।</p>
          </div>
        )}

      </div>
    </div>
  );
}