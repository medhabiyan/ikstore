import Link from "next/link";

export const metadata = {
  title: "Terms of Service | IK Store",
  description: "Terms and conditions for using IK Store services.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="border-b border-gray-100 pb-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#3B3433] tracking-tight mb-4">Terms of Service</h1>
            <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate max-w-none text-gray-600 space-y-6">
            <p>
              IK Store-এ আপনাকে স্বাগতম। আমাদের ওয়েবসাইট ব্যবহার বা কোনো পণ্য ক্রয় করার মাধ্যমে আপনি নিচের শর্তাবলি (Terms and Conditions) মেনে নিচ্ছেন বলে গণ্য হবে। অনুগ্রহ করে শর্তগুলো মনোযোগ দিয়ে পড়ুন।
            </p>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">১. সাধারণ শর্তাবলি</h3>
            <p>
              এই ওয়েবসাইটটি শুধুমাত্র আইনসম্মত উদ্দেশ্যে ব্যবহার করা যাবে। কোনো অবৈধ কার্যকলাপ বা ওয়েবসাইটের ক্ষতি সাধনের চেষ্টা সম্পূর্ণ নিষিদ্ধ। আমরা যেকোনো সময় পূর্ব নোটিশ ছাড়া এই শর্তাবলি আপডেট করার অধিকার সংরক্ষণ করি।
            </p>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">২. পণ্যের মূল্য এবং বিবরণ</h3>
            <p>
              আমরা চেষ্টা করি পণ্যের সঠিক বিবরণ ও ছবি প্রদান করার। তবে স্ক্রিন রেজোলিউশন বা লাইটিংয়ের কারণে পণ্যের আসল রঙের সামান্য পার্থক্য হতে পারে। কোনো পূর্ব নোটিশ ছাড়াই ওয়েবসাইটের যেকোনো পণ্যের মূল্য পরিবর্তন করার অধিকার আমাদের রয়েছে।
            </p>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">৩. অর্ডার এবং পেমেন্ট</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>অর্ডার প্লেস করার পর স্টক থাকা সাপেক্ষে তা কনফার্ম করা হবে।</li>
              <li>স্টক আউট হয়ে গেলে আমরা অর্ডারটি বাতিল করার বা বিকল্প পণ্যের প্রস্তাব দেওয়ার অধিকার রাখি।</li>
              <li>ক্যাশ অন ডেলিভারি (COD) বা অনলাইন পেমেন্ট—যেকোনো মাধ্যমেই অর্ডার করা যাবে।</li>
            </ul>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">৪. ডেলিভারি পলিসি</h3>
            <p>
              ঢাকা শহরের ভেতরে সাধারণত ২-৩ কর্মদিবস এবং ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়। তবে অনাকাঙ্ক্ষিত কোনো কারণ বা আবহাওয়া জনিত সমস্যায় এই সময়সীমা পরিবর্তিত হতে পারে।
            </p>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">৫. রিটার্ন ও রিফান্ড</h3>
            <p>
              আমাদের একটি পরিষ্কার রিটার্ন ও রিফান্ড পলিসি রয়েছে। পণ্য হাতে পাওয়ার পর যদি কোনো ত্রুটি বা সমস্যা দেখতে পান, তবে সর্বোচ্চ ২৪ ঘণ্টার মধ্যে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে হবে। বিস্তারিত জানতে আমাদের রিটার্ন পলিসি দেখুন।
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}