import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Mặc định chưa đăng nhập
      token: null,

      // 🚀 CÚ FIX CỘI NGUỒN: Chuẩn hóa data ngay lúc vừa bước qua cửa!
      login: (rawUserData, rawToken) => {
        let cleanUser = rawUserData;
        
        // Lột vỏ: Nếu Backend bọc data trong chữ "data" hoặc "user" thì lôi nó ra
        if (cleanUser?.data) cleanUser = cleanUser.data;
        if (cleanUser?.user) cleanUser = cleanUser.user;

        // Bắt luôn cái Token phòng hờ nó nằm lẫn bên trong cục user
        let cleanToken = rawToken || cleanUser?.token || cleanUser?.accessToken || null;

        // Dọn dẹp cục user cho nhẹ máy, bỏ token ra khỏi user nếu có
        const finalUser = { ...cleanUser };
        delete finalUser.token;
        delete finalUser.accessToken;

        set({ user: finalUser, token: cleanToken });
      },

      // Khi đăng xuất thì xóa trắng
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'phat-shop-auth', // Lưu LocalStorage tự động
    }
  )
);

export default useAuthStore;