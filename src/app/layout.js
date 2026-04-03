import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import ChatBubble from "../components/ChatBubble"; // 🚀 BỔ SUNG: Gọi Bong bóng chat vào đây
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FAST.SHOP 🚀 | Chốt Đơn Siêu Tốc", // Tên hiển thị trên tab trình duyệt
  description: "Đồ án E-Commerce siêu cấp VIP Pro của Chủ Tịch Phát. Mua sắm thả ga, không lo về giá!",
  // Thêm cái này để gửi link qua Zalo/FB nó hiện thẻ đẹp trai
  openGraph: {
    title: 'FAST.SHOP 🚀 | Chốt Đơn Siêu Tốc',
    description: 'Đồ án E-Commerce siêu cấp VIP Pro. Mua sắm thả ga!',
    siteName: 'FAST.SHOP',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi" // 🇻🇳 Khẳng định chủ quyền tiếng Việt
      data-scroll-behavior="smooth" // 🚀 Bùa chống cảnh báo vàng của Next.js
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-200 selection:text-blue-900">
        
        {/* Thanh Menu dính chặt ở trên cùng */}
        <Navbar />

        {/* Nội dung các trang (Trang chủ, Giỏ hàng...) sẽ chui vô đây */}
        <main className="grow flex flex-col">{children}</main>

        {/* 🚀 XUẤT HIỆN Ở GÓC PHẢI DƯỚI CỦA TẤT CẢ CÁC TRANG */}
        <ChatBubble />
        <Toaster position="bottom-right" reverseOrder={false} />

      </body>
    </html>
  );
}
