import { NextResponse } from 'next/server';

// 🌟 ১. সবচেয়ে জরুরি: এই রাউটটিকে সম্পূর্ণ ডায়নামিক করা হলো যাতে কোনো ক্যাশ ধরে না রাখে
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const filename = resolvedParams.filename; 

  if (!filename.endsWith('.html')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const requestedCode = filename.replace('.html', '').trim();

  try {
    const baseUrl = request.nextUrl.origin;

    // 🌟 ২. fetch করার সময় cache: 'no-store' যুক্ত করা হলো
    const res = await fetch(`${baseUrl}/api/settings`, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch settings');
    }

    const data = await res.json();

    // 🌟 ৩. ডাটাবেসের কোড থেকেও স্পেস বা ভুল .html থাকলে সেটা ক্লিন করা হলো
    let savedCode = data.settings?.meta_verification_code || "";
    savedCode = savedCode.replace('.html', '').trim();

    if (savedCode && requestedCode === savedCode) {
      const htmlContent = `${savedCode}`;

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return new NextResponse('Not Found', { status: 404 });

  } catch (error) {
    console.error("Verification Route Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}