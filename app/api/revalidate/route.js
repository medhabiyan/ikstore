import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // একটি সিক্রেট টোকেন (পাসওয়ার্ড) চেক করবো, যেন বাহিরের কেউ এই লিঙ্কে হিট করে সাইট হ্যাক করতে না পারে
    if (body.secret !== "amar-secret-token-123") {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // হোমপেজের ক্যাশ ক্লিয়ার করবে
    revalidatePath('/');
    
    // সিঙ্গেল প্রোডাক্ট পেজের ক্যাশ ক্লিয়ার করবে
    revalidatePath('/product/[slug]', 'page'); 
    
    // শপ বা আর্কাইভ পেজের ক্যাশ ক্লিয়ার করবে (ভবিষ্যতের জন্য দিয়ে রাখলাম)
    revalidatePath('/shop'); 

    return NextResponse.json({ success: true, message: 'Cache cleared successfully!', time: Date.now() });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Error revalidating' }, { status: 500 });
  }
}