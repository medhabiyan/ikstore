export const dynamic = 'force-dynamic';
export const revalidate = 0; // এটি ক্যাশ একদম জিরো করে দেবে

import { NextResponse } from 'next/server';
import { getGoogleSheet } from "../../../lib/googleSheets";

// ১. প্রোডাক্ট দেখার জন্য (GET)
export async function GET() {
  try {
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[0]; 
    const rows = await sheet.getRows();

    const products = rows.map((row) => {
      const data = row.toObject();
      return {
        id: data.id,
        name: data.name,
        slug: data.permalink || data.slug || data.id,
        permalink: data.permalink,
        price: data.price,
        regular_price: data.regular_price,
        description: data.description,
        specifications: data.specifications,
        image: data.image,
        category: data.category,
        brand: data.brand,
        stock: data.stock,
        variants: data.variants || '',
        is_landing_page: data.is_landing_page || 'FALSE',
        warranty: data.warranty || '',
        primary_variant_name: data.primary_variant_name || 'Option',
        attributes: data.attributes || '',
        
        // 🌟 ল্যান্ডিং পেজের ফিল্ডগুলো (lp_hero_image যুক্ত করা হলো)
        lp_hero_image: data.lp_hero_image || '',
        lp_slogan: data.lp_slogan || '',
        lp_headline: data.lp_headline || '',
        lp_features_title: data.lp_features_title || '',
        lp_features_list: data.lp_features_list || '',
        lp_gallery_quote: data.lp_gallery_quote || '',
        lp_fomo_text: data.lp_fomo_text || '',
      };
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
  }
}

// ২. নতুন প্রোডাক্ট যুক্ত করার জন্য (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doc = await getGoogleSheet();
    
    const settingsSheet = doc.sheetsByTitle['Settings'];
    if (!settingsSheet) {
       return NextResponse.json({ success: false, error: "Settings sheet not found!" }, { status: 500 });
    }

    const settingsRows = await settingsSheet.getRows();
    let lastIdRow = settingsRows.find(row => row.get('key') === 'last_product_id');
    let nextIdNumber = 1; 

    if (lastIdRow) {
       nextIdNumber = parseInt(lastIdRow.get('value')) + 1;
       if(isNaN(nextIdNumber)) nextIdNumber = 1;
       lastIdRow.set('value', nextIdNumber.toString());
       await lastIdRow.save(); 
    } else {
       await settingsSheet.addRow({ key: 'last_product_id', value: '1' });
    }

    const formattedNumber = nextIdNumber.toString().padStart(3, '0');
    const productId = `PROD-${formattedNumber}`;

    const sheet = doc.sheetsByIndex[0]; 

    const fallbackSlug = body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const finalPermalink = body.permalink ? body.permalink.toLowerCase().replace(/ /g, '-') : fallbackSlug;

    await sheet.addRow({
      id: productId, 
      name: body.name,
      slug: finalPermalink,
      permalink: finalPermalink,
      price: body.price,
      regular_price: body.regular_price || '',
      category: body.category || 'Uncategorized', 
      brand: body.brand || 'No Brand',
      image: body.image, 
      specifications: body.specifications || '',
      description: body.description || '',
      stock: body.stock || '10',
      variants: body.variants || '',
      is_landing_page: body.is_landing_page || 'FALSE',
      warranty: body.warranty || '',
      primary_variant_name: body.primary_variant_name || 'Option',
      attributes: body.attributes || '',

      // 🌟 নতুন ল্যান্ডিং পেজের ফিল্ডগুলো (lp_hero_image যুক্ত করা হলো)
      lp_hero_image: body.lp_hero_image || '',
      lp_slogan: body.lp_slogan || '',
      lp_headline: body.lp_headline || '',
      lp_features_title: body.lp_features_title || '',
      lp_features_list: body.lp_features_list || '',
      lp_gallery_quote: body.lp_gallery_quote || '',
      lp_fomo_text: body.lp_fomo_text || ''
    });

    return NextResponse.json({ success: true, message: "Product added successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// ৩. পুরাতন প্রোডাক্ট এডিট/আপডেট করার জন্য (PATCH)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[0]; 
    const rows = await sheet.getRows();

    const targetRow = rows.find(row => row.get('id') === body.id);

    if (!targetRow) {
      return NextResponse.json({ success: false, error: "Product not found in Google Sheet!" }, { status: 404 });
    }

    const fallbackSlug = body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const finalPermalink = body.permalink ? body.permalink.toLowerCase().replace(/ /g, '-') : fallbackSlug;

    targetRow.set('name', body.name);
    targetRow.set('slug', finalPermalink);
    targetRow.set('permalink', finalPermalink);
    targetRow.set('price', body.price);
    targetRow.set('regular_price', body.regular_price || '');
    targetRow.set('category', body.category || 'Uncategorized');
    targetRow.set('brand', body.brand || 'No Brand');
    
    if (body.image) {
       targetRow.set('image', body.image);
    }
    
    targetRow.set('specifications', body.specifications || '');
    targetRow.set('description', body.description || '');
    targetRow.set('stock', body.stock || '10');
    targetRow.set('variants', body.variants || '');
    targetRow.set('is_landing_page', body.is_landing_page || 'FALSE');
    targetRow.set('warranty', body.warranty || '');
    targetRow.set('primary_variant_name', body.primary_variant_name || 'Option');
    targetRow.set('attributes', body.attributes || '');

    // 🌟 ল্যান্ডিং পেজের ডেটা আপডেট (lp_hero_image যুক্ত করা হলো)
    if (body.lp_hero_image !== undefined) {
       targetRow.set('lp_hero_image', body.lp_hero_image || '');
    }
    targetRow.set('lp_slogan', body.lp_slogan || '');
    targetRow.set('lp_headline', body.lp_headline || '');
    targetRow.set('lp_features_title', body.lp_features_title || '');
    targetRow.set('lp_features_list', body.lp_features_list || '');
    targetRow.set('lp_gallery_quote', body.lp_gallery_quote || '');
    targetRow.set('lp_fomo_text', body.lp_fomo_text || '');

    await targetRow.save(); // গুগল শিটে সেভ করা

    return NextResponse.json({ success: true, message: "Product updated successfully!" });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// প্রোডাক্ট ডিলিট করার জন্য DELETE রিকোয়েস্ট
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const doc = await getGoogleSheet();
    const sheet = doc.sheetsByIndex[0]; 
    const rows = await sheet.getRows();

    const targetRow = rows.find(row => row.get('id') === id);

    if (targetRow) {
      await targetRow.delete(); 
      return Response.json({ success: true, message: "Product deleted successfully" });
    } else {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Delete Error:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}