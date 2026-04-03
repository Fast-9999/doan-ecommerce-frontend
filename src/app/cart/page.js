"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import useCartStore from "../../store/useCartStore";
import Footer from "../../components/Footer";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart } = useCartStore();

  const [voucherCode, setVoucherCode] = useState("");
  const [discountData, setDiscountData] = useState({ type: 'percent', value: 0 });
  const [isApplying, setIsApplying] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState({ type: "", text: "" });

  const groupedCart = cart.reduce((acc, item) => {
    const existing = acc.find(i => i._id === item._id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      acc.push({ ...item, quantity: item.quantity || 1 });
    }
    return acc;
  }, []);

  const subTotal = groupedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountAmount = 0;
  if (discountData.type === 'percent' || discountData.type === 'PERCENT') {
    discountAmount = (subTotal * discountData.value) / 100;
  } else {
    discountAmount = discountData.value;
  }

  if (discountAmount > subTotal) {
    discountAmount = subTotal;
  }

  const finalTotal = subTotal - discountAmount;

  const formatPrice = (price) => Math.round(price).toLocaleString('vi-VN') + " VNĐ";

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherMessage({ type: "error", text: "Ní chưa nhập mã mà đòi giảm giá sao?" });
      return;
    }

    try {
      setIsApplying(true);
      setVoucherMessage({ type: "", text: "" });

      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/vouchers/apply", {
        code: voucherCode,
        cartTotal: subTotal
      });

      if (res.data.success) {
        setDiscountData({ type: res.data.discountType, value: res.data.discountValue });

        const successText = res.data.discountType === 'percent' || res.data.discountType === 'PERCENT'
          ? `🎉 Giảm rực rỡ ${res.data.discountValue}% Chủ Tịch ơi!`
          : `🎉 Giảm ngay ${formatPrice(res.data.discountValue)} Chủ Tịch ơi!`;

        setVoucherMessage({ type: "success", text: successText });
      }
    } catch (err) {
      setDiscountData({ type: 'percent', value: 0 });
      const errorMsg = err.response?.data?.message || "Mã này dỏm hoặc bị lỗi rồi!";
      setVoucherMessage({ type: "error", text: `❌ ${errorMsg}` });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscountData({ type: 'percent', value: 0 });
    setVoucherMessage({ type: "", text: "" });
  };

  const handleCheckout = () => {
    router.push(`/checkout?discountAmount=${discountAmount}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">

      {/* 🚀 BREADCRUMB / TRÌNH ĐƠN */}
      <div className="bg-white border-b border-slate-100 py-6 sticky top-0 z-40 shadow-sm/50 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">GIỎ HÀNG</h1>

          {/* Thanh Tiến Trình (Trang Trí) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-black tracking-widest uppercase text-slate-400">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-1">1. Giỏ Hàng</span>
            <span>-</span>
            <span>2. Thanh Toán</span>
            <span>-</span>
            <span>3. Hoàn Tất</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">

        {groupedCart.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-16 md:p-24 flex flex-col items-center justify-center text-center">
            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-8 border-white shadow-inner">
              <div className="text-7xl grayscale opacity-40">🛒</div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Giỏ Hàng Trống Vắng!</h2>
            <p className="text-slate-500 font-medium mb-10 text-lg">Chủ Tịch chưa chọn được siêu phẩm nào sao? Cùng dạo một vòng nhé!</p>
            <Link href="/products" className="bg-slate-900 hover:bg-blue-600 text-white font-black px-10 py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1 uppercase tracking-widest text-sm inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

            {/* 🚀 CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="lg:w-2/3 space-y-6">
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden p-6 md:p-8">

                <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Chi Tiết Sản Phẩm</h3>
                  <span className="text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-lg text-sm">{groupedCart.length} món</span>
                </div>

                <div className="space-y-6">
                  {groupedCart.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 group">

                      {/* Hình ảnh */}
                      <div className="w-full sm:w-28 sm:h-28 shrink-0 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative">
                        <img
                          src={item.image || "https://via.placeholder.com/150?text=No+Image"}
                          alt={item.title}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 p-2"
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="flex-1 w-full text-left flex flex-col justify-between h-full">
                        <Link href={`/product/${item._id}`} className="text-lg font-black text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-2">
                          {item.title}
                        </Link>
                        <div className="text-base font-black text-rose-600 mb-4 sm:mb-0">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      {/* Số lượng & Xóa */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-slate-100 sm:pl-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SL:</span>
                          <div className="text-sm font-black text-slate-700 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
                            {item.quantity}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm group/btn"
                          title="Xóa khỏi giỏ"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover/btn:scale-110 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 🚀 CỘT PHẢI: TỔNG KẾT VÀ VOUCHER */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8 sticky top-32">
                <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 tracking-tight">Tổng Quan Đơn Hàng</h3>

                <div className="space-y-5 text-sm font-medium text-slate-600 mb-6">

                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 font-bold">Tạm tính ({groupedCart.length} món)</span>
                    <span className="font-black text-slate-900 text-base">{formatPrice(subTotal)}</span>
                  </div>

                  {/* KHU VỰC NHẬP VOUCHER ĐƯỢC LÀM LẠI XỊN XÒ */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
                      Mã Giảm Giá / Voucher
                    </label>

                    {discountData.value > 0 ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                        <div>
                          <span className="text-emerald-700 font-black text-sm uppercase tracking-wide bg-white px-2 py-1 rounded-md border border-emerald-100">{voucherCode}</span>
                          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                            Đã giảm {discountData.type === 'percent' || discountData.type === 'PERCENT' ? `${discountData.value}%` : formatPrice(discountData.value)}
                          </p>
                        </div>
                        <button onClick={handleRemoveVoucher} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-emerald-100 transition-colors" title="Hủy mã">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="Nhập mã vô đây..."
                          className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-slate-800 outline-none uppercase placeholder:text-slate-400 placeholder:normal-case"
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isApplying || !voucherCode.trim()}
                          className="bg-slate-900 text-white font-black px-6 py-3 hover:bg-blue-600 transition-colors disabled:opacity-50 text-xs tracking-widest uppercase"
                        >
                          {isApplying ? "..." : "ÁP DỤNG"}
                        </button>
                      </div>
                    )}

                    {/* Báo lỗi hoặc thành công */}
                    {voucherMessage.text && (
                      <div className={`mt-3 text-xs font-bold flex items-start gap-1.5 ${voucherMessage.type === 'error' ? 'text-rose-500' : 'text-emerald-600'}`}>
                        <span>{voucherMessage.type === 'error' ? '⚠️' : '✅'}</span>
                        <span>{voucherMessage.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Dòng trừ tiền Voucher */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>
                        Khuyến mãi
                      </span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* TỔNG KẾT CUỐI CÙNG */}
                <div className="border-t-2 border-dashed border-slate-200 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Tổng Cần Thanh Toán</span>
                    <span className="text-3xl md:text-4xl font-black text-rose-600 tracking-tighter">{formatPrice(finalTotal)}</span>
                  </div>
                  <p className="text-[10px] text-right text-slate-400 font-bold mt-2 uppercase tracking-widest">(Đã bao gồm Thuế & Phí vận chuyển)</p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-slate-900 text-white font-black py-4 md:py-5 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:bg-blue-600 transition-all duration-300 hover:-translate-y-1 uppercase tracking-widest text-sm flex items-center justify-center gap-3 group"
                >
                  THANH TOÁN NGAY
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                {/* Icon thanh toán */}
                <div className="mt-6 flex justify-center gap-3 grayscale opacity-40">
                  <span className="text-2xl hover:grayscale-0 transition-all cursor-pointer">💳</span>
                  <span className="text-2xl hover:grayscale-0 transition-all cursor-pointer">🏦</span>
                  <span className="text-2xl hover:grayscale-0 transition-all cursor-pointer">💵</span>
                  <span className="text-2xl hover:grayscale-0 transition-all cursor-pointer">📱</span>
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