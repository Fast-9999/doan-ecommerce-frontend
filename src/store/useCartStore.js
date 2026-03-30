import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // 🚀 Chiêu 1: Thêm đồ vô giỏ (Đã bọc thép ID)
      addToCart: (product) => {
        const currentCart = get().cart;
        // Bắt mọi thể loại ID
        const targetId = product._id || product.id; 
        
        const existingItem = currentCart.find(item => (item._id || item.id) === targetId);
        
        if (existingItem) {
          set({
            cart: currentCart.map(item => 
              (item._id || item.id) === targetId ? { ...item, quantity: item.quantity + 1 } : item
            )
          });
        } else {
          // Lưu luôn cả _id để lúc Checkout gọi cho dễ
          set({ cart: [...currentCart, { ...product, _id: targetId, quantity: 1 }] });
        }
      },

      // 🚀 Chiêu 3: Xóa hẳn 1 món khỏi giỏ (Bọc thép)
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => (item._id || item.id) !== productId) });
      },

      // 🚀 Chiêu 4: Tăng / Giảm số lượng (Bọc thép)
      updateQuantity: (productId, amount) => {
        set({
          cart: get().cart.map(item => {
            if ((item._id || item.id) === productId) {
              const newQuantity = item.quantity + amount;
              return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
            }
            return item;
          })
        });
      },

      // Chiêu 2: Đếm tổng số món
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      // Chiêu 6: Tính Tổng Tiền Giỏ Hàng
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      // Chiêu 5: Quét sạch giỏ hàng 
      // (Đã được gọi bên Navbar lúc Đăng Xuất và bên Checkout lúc chốt đơn thành công)
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