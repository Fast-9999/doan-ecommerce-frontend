import Link from "next/link";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">

      {/* 🚀 HERO BANNER SIÊU CẤP VIP PRO */}
      <div className="relative bg-slate-900 pt-32 pb-40 overflow-hidden">
        {/* Chữ chìm Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/5 whitespace-nowrap select-none pointer-events-none tracking-tighter">
          2FAST.SHOP
        </div>

        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-6 backdrop-blur-md shadow-lg">
            Khởi Nguồn Đam Mê
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            CÂU CHUYỆN VỀ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ĐẾ CHẾ MUA SẮM</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Hành trình từ một ý tưởng táo bạo trong phòng trọ sinh viên đến nền tảng E-commerce chuẩn "Thượng Lưu" dành riêng cho Chủ Tịch.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 grow w-full -mt-20 relative z-20">

        {/* 🚀 SECTION 1: CÂU CHUYỆN THƯƠNG HIỆU */}
        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-slate-100 overflow-hidden mb-24 flex flex-col lg:flex-row group">
          <div className="lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
              <h2 className="text-xs font-black text-blue-600 tracking-widest uppercase">Từ Số 0 Đến Số 1</h2>
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
              Khởi nguồn từ đam mê <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">"Chốt Đơn"</span>
            </h3>

            <div className="space-y-6 text-slate-500 font-medium leading-relaxed text-lg text-justify">
              <p>
                Được thành lập vào một ngày đẹp trời, <strong className="text-slate-800">2FAST.SHOP</strong> ra đời với một sứ mệnh duy nhất: Mang đến cho khách hàng những siêu phẩm chất lượng đỉnh cao với mức giá "hạt dẻ" nhất. Chúng tôi không chỉ bán hàng, chúng tôi bán sự tự tin và định hình phong cách cho bạn.
              </p>
              <p>
                Với đội ngũ Admin "chạy bằng cơm" luôn túc trực 24/7, mọi đơn hàng của Sếp sẽ được đóng gói bằng cả trái tim và giao đi với tốc độ của một cơn lốc. Tại <strong className="text-slate-800">2FAST.SHOP</strong>, khách hàng không chỉ là thượng đế, mà còn là những người anh em chí cốt!
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 bg-slate-50 relative min-h-[400px] lg:min-h-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 z-10 mix-blend-multiply"></div>
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop"
              alt="Câu chuyện FAST.SHOP"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
          </div>
        </div>

        {/* 🚀 SECTION 2: GIÁ TRỊ CỐT LÕI (CARDS) */}
        <div className="mb-24">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-sm font-black text-blue-600 tracking-widest uppercase mb-4">DNA Của Chúng Tôi</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Giá Trị Cốt Lõi</h3>
            <p className="text-slate-500 font-medium text-lg">Những nguyên tắc vàng làm nên thương hiệu và sự tin tưởng tuyệt đối từ hàng ngàn Chủ Tịch trên khắp cả nước.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1 */}
            <div className="bg-white p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] transition-all duration-300 group">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                💎
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Chất Lượng VIP</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Sản phẩm được tuyển chọn vô cùng khắt khe, cam kết chính hãng 100%. Lỗi 1 đổi 1 trong phút mốt, không lằng nhằng.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-purple-200 hover:shadow-[0_20px_40px_rgba(147,51,234,0.08)] transition-all duration-300 group">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                🚀
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Giao Hàng Xuyên Tốc</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Chốt đơn là gói hàng! Đội ngũ shipper vặn ga hết cỡ, xé gió để đưa món đồ yêu thích đến tận tay Chủ Tịch nhanh nhất.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-rose-200 hover:shadow-[0_20px_40px_rgba(225,29,72,0.08)] transition-all duration-300 group">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                🎧
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Hỗ Trợ 24/7</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Đội ngũ CSKH chuyên nghiệp luôn sẵn sàng lắng nghe và giải quyết mọi tâm tư tình cảm của Sếp bất kể ngày hay đêm.
              </p>
            </div>

          </div>
        </div>

        {/* 🚀 SECTION 3: CALL TO ACTION (CTA) CUỐI TRANG */}
        <div className="relative bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          {/* Background Gradient rực rỡ */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-rose-600/20 opacity-50 mix-blend-screen"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full blur-[100px] opacity-40"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              Sẵn Sàng Nâng Tầm <br />
              Phong Cách Cùng 2FAST?
            </h2>
            <p className="text-slate-300 font-medium mb-10 text-lg leading-relaxed">
              Đừng bỏ lỡ những siêu phẩm đang làm mưa làm gió trên thị trường. Cơ hội trở thành người dẫn đầu xu hướng đang nằm trong tay bạn.
            </p>
            <Link href="/products" className="inline-flex items-center justify-center bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:bg-slate-50 gap-3 group">
              MÚC ĐỒ NGAY
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}