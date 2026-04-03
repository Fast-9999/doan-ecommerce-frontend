"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import Footer from "../../components/Footer";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuthStore();
  const { cart, getCartTotal, clearCart } = useCartStore();

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "COD"
  });

  // 🚀 LẤY ĐÚNG SỐ TIỀN VOUCHER TỪ URL TRUYỀN QUA (Không dùng % nữa)
  const discountAmount = Number(searchParams.get("discountAmount")) || 0;

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.username || user.name || user.data?.username || user.data?.name || ""
      }));
    }
  }, [user]);

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + " VNĐ";

  const shippingFee = 30000;
  const subTotal = getCartTotal();

  // Chặn trường hợp tiền giảm lớn hơn tổng tiền (Dù bên cart đã chặn nhưng an toàn là trên hết)
  const safeDiscountAmount = discountAmount > subTotal ? subTotal : discountAmount;

  // 🚀 TÍNH TỔNG CỘNG CHUẨN XÁC
  const totalAmount = subTotal - safeDiscountAmount + (cart.length > 0 ? shippingFee : 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống trơn kìa ní ơi! Mua gì đi rồi hẵng chốt đơn!");
      router.push("/");
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Điền thiếu thông tin giao hàng rồi Chủ Tịch ơi!");
      return;
    }

    try {
      setLoading(true);

      const orderItemsData = cart.map(item => ({
        product: item._id,
        name: item.title,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }));

      // ==========================================
      // BƯỚC 1: LẤY ID THẬT CỦA USER
      // ==========================================
      let realUserId = user?._id || user?.id || user?.userId || user?.data?._id || user?.data?.id;
      let currentToken = user?.token || user?.accessToken;

      if (!currentToken) {
        currentToken = localStorage.getItem("token");
      }

      if (!realUserId && currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          realUserId = payload._id || payload.id || payload.userId;
        } catch (error) {
          console.log("Token không hợp lệ để bẻ khóa.");
        }
      }

      if (!realUserId) {
        realUserId = "64a5462f086d74c9e772b804"; // ID ảo cứu cánh
      }

      // ==========================================
      // BƯỚC 2: TẠO ĐƠN HÀNG
      // ==========================================
      const orderPayload = {
        user: realUserId,
        userId: realUserId,
        items: orderItemsData,
        orderItems: orderItemsData,
        fullName: formData.fullName,
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        shippingAddress: {
          fullName: formData.fullName,
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: "Hồ Chí Minh",
          postalCode: "700000",
          country: "Việt Nam"
        },
        paymentMethod: formData.paymentMethod,
        paymentResult: {
          id: "COD_TRANSACTION_" + Date.now(),
          status: "pending",
          update_time: new Date().toISOString(),
          email_address: user?.email || user?.data?.email || "guest@phatshop.com"
        },
        itemsPrice: subTotal,
        taxPrice: 0,
        shippingPrice: shippingFee,
        totalAmount: totalAmount,
        totalPrice: totalAmount,
        isPaid: false,
        isDelivered: false
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(currentToken && { Authorization: `Bearer ${currentToken}` })
        }
      };

      // Gọi API tạo đơn hàng
      await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/orders", orderPayload, config);

      // ==========================================
      // 🚀 BƯỚC 3: TRỪ KHO TỰ ĐỘNG
      // ==========================================
      console.log("🛠️ Đơn hàng thành công, bắt đầu gọi thủ kho để trừ số lượng...");

      for (const item of cart) {
        try {
          await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/inventories/decrease-stock", {
            product: item._id,
            quantity: item.quantity
          });
          console.log(`✅ Đã trừ kho thành công: ${item.quantity} cái [${item.title}]`);
        } catch (inventoryErr) {
          console.error(`⚠️ Lỗi khi trừ kho món [${item.title}]:`, inventoryErr.response?.data?.message || inventoryErr.message);
        }
      }

      // ==========================================
      // BƯỚC 4: DỌN DẸP & ĐIỀU HƯỚNG
      // ==========================================
      toast.success("🎉 CHỐT ĐƠN THÀNH CÔNG! Hàng sẽ về bản trong vài ngày tới!");

      clearCart();
      router.push("/history");

    } catch (err) {
      console.error("Lỗi đặt hàng chi tiết:", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message || "Lỗi bí ẩn";
      toast.error(`❌ Lỗi rồi Chủ Tịch ơi! Backend nó chê nè:\n\n👉 "${backendError}"`);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      <div className="bg-slate-900 text-white py-6 shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform">
            2FAST<span className="text-blue-500">.</span>SHOP
            <span className="text-slate-400 font-medium text-lg ml-2 border-l border-slate-600 pl-4 hidden sm:inline-block tracking-widest uppercase">Thanh Toán</span>
          </Link>
          <Link href="/cart" className="text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grow relative">

        {cart.length === 0 ? (
          <div className="bg-white rounded-4xl shadow-sm p-16 md:p-24 text-center border border-slate-100 max-w-2xl mx-auto mt-10">
            <div className="text-7xl md:text-8xl mb-6 grayscale opacity-30 drop-shadow-sm">🛒</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Giỏ hàng trống rỗng!</h2>
            <p className="text-slate-500 mb-10 font-medium">Ní chưa chọn món nào cả, ra ngoài lựa vài món đồ xịn xò đi!</p>
            <Link href="/products" className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest text-sm inline-block">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            <div className="lg:w-2/3 space-y-8">

              <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10"></div>
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                  <span className="text-orange-500 text-3xl">📍</span> Thông Tin Nhận Hàng
                </h2>
                <form className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Họ và Tên <span className="text-red-500">*</span></label>
                      <input
                        type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold bg-slate-50 focus:bg-white transition-colors"
                        placeholder="Nhập tên người nhận" required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                      <input
                        type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold bg-slate-50 focus:bg-white transition-colors"
                        placeholder="VD: 0912345678" required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                    <textarea
                      name="address" rows="3" value={formData.address} onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-800 font-bold bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP" required
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-br-full -z-10"></div>
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight relative z-10">
                  <span className="text-blue-500 text-3xl">💳</span> Phương Thức Thanh Toán
                </h2>
                <div className="space-y-4 relative z-10">
                  <label className="flex items-center p-5 border-2 border-blue-500 bg-blue-50/50 rounded-2xl cursor-pointer transition-all hover:shadow-md">
                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={handleInputChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-4 font-black text-slate-800">Thanh toán khi nhận hàng (COD)</span>
                    <span className="ml-auto text-2xl grayscale-0">💵</span>
                  </label>

                  <label className="flex items-center p-5 border border-slate-200 rounded-2xl cursor-not-allowed opacity-60 bg-slate-50">
                    <input type="radio" disabled className="w-5 h-5" />
                    <span className="ml-4 font-bold text-slate-500 line-through">Chuyển khoản MoMo (Bảo trì)</span>
                    <span className="ml-auto text-2xl grayscale">📱</span>
                  </label>
                  <label className="flex items-center p-5 border border-slate-200 rounded-2xl cursor-not-allowed opacity-60 bg-slate-50">
                    <input type="radio" disabled className="w-5 h-5" />
                    <span className="ml-4 font-bold text-slate-500 line-through">Thẻ Visa / MasterCard (Bảo trì)</span>
                    <span className="ml-auto text-2xl grayscale">💳</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sticky top-24">
                <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 tracking-tight">Tóm Tắt Đơn Hàng</h2>

                <div className="space-y-5 max-h-[40vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl p-1.5 border border-slate-100 shrink-0 overflow-hidden">
                        <img src={item.image} alt="img" className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-snug mb-1.5">{item.title}</h4>
                        <div className="text-xs font-bold text-slate-500 bg-slate-100 w-max px-2 py-0.5 rounded">SL: {item.quantity} <span className="mx-1">x</span> <span className="text-blue-600">{formatPrice(item.price)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex justify-between text-slate-600 font-bold text-sm">
                    <span>Tạm tính ({cart.length} món)</span>
                    <span className="text-slate-900">{formatPrice(subTotal)}</span>
                  </div>

                  {/* 🚀 Đã update lại hiển thị Voucher cho mượt */}
                  {safeDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-black text-sm bg-green-50 px-4 py-2.5 rounded-xl border border-green-100">
                      <span className="flex items-center gap-1.5"><span className="text-lg">🎟️</span> Voucher giảm giá</span>
                      <span>- {formatPrice(safeDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 font-bold text-sm">
                    <span>Phí vận chuyển</span>
                    <span className="text-slate-900">{formatPrice(shippingFee)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-2">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Tổng cộng</span>
                    <span className="text-3xl font-black text-red-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-8 bg-slate-900 text-white font-black py-4.5 rounded-xl shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span className="text-lg">🔥</span> Chốt Đơn Ngay
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-5 font-bold leading-relaxed px-4">
                  Nhấn Chốt Đơn đồng nghĩa với việc Chủ Tịch đã đồng ý với Điều khoản của 2FAST.SHOP.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Đang tải biểu mẫu đặt hàng...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}