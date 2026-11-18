import Link from "next/link";
import { getGoogleSheet } from "../../../lib/googleSheets"; 
import ProductTabs from "../../../components/ProductTabs";
import ProductInteractive from "../../../components/ProductInteractive";

async function getProductBySlug(targetSlug) {
  try {
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const products = rows.map((row) => {
      const data = row.toObject();
      
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
        specifications: data.specifications,
        warranty: data.warranty,
        description: data.description,
        stock: data.stock,
        variants: data.variants || "",
        primary_variant_name: data.primary_variant_name || "Option",
        attributes: data.attributes || "",
      };
    });

    return products.find((p) => p.slug === targetSlug);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function SingleProductPage({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 w-full">
        <h2 className="text-4xl font-black mb-4 text-red-500 tracking-tight">Product Not Found!</h2>
        <p className="text-slate-500 mb-8 font-medium">The product you are looking for does not exist or has been removed.</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold tracking-wide hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Return to Shop
        </Link>
      </div>
    );
  }

  const specsList = product.specifications ? product.specifications.split('|').map(s => s.trim()) : [];

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-purple-200 selection:text-purple-900 pb-24 md:pb-12 w-full overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50 via-purple-50/50 to-transparent z-0 pointer-events-none"></div>
      
      <div className="relative z-10 w-full px-4 md:px-12 lg:px-16 xl:px-24 py-8 md:py-12">
        
        {/* 🌟 পরিবর্তন: ব্রডক্রাম্ব এখন মোবাইলে hidden থাকবে এবং ডেক্সটপে flex দেখাবে */}
        <nav className="hidden md:flex items-center text-xs font-bold tracking-widest text-slate-400 mb-8 uppercase">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-3 text-slate-300">/</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">{product.category}</span>
          <span className="mx-3 text-slate-300">/</span>
          <span className="text-slate-800 truncate max-w-[200px] md:max-w-sm">{product.name}</span>
        </nav>

        {/* Interactive Main Layout */}
        <ProductInteractive product={product} specsList={specsList} />

        {/* Bottom Section: Tabs */}
        <div className="mt-20 w-full mb-10">
           <ProductTabs description={product.description} specifications={product.specifications} />
        </div>

      </div>
    </div>
  );
}