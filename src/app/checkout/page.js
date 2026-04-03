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

  // 🚀 LẤY ĐÚNG SỐ TIỀN VOUCHER TỪ URL TRUYỀN QUA
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

  // Chặn trường hợp tiền giảm lớn hơn tổng tiền
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
      toast.error("Điền thiếu thông tin giao hàng rồi Chủ Tịch ơi!", {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
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

      if (!currentToken && typeof window !== 'undefined') {
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
          email_address: user?.email || user?.data?.email || "guest@2fast.shop"
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
      toast.success("🎉 CHỐT ĐƠN THÀNH CÔNG! Siêu phẩm đang trên đường tới tay Sếp!", {
        style: { borderRadius: '12px', background: '#059669', color: '#fff', fontWeight: 'bold' }
      });

      clearCart();
      router.push("/history");

    } catch (err) {
      console.error("Lỗi đặt hàng chi tiết:", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message || "Lỗi bí ẩn";
      toast.error(`❌ Lỗi rồi Chủ Tịch ơi! Backend báo:\n\n👉 "${backendError}"`);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">

      {/* 🚀 HEADER TỐI GIẢN CHUẨN CHECKOUT */}
      <div className="bg-white text-slate-900 border-b border-slate-200 py-5 sticky top-0 z-50 shadow-sm/50 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-lg">2FAST</span><span className="text-blue-600">.</span>SHOP
            <span className="text-slate-300 font-normal text-3xl mx-2 hidden sm:inline-block">|</span>
            <span className="text-slate-600 font-black text-xl hidden sm:inline-block tracking-widest uppercase">Thanh Toán</span>
          </Link>

          {/* Progress Bar Xịn Xò */}
          <div className="flex items-center gap-3 text-xs font-black tracking-widest uppercase text-slate-400">
            <Link href="/cart" className="hover:text-slate-800 transition-colors">Giỏ Hàng</Link>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">Thanh Toán</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            <span>Hoàn Tất</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grow relative">

        {cart.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 md:p-24 text-center border border-slate-100 max-w-2xl mx-auto mt-10">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-inner">
              <div className="text-6xl grayscale opacity-40">🛍️</div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Thanh toán cái gì đây?</h2>
            <p className="text-slate-500 mb-10 font-medium">Giỏ hàng của Chủ Tịch đang trống trơn. Hãy quay lại và lựa chọn siêu phẩm nhé!</p>
            <Link href="/products" className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black shadow-lg hover:bg-blue-600 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* 🚀 CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
            <div className="lg:w-2/3 w-full space-y-8">

              {/* Thông tin Giao Hàng */}
              <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-full -z-10"></div>
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-blue-200">📍</div>
                  Thông Tin Giao Hàng
                </h2>

                <div className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ và Tên <span className="text-rose-500">*</span></label>
                      <input
                        type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-bold bg-slate-50/50 hover:bg-slate-50 transition-all placeholder:text-slate-300 placeholder:font-medium"
                        placeholder="Nguyễn Văn A" required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại <span className="text-rose-500">*</span></label>
                      <input
                        type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-bold bg-slate-50/50 hover:bg-slate-50 transition-all placeholder:text-slate-300 placeholder:font-medium"
                        placeholder="VD: 0912.345.678" required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ nhận hàng cụ thể <span className="text-rose-500">*</span></label>
                    <textarea
                      name="address" rows="3" value={formData.address} onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-slate-800 font-bold bg-slate-50/50 hover:bg-slate-50 transition-all placeholder:text-slate-300 placeholder:font-medium leading-relaxed"
                      placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành Phố..." required
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Phương Thức Thanh Toán */}
              <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-purple-50/50 rounded-br-full -z-10"></div>
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight relative z-10">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-purple-200">💳</div>
                  Phương Thức Thanh Toán
                </h2>

                <div className="grid grid-cols-1 gap-4 relative z-10">
                  {/* Selectable Card COD */}
                  <label className={`flex items-center p-5 rounded-2xl cursor-pointer transition-all border-2 ${formData.paymentMethod === "COD" ? "border-blue-600 bg-blue-50 shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={handleInputChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500 hidden" />

                    {/* Fake Radio Circle */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${formData.paymentMethod === "COD" ? "border-blue-600" : "border-slate-300"}`}>
                      {formData.paymentMethod === "COD" && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                    </div>

                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-base">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Trả tiền mặt khi shipper giao hàng tới</div>
                    </div>
                    <span className="ml-4 text-3xl drop-shadow-sm">💵</span>
                  </label>

                  {/* Disabled Cards */}
                  <label className="flex items-center p-5 border border-slate-200 rounded-2xl cursor-not-allowed opacity-50 bg-slate-50 grayscale">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 mr-4 shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-600 text-base line-through">Ví điện tử MoMo</div>
                      <div className="text-xs text-rose-500 font-black mt-1 uppercase tracking-widest">Đang bảo trì hệ thống</div>
                    </div>
                    <span className="ml-4 text-3xl">📱</span>
                  </label>

                  <label className="flex items-center p-5 border border-slate-200 rounded-2xl cursor-not-allowed opacity-50 bg-slate-50 grayscale">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 mr-4 shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-600 text-base line-through">Thẻ Visa / MasterCard</div>
                      <div className="text-xs text-rose-500 font-black mt-1 uppercase tracking-widest">Đang bảo trì hệ thống</div>
                    </div>
                    <span className="ml-4 text-3xl">💳</span>
                  </label>
                </div>
              </div>

            </div>

            {/* 🚀 CỘT PHẢI: BILL THANH TOÁN (STICKY) */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100 p-8 sticky top-28">
                <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 tracking-tight">Tóm Tắt Đơn Hàng</h2>

                {/* List sản phẩm thu gọn */}
                <div className="space-y-4 max-h-[35vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl p-1 border border-slate-100 shrink-0 overflow-hidden relative">
                        <img src={item.image} alt="img" className="w-full h-full object-contain mix-blend-multiply" />
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{item.title}</h4>
                        <div className="text-xs font-black text-blue-600">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tiền Nong */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex justify-between text-slate-500 font-bold text-sm">
                    <span>Tạm tính ({cart.length} món)</span>
                    <span className="text-slate-800">{formatPrice(subTotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 font-bold text-sm">
                    <span>Phí giao hàng (Freeship)</span>
                    <span className="text-slate-800">{formatPrice(shippingFee)}</span>
                  </div>

                  {safeDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-black text-sm bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 shadow-sm">
                      <span className="flex items-center gap-1.5"><span className="text-base">🎟️</span> Đã giảm giá</span>
                      <span>- {formatPrice(safeDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t-2 border-dashed border-slate-200 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CẦN THANH TOÁN</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">(Đã bao gồm VAT)</span>
                    </div>
                    <span className="text-3xl md:text-4xl font-black text-rose-600 tracking-tighter">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Nút Chốt Đơn */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-8 bg-slate-900 text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-blue-600 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center gap-3 uppercase tracking-widest text-sm group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>ĐANG XỬ LÝ...</span>
                    </>
                  ) : (
                    <>
                      CHỐT ĐƠN NGAY
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                  Bảo mật thông tin & Thanh toán an toàn
                </div>

              </div>
            </div>

          </form>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-bold text-slate-500 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="uppercase tracking-widest text-xs">Đang tải biểu mẫu...</span>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}