"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Noto_Sans_Bengali } from 'next/font/google';
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";

// --- Tab Components ---
import OverviewTab from "../../components/admin/OverviewTab";
import OrdersTab from "../../components/admin/OrdersTab";
import ProductsTab from "../../components/admin/ProductsTab";
import MessagesTab from "../../components/admin/MessagesTab";
import CategoriesTab from "../../components/admin/CategoriesTab";
import BrandsTab from "../../components/admin/BrandsTab";
import SettingsTab from "../../components/admin/SettingsTab";

// 🌟 নতুন পেমেন্ট সেটিংস এবং ল্যান্ডিং পেজ কম্পোনেন্ট ইমপোর্ট
import PaymentSettingsTab from "../../components/admin/PaymentSettingsTab"; 
import LandingPageList from "../../components/admin/LandingPageList"; 

// ফন্ট সেটআপ
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

function AdminDashboardContent() {
  const searchParams = useSearchParams();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ড্যাশবোর্ড স্টেটস
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [settingsData, setSettingsData] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // 🌟 পেমেন্ট সেটিংসের জন্য আলাদা স্টেট
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);

    const checkAuth = localStorage.getItem("isAdminLoggedIn");
    if (checkAuth === "true") setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, [searchParams]);

  // ডেটা ফেচিং ফাংশনসমূহ
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const formattedOrders = data.orders.map(order => ({
          ...order,
          status: (!order.status || order.status === 'Pending') ? 'Pending Payment' : order.status
        }));
        setOrders(formattedOrders.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setProducts(data.products.reverse());
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch('/api/messages', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const res = await fetch('/api/brands', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setBrands(data.brands);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setSettingsData(data.settings);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // 🌟 পেমেন্ট সেটিংস আলাদাভাবে ফেচ করার ফাংশন
  const fetchPaymentSettings = async () => {
    setIsLoadingPayment(true);
    try {
      const res = await fetch('/api/payment-settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setPaymentSettings(data.settings);
    } catch (error) {
      console.error("Failed to fetch payment settings", error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
      fetchMessages();
      fetchCategories();
      fetchBrands();
      fetchSettings();
      fetchPaymentSettings(); // 🌟 নতুন এপিআই থেকে ডেটা লোড
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(orders.map(order => order.order_id === orderId ? { ...order, status: newStatus } : order));
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      const result = await res.json();
      if (!result.success) {
        alert("সমস্যা হয়েছে: " + result.error);
        fetchOrders(); 
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর! আবার চেষ্টা করুন।");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Imdad@Store#2027!") {
      setIsAuthenticated(true);
      localStorage.setItem("isAdminLoggedIn", "true");
    } else {
      alert("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAdminLoggedIn");
  };

  if (isCheckingAuth) return null;

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 relative overflow-hidden ${notoSansBengali.className}`}>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 translate-y-1/2 -translate-x-1/4"></div>

        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 w-full max-w-md border border-white relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8A1538] rounded-2xl mb-6 shadow-lg shadow-red-900/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-[#3B3433] tracking-tight mb-2">IK Store<span className="text-[#8A1538]">.</span></h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">অ্যাডমিন প্যানেল লগইন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-[#3B3433] uppercase tracking-wider ml-1">সিকিউরিটি পিন / পাসওয়ার্ড</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#8A1538]/10 focus:border-[#8A1538] outline-none transition-all text-[#3B3433] font-black text-xl tracking-widest placeholder:tracking-normal placeholder:text-gray-300"
              />
            </div>
            <button type="submit" className="w-full bg-[#8A1538] text-white py-5 rounded-2xl font-black text-lg tracking-wide hover:bg-[#6e112d] transition-all duration-300 shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 active:scale-[0.98]">
              লগইন করুন
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex bg-[#FDFDFD] ${notoSansBengali.className}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newOrdersCount={orders.filter(o => o.status === "Pending Payment").length}
        handleLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen w-full">
        <AdminHeader activeTab={activeTab} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="p-4 md:p-8 flex-1 w-full max-w-[100vw]">
          {activeTab === "overview" && <OverviewTab orders={orders} products={products} isLoading={isLoading} />}
          {activeTab === "orders" && <OrdersTab orders={orders} handleStatusChange={handleStatusChange} isLoading={isLoading} />}
          {activeTab === "products" && <ProductsTab products={products} fetchProducts={fetchProducts} isLoading={isLoading} />}
          {activeTab === "messages" && <MessagesTab messages={messages} isLoading={isLoadingMessages} />}
          {activeTab === "categories" && <CategoriesTab categories={categories} fetchCategories={fetchCategories} isLoading={isLoadingCategories} />}
          {activeTab === "brands" && <BrandsTab brands={brands} fetchBrands={fetchBrands} isLoading={isLoadingBrands} />}
          {activeTab === "settings" && <SettingsTab settingsData={settingsData} fetchSettings={fetchSettings} isLoading={isLoadingSettings} />}
          
          {/* 🌟 পেমেন্ট সেটিংস ট্যাব রেন্ডার */}
          {activeTab === "payment-settings" && (
            <PaymentSettingsTab 
              settingsData={paymentSettings} 
              fetchSettings={fetchPaymentSettings} 
              isLoading={isLoadingPayment} 
            />
          )}

          {/* ল্যান্ডিং পেজ লিস্ট */}
          {activeTab === "landing-pages" && <LandingPageList />}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-10 h-10 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}