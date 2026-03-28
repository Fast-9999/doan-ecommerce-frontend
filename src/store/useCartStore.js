import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Chiêu 1: Thêm đồ vô giỏ (Cũ)
      addToCart: (product) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find(item => item._id === product._id);
        if (existingItem) {
          set({
            cart: currentCart.map(item => 
              item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            )
          });
        } else {
          set({ cart: [...currentCart, { ...product, quantity: 1 }] });
        }
      },

      // MỚI - Chiêu 3: Xóa hẳn 1 món khỏi giỏ
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item._id !== productId) });
      },

      // MỚI - Chiêu 4: Tăng / Giảm số lượng (+ / -)
      updateQuantity: (productId, amount) => {
        set({
          cart: get().cart.map(item => {
            if (item._id === productId) {
              const newQuantity = item.quantity + amount;
              // Bắt lỗi: Không cho số lượng tụt xuống dưới 1
              return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
            }
            return item;
          })
        });
      },

      // Chiêu 2: Đếm tổng số món (Cũ)
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      // MỚI - Chiêu 5: Quét sạch giỏ hàng sau khi chốt đơn (Dành cho trang Checkout)
      clearCart: () => {
        set({ cart: [] });
      }
    }),
    {
      name: 'phat-shop-cart',
    }
  )
);

export default useCartStore;