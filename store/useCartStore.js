import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [], // শুরুতে কার্ট খালি থাকবে

      // প্রোডাক্ট কার্টে যোগ করার ফাংশন
      addToCart: (product) => {
        const currentCart = get().cartItems;
        const productUniqueId = product.cartItemId || product.id; 

        const existingItem = currentCart.find((item) => (item.cartItemId || item.id) === productUniqueId);

        if (existingItem) {
          set({
            cartItems: currentCart.map((item) =>
              (item.cartItemId || item.id) === productUniqueId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ cartItems: [...currentCart, { ...product, quantity: 1 }] });
        }
      },

      // কার্ট থেকে নির্দিষ্ট ভেরিয়েন্ট মুছে ফেলার ফাংশন
      removeFromCart: (uniqueId) => {
        set({
          cartItems: get().cartItems.filter((item) => (item.cartItemId || item.id) !== uniqueId),
        });
      },

      // প্রোডাক্টের পরিমাণ কমানোর বা বাড়ানোর ফাংশন
      updateQuantity: (uniqueId, amount) => {
        set({
          cartItems: get().cartItems.map((item) => {
            if ((item.cartItemId || item.id) === uniqueId) {
              const newQuantity = item.quantity + amount;
              return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; 
            }
            return item;
          }),
        });
      },

      // 🌟 ভেরিয়েন্ট এবং দাম আপডেট করার ফাংশন (যেটি মিসিং ছিল)
      updateVariant: (uniqueId, newVariantString, newPrice = null) => {
        set({
          cartItems: get().cartItems.map((item) => {
            if ((item.cartItemId || item.id) === uniqueId) {
              let updatedItem = { ...item, variant: newVariantString };
              if (newPrice !== null && !isNaN(newPrice)) {
                updatedItem.price = newPrice;
              }
              return updatedItem;
            }
            return item;
          }),
        });
      },

      // অর্ডার হওয়ার পর পুরো কার্ট খালি করার ফাংশন
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'fast-ecom-cart', 
    }
  )
);