import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 lg:py-16 mt-auto border-t-[6px] border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Cột 1: Thông tin Thương hiệu */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-3xl font-black text-white tracking-tight mb-4">
              🚀 Phát<span className="text-orange-500">Shop</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 font-medium">
              Phát Shop - Nơi cung cấp các mặt hàng thời trang, công nghệ xịn xò nhất vũ trụ. Chốt đơn liền tay, rinh ngay giá hời. Giao hàng nhanh tốc độ ánh sáng!
            </p>
            <div className="flex space-x-3 pt-2">
              <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">📘</button>
              <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl hover:bg-pink-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">📸</button>
              <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl hover:bg-red-600 hover:text-white transition-all shadow-lg hover:-translate-y-1">📺</button>
            </div>
          </div>

          {/* Cột 2: Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-sm relative inline-block">
              Hỗ Trợ Khách Hàng
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">Hướng dẫn mua hàng</Link></li>
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">Chính sách đổi trả 7 ngày</Link></li>
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">Chính sách bảo hành VIP</Link></li>
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">Bảo mật thông tin</Link></li>
            </ul>
          </div>

          {/* Cột 3: Danh mục nổi bật */}
          <div>
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-sm relative inline-block">
              Danh Mục Hot
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">🔥 Thời trang nam</Link></li>
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">👟 Giày dép Sneaker</Link></li>
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">🎒 Phụ kiện xịn xò</Link></li>
              <li><Link href="#" className="hover:text-orange-400 hover:translate-x-1 inline-block transition-transform">💻 Đồ công nghệ</Link></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-sm relative inline-block">
              Liên Hệ
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <span>Khu Công Nghệ Cao, Đại học HUTECH, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <span className="hover:text-orange-400 cursor-pointer transition-colors">0123.456.789 (Zalo/Hotline)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <span className="hover:text-orange-400 cursor-pointer transition-colors">contact@phatshop.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Dòng Copyright cuối cùng */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-medium">© {new Date().getFullYear()} Phát Shop. Đồ án E-Commerce. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-slate-800 rounded border border-slate-700 font-bold text-xs text-slate-400">VISA</span>
            <span className="px-3 py-1 bg-slate-800 rounded border border-slate-700 font-bold text-xs text-slate-400">MasterCard</span>
            <span className="px-3 py-1 bg-slate-800 rounded border border-slate-700 font-bold text-xs text-slate-400">MoMo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}