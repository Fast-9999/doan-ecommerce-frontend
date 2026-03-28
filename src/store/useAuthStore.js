import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Mặc định chưa đăng nhập
      token: null,

      // Khi đăng nhập thành công thì nạp data vô đây
      login: (userData, tokenData) => set({ user: userData, token: tokenData }),

      // Khi đăng xuất thì xóa trắng
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'phat-shop-auth', // Lưu LocalStorage tự động
    }
  )
);

export default useAuthStore;