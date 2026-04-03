"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import useCartStore from "../../store/useCartStore"; // Đảm bảo đường dẫn đúng tới kho Zustand
import Footer from "../../components/Footer";

export default function CartPage() {
  const router = useRouter();

  // Lấy dữ liệu từ kho Giỏ Hàng
  const { cart, removeFromCart } = useCartStore();

  // 🚀 STATE CHO VOUCHER (Đã độ lại để nhận cả Tiền mặt lẫn %)
  const [voucherCode, setVoucherCode] = useState("");
  const [discountData, setDiscountData] = useState({ type: 'percent', value: 0 }); // Lưu 2 thông số
  const [isApplying, setIsApplying] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState({ type: "", text: "" });

  // 1. Gộp các sản phẩm trùng ID lại
  const groupedCart = cart.reduce((acc, item) => {
    const existing = acc.find(i => i._id === item._id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      acc.push({ ...item, quantity: item.quantity || 1 });
    }
    return acc;
  }, []);

  // 2. TÍNH TOÁN TIỀN NONG (Đã nâng cấp)
  const subTotal = groupedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountAmount = 0;
  if (discountData.type === 'percent' || discountData.type === 'PERCENT') {
    discountAmount = (subTotal * discountData.value) / 100;
  } else {
    discountAmount = discountData.value;
  }

  // Chặn trường hợp tiền giảm lớn hơn tiền mua (Giảm xong âm tiền là sạt nghiệp Sếp ơi 😂)
  if (discountAmount > subTotal) {
    discountAmount = subTotal;
  }

  const finalTotal = subTotal - discountAmount;

  const formatPrice = (price) => Math.round(price).toLocaleString('vi-VN') + " VNĐ";

  // 🚀 3. HÀM ÁP DỤNG VOUCHER
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherMessage({ type: "error", text: "Ní chưa nhập mã mà đòi giảm giá sao?" });
      return;
    }

    try {
      setIsApplying(true);
      setVoucherMessage({ type: "", text: "" });

      // Gửi CẢ MÃ VOUCHER LẪN TỔNG TIỀN lên cho BE check
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/vouchers/apply", {
        code: voucherCode,
        cartTotal: subTotal // Bơm số tiền 85k vô đây nè!
      });

      if (res.data.success) {
        // Hứng 2 dữ liệu mới từ BE trả về
        setDiscountData({ type: res.data.discountType, value: res.data.discountValue });

        const successText = res.data.discountType === 'percent' || res.data.discountType === 'PERCENT'
          ? `🎉 Bú ngay mã giảm ${res.data.discountValue}% Chủ Tịch ơi!`
          : `🎉 Bú ngay mã giảm ${formatPrice(res.data.discountValue)} Chủ Tịch ơi!`;

        setVoucherMessage({ type: "success", text: successText });
      }
    } catch (err) {
      setDiscountData({ type: 'percent', value: 0 });
      // Lấy câu chửi "Đơn hàng phải từ 200k" từ BE lên đây hiện ra!
      const errorMsg = err.response?.data?.message || "Mã này dỏm hoặc bị lỗi rồi!";
      setVoucherMessage({ type: "error", text: `❌ ${errorMsg}` });
    } finally {
      setIsApplying(false);
    }
  };

  // 4. Xóa Voucher
  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscountData({ type: 'percent', value: 0 });
    setVoucherMessage({ type: "", text: "" });
  };

  // 5. Chuyển sang trang Thanh Toán
  const handleCheckout = () => {
    // Truyền thẳng số tiền đã được giảm (discountAmount) qua bên checkout luôn cho lẹ
    router.push(`/checkout?discountAmount=${discountAmount}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      <div className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Giỏ Hàng Của Bạn</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">

        {groupedCart.length === 0 ? (
          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-6 grayscale opacity-30">🛒</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Giỏ hàng trống rỗng!</h2>
            <p className="text-slate-500 font-medium mb-8">Chủ Tịch chưa chốt đơn món nào hết. Mua sắm ngay đi cho nóng!</p>
            <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 uppercase tracking-widest text-sm">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">

            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="lg:w-2/3 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6 md:p-8">
                <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Chi Tiết Sản Phẩm ({groupedCart.length} món)</h3>

                <div className="space-y-6">
                  {groupedCart.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group">

                      <div className="w-24 h-24 shrink-0 bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <img
                          src={item.image || "https://via.placeholder.com/150?text=No+Image"}
                          alt={item.title}
                          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <Link href={`/product/${item._id}`} className="text-lg font-black text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-2">
                          {item.title}
                        </Link>
                        <div className="text-sm font-bold text-blue-600 bg-blue-50 w-max mx-auto sm:mx-0 px-3 py-1 rounded-md">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-sm font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                          x{item.quantity}
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Xóa khỏi giỏ"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: TỔNG KẾT VÀ VOUCHER */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 sticky top-24">
                <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Đơn Hàng Của Bạn</h3>

                <div className="space-y-4 text-sm font-medium text-slate-600 mb-6">
                  <div className="flex justify-between">
                    <span>Tạm tính ({groupedCart.length} món)</span>
                    <span className="font-bold text-slate-800">{formatPrice(subTotal)}</span>
                  </div>

                  {/* 🚀 KHU VỰC NHẬP VOUCHER */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Mã Giảm Giá</label>

                    {discountData.value > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <span className="text-green-700 font-black text-sm uppercase tracking-wide">{voucherCode}</span>
                          <p className="text-xs text-green-600 font-bold mt-1">
                            Đã áp dụng giảm {discountData.type === 'percent' || discountData.type === 'PERCENT' ? `${discountData.value}%` : formatPrice(discountData.value)}
                          </p>
                        </div>
                        <button onClick={handleRemoveVoucher} className="text-slate-400 hover:text-red-500 font-bold text-xs underline underline-offset-2">Hủy mã</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="VD: CHUTICHVIP"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isApplying || !voucherCode.trim()}
                          className="bg-slate-900 text-white font-black px-5 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {isApplying ? "Đợi..." : "ÁP DỤNG"}
                        </button>
                      </div>
                    )}

                    {/* Báo lỗi hoặc thành công */}
                    {voucherMessage.text && (
                      <div className={`mt-3 text-xs font-bold ${voucherMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                        {voucherMessage.text}
                      </div>
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold pt-4 border-t border-slate-100">
                      <span>Voucher giảm giá</span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Tổng Cộng</span>
                    <span className="text-3xl font-black text-red-600">{formatPrice(finalTotal)}</span>
                  </div>
                  <p className="text-[10px] text-right text-slate-400 font-bold mt-2">(Đã bao gồm VAT & Freeship)</p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  TIẾN HÀNH THANH TOÁN
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <div className="mt-4 flex justify-center gap-2 grayscale opacity-50">
                  <span className="text-2xl">💳</span>
                  <span className="text-2xl">🏦</span>
                  <span className="text-2xl">💵</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}