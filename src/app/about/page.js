import Link from "next/link";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Banner Giới thiệu */}
      <div className="bg-slate-900 text-white py-20 text-center border-b-8 border-blue-600">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
          VỀ <span className="text-blue-500">CHÚNG TÔI</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto px-4 text-lg">
          Hành trình từ một ý tưởng nhỏ đến siêu thị E-commerce VIP Pro mang tên FAST.SHOP.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grow w-full">
        
        {/* Section 1: Câu chuyện thương hiệu */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-16 flex flex-col md:flex-row">
          <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <h2 className="text-sm font-black text-blue-600 tracking-widest uppercase mb-3">Câu Chuyện Của Sếp</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
              Khởi nguồn từ đam mê <br /> &quot;Chốt Đơn&quot;
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed mb-6 text-justify">
              Được thành lập vào một ngày đẹp trời, FAST.SHOP ra đời với một sứ mệnh duy nhất: Mang đến cho khách hàng những sản phẩm chất lượng đỉnh cao với mức giá &quot;hạt dẻ&quot; nhất. Chúng tôi không chỉ bán hàng, chúng tôi bán sự tự tin và phong cách cho bạn.
            </p>
            <p className="text-slate-600 font-medium leading-relaxed text-justify">
              Với đội ngũ admin chạy bằng cơm luôn túc trực 24/7, mọi đơn hàng của bạn sẽ được đóng gói tỉ mỉ và giao đi với tốc độ của một cơn lốc. Tại FAST.SHOP, khách hàng không chỉ là thượng đế, mà còn là những người anh em chí cốt!
            </p>
          </div>
          <div className="md:w-1/2 bg-slate-100 relative min-h-75">
            {/* Ảnh minh họa (Placeholder) */}
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop" 
              alt="Câu chuyện FAST.SHOP"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Section 2: Giá trị cốt lõi (Grid 3 cột) */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Giá Trị Cốt Lõi</h2>
          <p className="text-slate-500 font-medium mb-12">Những điều làm nên thương hiệu của chúng tôi</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                💎
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Chất Lượng VIP</h3>
              <p className="text-slate-500 font-medium">Sản phẩm được tuyển chọn kỹ lưỡng, cam kết chính hãng 100%. Lỗi 1 đổi 1 trong phút mốt.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                🚀
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Giao Hàng Siêu Tốc</h3>
              <p className="text-slate-500 font-medium">Chốt đơn là ship! Đội ngũ shipper vặn ga hết cỡ để đưa món đồ yêu thích đến tay bạn nhanh nhất.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                🎧
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Hỗ Trợ 24/7</h3>
              <p className="text-slate-500 font-medium">Đội ngũ CSKH luôn sẵn sàng lắng nghe và giải quyết mọi tâm tư tình cảm của Chủ Tịch bất kể ngày đêm.</p>
            </div>

          </div>
        </div>

        {/* Section 3: Call to Action (Mời mua hàng) */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-black text-white mb-4">Bạn đã sẵn sàng nâng tầm phong cách?</h2>
          <p className="text-slate-300 font-medium mb-8 max-w-xl mx-auto">
            Đừng bỏ lỡ những siêu phẩm đang làm mưa làm gió trên thị trường. Bấm vào nút bên dưới để bắt đầu hành trình săn sale ngay hôm nay!
          </p>
          <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
            MÚC ĐỒ NGAY
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}