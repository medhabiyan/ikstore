// lib/paymentConstants.js

export const MFS_PROVIDERS = [
  { id: 'bkash', name: 'বিকাশ (bKash)', ussd: '*247#' },
  { id: 'nagad', name: 'নগদ (Nagad)', ussd: '*167#' },
  { id: 'rocket', name: 'রকেট (Rocket)', ussd: '*322#' },
  { id: 'upay', name: 'উপায় (Upay)', ussd: '*268#' }
];

export const ACCOUNT_TYPES = ['Personal', 'Merchant', 'Agent'];

export const getPaymentInstructions = (providerId, accountType) => {
  const provider = MFS_PROVIDERS.find(p => p.id === providerId);
  if (!provider) return '';

  const name = provider.name;
  const ussd = provider.ussd;

  if (accountType === 'Personal') {
    return `📱 [অ্যাপ ব্যবহারকারীদের জন্য]\n১. আপনার ${name} অ্যাপ থেকে 'Send Money' অপশনে যান।\n২. নিচের নম্বরে মোট বিলের টাকা সেন্ড করুন।\n৩. রেফারেন্স (Reference) হিসেবে আপনার নাম দিন।\n\n📞 [বাটন ফোন/USSD ব্যবহারকারীদের জন্য]\n১. মোবাইল থেকে ${ussd} ডায়াল করুন।\n২. 'Send Money' সিলেক্ট করে নিচের নম্বরটি দিন।\n৩. টাকার পরিমাণ এবং রেফারেন্স দিয়ে পেমেন্ট সম্পন্ন করুন।\n\n📌 টাকা পাঠানো শেষে নিচের বক্সে আপনার নম্বর এবং TrxID দিন।`;
  } 
  
  if (accountType === 'Merchant') {
    return `📱 [অ্যাপ ব্যবহারকারীদের জন্য]\n১. আপনার ${name} অ্যাপ থেকে 'Make Payment' বা 'Payment' অপশনে যান।\n২. নিচের নম্বরে মোট বিলের টাকা পেমেন্ট করুন।\n\n📞 [বাটন ফোন/USSD ব্যবহারকারীদের জন্য]\n১. মোবাইল থেকে ${ussd} ডায়াল করুন।\n২. 'Payment' সিলেক্ট করে নিচের নম্বরটি দিন।\n৩. টাকার পরিমাণ দিয়ে পেমেন্ট সম্পন্ন করুন।\n\n📌 টাকা পাঠানো শেষে নিচের বক্সে আপনার নম্বর এবং TrxID দিন।`;
  } 
  
  if (accountType === 'Agent') {
    return `আপনার ${name} অ্যাপ থেকে অথবা ${ussd} ডায়াল করে 'Cash Out' অপশনের মাধ্যমে নিচের নম্বরে টাকা পাঠান। \n\n📌 টাকা পাঠানো শেষে আপনার নম্বর এবং TrxID নিচের বক্সে দিন।`;
  }

  return '';
};