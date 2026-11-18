import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | IK Store",
  description: "Learn how IK Store protects and uses your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="border-b border-gray-100 pb-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#3B3433] tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate max-w-none text-gray-600 space-y-6">
            <p>
              IK Store ("আমরা", "আমাদের", বা "আমাদেরকে") আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। 
              আপনি যখন আমাদের ওয়েবসাইট ব্যবহার করেন, তখন আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি, তা এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে।
            </p>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">১. আমরা কী ধরনের তথ্য সংগ্রহ করি?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ব্যক্তিগত তথ্য:</strong> নাম, ইমেইল ঠিকানা, ফোন নম্বর, শিপিং এবং বিলিং অ্যাড্রেস।</li>
              <li><strong>অ্যাকাউন্ট তথ্য:</strong> ইউজারনেম, পাসওয়ার্ড এবং আপনার অর্ডার হিস্ট্রি।</li>
              <li><strong>ডিভাইস তথ্য:</strong> আইপি (IP) অ্যাড্রেস, ব্রাউজারের ধরন, এবং ওয়েবসাইটের ব্যবহার সংক্রান্ত ডেটা।</li>
            </ul>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">২. আমরা কেন তথ্য ব্যবহার করি?</h3>
            <p>আমরা সংগৃহীত তথ্যগুলো নিচের কাজগুলোতে ব্যবহার করে থাকি:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>অর্ডার প্রসেস এবং ডেলিভারি করার জন্য।</li>
              <li>কাস্টমার সাপোর্ট প্রদান এবং আপনার যেকোনো জিজ্ঞাসার উত্তর দেওয়ার জন্য।</li>
              <li>ওয়েবসাইটের পারফরম্যান্স উন্নত এবং ইউজার এক্সপেরিয়েন্স ভালো করার জন্য।</li>
              <li>প্রয়োজনীয় আপডেট এবং প্রোমোশনাল অফার (আপনার সম্মতি সাপেক্ষে) পাঠানোর জন্য।</li>
            </ul>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">৩. থার্ড পার্টির সাথে তথ্য শেয়ার</h3>
            <p>
              আমরা আপনার ব্যক্তিগত তথ্য কোনো থার্ড পার্টির কাছে বিক্রি বা ভাড়া দিই না। তবে সার্ভিস প্রদানের সুবিধার্থে (যেমন: কুরিয়ার সার্ভিস বা পেমেন্ট গেটওয়ে) আমরা প্রয়োজনীয় তথ্য শেয়ার করতে পারি। এই থার্ড পার্টিগুলোও তথ্য সুরক্ষিত রাখতে বাধ্য।
            </p>

            <h3 className="text-xl font-bold text-[#3B3433] mt-8 mb-4">৪. ডেটা সিকিউরিটি</h3>
            <p>
              আপনার তথ্য সুরক্ষিত রাখতে আমরা স্ট্যান্ডার্ড এনক্রিপশন এবং সিকিউরিটি প্রোটোকল ব্যবহার করি। তবে মনে রাখবেন, ইন্টারনেটে ১০০% সুরক্ষিত কোনো পদ্ধতি নেই, তাই আমরা সম্পূর্ণ নিশ্চয়তা দিতে পারি না।
            </p>

            <div className="mt-12 p-6 bg-[#F6F4EB] rounded-2xl border border-gray-200">
              <h4 className="font-bold text-[#3B3433] mb-2">যোগাযোগ করুন</h4>
              <p className="text-sm">এই পলিসি নিয়ে আপনার কোনো প্রশ্ন থাকলে আমাদের সাথে <Link href="/contact" className="text-[#8A1538] font-bold hover:underline">যোগাযোগ</Link> করতে পারেন।</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}