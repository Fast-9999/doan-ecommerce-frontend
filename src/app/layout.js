import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // <-- Tui import cái Navbar vô đây nè ní

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cửa Hàng Của Phát 🚀", // Tên hiển thị trên tab trình duyệt
  description: "Đồ án E-Commerce siêu cấp VIP Pro",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        
        {/* Thanh Menu dính chặt ở trên cùng */}
        <Navbar />

        {/* Nội dung các trang (Trang chủ, Giỏ hàng...) sẽ chui vô đây */}
        <main className="grow">{children}</main>

      </body>
    </html>
  );
}
