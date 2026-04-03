import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 pt-20 pb-8 mt-auto border-t border-slate-900 overflow-hidden font-sans">

      {/* 🚀 HIỆU ỨNG ÁNH SÁNG CHÌM (BACKGROUND GLOW) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* CỘT 1: THƯƠNG HIỆU (Chiếm 4 cột) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <div className="text-3xl font-black tracking-tight flex items-center gap-1 group">
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">2FAST</span>
                <span className="text-white">.SHOP</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 font-medium pr-4">
              Hệ sinh thái mua sắm thượng lưu dành riêng cho Chủ Tịch. Trải nghiệm săn sale tốc độ cao, chốt đơn không độ trễ, giao hàng nhanh như chớp.
            </p>

            {/* Mạng Xã Hội bằng SVG xịn xò */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-lg hover:-translate-y-1 group">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all shadow-lg hover:-translate-y-1 group">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg hover:-translate-y-1 group">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M21.582 6.186a2.506 2.506 0 00-1.762-1.766C18.265 4 12 4 12 4s-6.264 0-7.82.42a2.505 2.505 0 00-1.762 1.766C2 7.74 2 12 2 12s0 4.26.418 5.814a2.506 2.506 0 001.762 1.766C5.735 20 12 20 12 20s6.265 0 7.82-.42a2.505 2.505 0 001.762-1.766C22 16.26 22 12 22 12s0-4.26-.418-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* CỘT 2 & 3: MENU ĐIỀU HƯỚNG (Chiếm 4 cột) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-black mb-6 uppercase tracking-widest text-xs relative">
                Hỗ Trợ Khách Hàng
              </h3>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><Link href="#" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Tra cứu đơn hàng</Link></li>
                <li><Link href="#" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Chính sách đổi trả</Link></li>
                <li><Link href="#" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Bảo hành VIP Care</Link></li>
                <li><Link href="#" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Bảo mật thông tin</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-6 uppercase tracking-widest text-xs relative">
                Khám Phá
              </h3>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><Link href="/products" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Sản phẩm mới</Link></li>
                <li><Link href="/products" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Top bán chạy</Link></li>
                <li><Link href="#" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Thời trang nam</Link></li>
                <li><Link href="#" className="hover:text-blue-500 hover:translate-x-1.5 inline-block transition-all">Đồ công nghệ</Link></li>
              </ul>
            </div>
          </div>

          {/* CỘT 4: LIÊN HỆ & NEWSLETTER (Chiếm 4 cột) */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-white font-black mb-6 uppercase tracking-widest text-xs relative">
              Nhận Voucher Độc Quyền
            </h3>

            {/* Form Đăng ký nhận tin */}
            <form className="flex w-full rounded-xl bg-slate-900 border border-slate-800 p-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <input
                type="email"
                placeholder="Nhập email của Sếp..."
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-blue-500 transition-colors"
              >
                ĐĂNG KÝ
              </button>
            </form>

            <ul className="space-y-4 text-sm font-medium text-slate-400 pt-2">
              <li className="flex items-start gap-3 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-blue-500 transition-colors mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span className="leading-relaxed">Khu Công Nghệ Cao, Đại học HUTECH, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-blue-500 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.273-3.973-6.869-6.869l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                <span className="group-hover:text-blue-400 transition-colors">0123.456.789 (Hotline 24/7)</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-blue-500 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <span className="group-hover:text-blue-400 transition-colors">chutich@2fast.shop</span>
              </li>
            </ul>
          </div>

        </div>

        {/* DÒNG BẢN QUYỀN CUỐI CÙNG (COPYRIGHT) */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500 font-medium text-center md:text-left">
            © {new Date().getFullYear()} <span className="text-slate-300 font-bold">2FAST.SHOP</span>. Đồ án E-Commerce - Designed with 💻
          </p>

          {/* Cụm Logo Thanh Toán */}
          <div className="flex gap-3">
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center">
              <span className="font-black text-[10px] text-slate-400 italic tracking-wider">VISA</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/80 mix-blend-screen"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500/80 -ml-2 mix-blend-screen"></div>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center">
              <span className="font-black text-[10px] text-pink-500 tracking-wider">MoMo</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center">
              <span className="font-black text-[10px] text-blue-500 tracking-wider">ZaloPay</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}