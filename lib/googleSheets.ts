import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// সার্ভিস অ্যাকাউন্ট দিয়ে অথেনটিকেশন সেটআপ
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

// গুগল শিটের ডকুমেন্ট ইনিশিয়ালাইজ করা
export const getGoogleSheet = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);
  await doc.loadInfo(); // শিটের বেসিক ইনফো লোড করবে
  return doc;
};