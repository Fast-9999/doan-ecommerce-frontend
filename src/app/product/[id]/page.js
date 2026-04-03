"use client";

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useCartStore from "../../../store/useCartStore";
import useAuthStore from "../../../store/useAuthStore";
import Footer from "../../../components/Footer";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // 🚀 BỔ SUNG: State lưu trữ số lượng tồn kho
  const [stock, setStock] = useState(null);

  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToCart } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchProductData();
      fetchReviews();
      fetchInventory(); // 🚀 BỔ SUNG: Gọi thủ kho check hàng
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/products/${id}`);
      let data = res.data;
      if (data && typeof data === 'object' && !data._id) {
        data = data.data || data.product || data.result || data;
      }
      setProduct(data);
    } catch (err) {
      console.error("Lỗi lấy chi tiết:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 BỔ SUNG: Hàm gọi API quét kho hàng
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/inventories`);
      const allInventories = res.data;

      // Tìm đúng cái kho của sản phẩm hiện tại
      const currentItem = allInventories.find(inv =>
        (inv.product?._id || inv.product) === id
      );

      if (currentItem) {
        setStock(currentItem.stock);
      } else {
        setStock(0); // Không tìm thấy trong sổ thì coi như hết hàng
      }
    } catch (err) {
      console.error("Lỗi lấy tồn kho:", err);
      setStock(0);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/reviews/product/${id}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error("Lỗi lấy reviews:", err);
    }
  };

  const formatPrice = (price) => price?.toLocaleString('vi-VN') + " VNĐ";

  // 🚀 BỔ SUNG LOGIC CHẶN TĂNG SỐ LƯỢNG LỐ KHO
  const handleIncrease = () => {
    if (stock !== null && quantity >= stock) {
      toast.error(`Kho chỉ còn đúng ${stock} cái thôi Chủ Tịch ơi! Khách thông cảm nhen!`, {
        icon: '📦',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }
    setQuantity(q => q + 1);
  };

  const handleDecrease = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (!product || stock <= 0) return; // Hết hàng thì cấm chạy hàm này
    const cartItem = {
      _id: product._id,
      title: product.title || product.name,
      price: product.price,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/600x600?text=Chua+Co+Anh"),
      quantity: 1
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
    toast.success(`🛒 Đã ném ${quantity} món "${cartItem.title}" vào giỏ hàng!`, {
      style: { borderRadius: '12px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleBuyNow = () => {
    if (stock <= 0) return; // Hết hàng cấm mua
    handleAddToCart();
    router.push("/cart");
  };

  // 🚀 BỔ SUNG HÀM XỬ LÝ ĐẶT CHỖ / GIỮ HÀNG
  const handleReserve = async () => {
    let currentUser = (user && Object.keys(user).length > 0) ? user : null;
    let currentToken = user?.token || "";

    // Tìm user từ local storage nếu chưa có
    if (!currentUser || !currentToken) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item?.state?.user) currentUser = item.state.user;
          if (item?.state?.token) currentToken = item.state.token;
        } catch (error) { }
      }
    }

    if (!currentToken) currentToken = localStorage.getItem("token") || "";
    let userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.data?._id;

    if (!userId && currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        userId = payload._id || payload.id || payload.userId;
      } catch (error) { }
    }

    if (!userId) {
      toast("Ní ơi, đăng nhập trước rồi mới giữ hàng được nha!", { icon: '🔐' });
      return router.push('/login');
    }

    if (stock !== null && quantity > stock) {
      toast.error(`Kho chỉ còn đúng ${stock} cái thôi Chủ Tịch ơi! Không đủ để giữ hàng.`);
      return;
    }

    try {
      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/reservations/reserveItems", {
        items: [
          { product: id, quantity: quantity, price: product.price }
        ]
      }, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      if (res.data.success || res.status === 201) {
        toast.success("🎉 Đã đặt gạch giữ hàng thành công! Ní vô Profile để kiểm tra nha.", {
          style: { borderRadius: '12px', background: '#059669', color: '#fff', fontWeight: 'bold' }
        });
      }
    } catch (error) {
      console.error("Lỗi giữ hàng:", error);
      toast.error("Hết chỗ giữ rồi hoặc lỗi mạng, thử lại sau nha Sếp!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    let currentUser = (user && Object.keys(user).length > 0) ? user : null;
    let currentToken = user?.token || "";

    if (!currentUser || !currentToken) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item?.state?.user) currentUser = item.state.user;
          if (item?.state?.token) currentToken = item.state.token;
        } catch (error) { }
      }
    }

    if (!currentToken) currentToken = localStorage.getItem("token") || "";

    let userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.data?._id;

    if (!userId && currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        userId = payload._id || payload.id || payload.userId;
      } catch (error) { }
    }

    if (!userId) {
      toast.error("Hệ thống vẫn không tìm thấy tài khoản của ông. Ní thử xóa lịch sử web rồi đăng nhập lại xem!");
      return;
    }

    if (!comment.trim()) {
      toast("Nhập vài chữ review cho xôm tụ đi ní ơi!", { icon: '✍️' });
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axios.post("https://doan-ecommerce-backend.vercel.app/api/v1/reviews",
        {
          product: id,
          user: userId,
          rating,
          comment
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      if (res.data.success || res.status === 201 || res.status === 200) {
        toast.success("🎉 Đã gửi đánh giá thành công rực rỡ!");
        setComment("");
        setRating(5);
        fetchReviews();
      }
    } catch (error) {
      console.error("Lỗi gửi review:", error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Huhu gửi xịt rồi: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
        <div className="text-9xl mb-6 grayscale opacity-30">🛸</div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Sản phẩm bay màu rồi!</h1>
        <p className="text-slate-500 font-medium mb-8 text-lg">Siêu phẩm này không tồn tại hoặc đã bị Chủ Tịch xóa.</p>
        <Link href="/products" className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black shadow-xl hover:bg-blue-600 hover:shadow-blue-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 5.0;
  const isUserValid = (user && Object.keys(user).length > 0) || (typeof window !== 'undefined' && localStorage.getItem("token"));

  // 🚀 Biến check Hết Hàng
  const isOutOfStock = stock !== null && stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">

      {/* 🚀 Breadcrumb VIP */}
      <div className="bg-white border-b border-slate-100 py-4 sticky top-0 z-40 shadow-sm/50 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-black text-slate-400 flex items-center gap-3 uppercase tracking-widest">
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /></svg>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">SẢN PHẨM</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 line-clamp-1">{product.title || product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grow">

        {/* 🚀 KHỐI 1: THÔNG TIN SẢN PHẨM (HERO SECTION) */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row mb-12">

          {/* Cột Trái: Ảnh Sản Phẩm */}
          <div className="lg:w-1/2 p-8 md:p-14 bg-slate-50/50 flex items-center justify-center relative group border-r border-slate-100">
            {/* Tag Trạng Thái Kho */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
              {isOutOfStock ? (
                <span className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-slate-700">
                  🚫 ĐÃ HẾT HÀNG
                </span>
              ) : (
                <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-400 animate-pulse">
                  🔥 ĐANG HOT
                </span>
              )}
            </div>

            {/* Nền Gradient mờ mờ phía sau ảnh */}
            <div className="absolute inset-0 bg-linear-to-tr from-blue-100/40 to-purple-100/40 rounded-full blur-3xl scale-75 group-hover:scale-100 transition-transform duration-700"></div>

            <img
              src={product.image || (product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/600x600?text=Chua+Co+Anh")}
              alt={product.title || product.name}
              className={`relative z-10 w-full max-w-md aspect-square object-contain mix-blend-multiply transition-all duration-500 ${isOutOfStock ? 'grayscale opacity-50' : 'group-hover:scale-110 group-hover:-rotate-2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]'}`}
            />
          </div>

          {/* Cột Phải: Form Chốt Đơn */}
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col">

            {/* Category & Rating */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg tracking-widest uppercase shadow-sm">
                {product.category?.name || product.category || "CÔNG NGHỆ"}
              </span>
              <div className="flex items-center text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-yellow-500 mr-1 text-base leading-none">★</span> {avgRating} <span className="text-slate-400 font-medium ml-1">({reviews.length} đánh giá)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              {product.title || product.name}
            </h1>

            {/* Price & Stock */}
            <div className="mb-8 pb-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
              <div className="text-4xl md:text-5xl font-black text-rose-600 tracking-tighter">
                {formatPrice(product.price)}
              </div>
              {stock !== null && (
                <div className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border shadow-sm mb-1.5 inline-flex items-center gap-2 w-max ${stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  <span className="relative flex h-2 w-2">
                    {stock > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${stock > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  </span>
                  {stock > 0 ? `CÒN ${stock} SẢN PHẨM` : 'TẠM HẾT HÀNG'}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-slate-500 font-medium leading-relaxed mb-10 text-justify bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p>{product.description || "Sản phẩm này hiện chưa có mô tả chi tiết. Vui lòng liên hệ bộ phận CSKH để biết thêm chi tiết nha Chủ Tịch!"}</p>
            </div>

            {/* Actions (Quantity + Buttons) */}
            <div className="mt-auto space-y-6">

              {/* Chọn số lượng */}
              <div>
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">SỐ LƯỢNG MUA</span>
                <div className="inline-flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                  <button
                    onClick={handleDecrease}
                    disabled={isOutOfStock}
                    className="w-12 h-12 flex items-center justify-center text-slate-500 font-black hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                  >−</button>
                  <span className="w-16 text-center font-black text-slate-900 text-lg">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    onClick={handleIncrease}
                    disabled={isOutOfStock}
                    className="w-12 h-12 flex items-center justify-center text-slate-500 font-black hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                  >+</button>
                </div>
              </div>

              {/* Nhóm Nút Bấm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`col-span-1 font-black py-4 px-2 rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 tracking-widest uppercase text-xs shadow-sm ${isOutOfStock
                      ? 'bg-slate-100 text-slate-400 border-2 border-slate-100 cursor-not-allowed'
                      : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-xl hover:-translate-y-1'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {isOutOfStock ? 'KHÔNG THỂ THÊM' : 'THÊM VÀO GIỎ'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`col-span-1 font-black py-4 px-2 rounded-2xl transition-all duration-300 tracking-widest uppercase text-xs shadow-xl flex justify-center items-center gap-2 ${isOutOfStock
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-1'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  {isOutOfStock ? 'HẾT HÀNG' : 'MUA NGAY'}
                </button>

                <button
                  onClick={handleReserve}
                  disabled={isOutOfStock}
                  className={`sm:col-span-2 font-black py-4 px-2 rounded-2xl transition-all duration-300 tracking-widest uppercase text-xs shadow-xl flex justify-center items-center gap-2 ${isOutOfStock
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none hidden' // Giấu luôn nếu hết hàng
                      : 'bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/40 hover:-translate-y-1'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  GIỮ HÀNG TRƯỚC (RESERVE)
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 🚀 KHỐI 2: ĐÁNH GIÁ VÀ NHẬN XÉT (REVIEWS) */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-12 mb-12">

          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Đánh Giá Sản Phẩm</h2>
              <p className="text-slate-500 font-medium mt-1">Khách hàng nói gì về siêu phẩm này?</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-4xl font-black text-yellow-600">{avgRating}</div>
              <div className="flex flex-col">
                <div className="text-yellow-500 text-lg tracking-widest">★★★★★</div>
                <div className="text-xs font-bold text-yellow-700 uppercase tracking-widest">{reviews.length} đánh giá</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Cột form viết đánh giá */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 sticky top-24 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6">Viết đánh giá của bạn</h3>

                {isUserValid ? (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Chấm Điểm Trải Nghiệm</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-3xl focus:outline-none transition-transform hover:scale-125 hover:-rotate-6 ${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Chia Sẻ Cảm Nhận</label>
                      <textarea
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Sản phẩm xịn xò, shop đóng gói cẩn thận..."
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> ĐANG GỬI...</>
                      ) : (
                        <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg> GỬI ĐÁNH GIÁ</>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <div className="text-5xl mb-4 grayscale opacity-40">🔐</div>
                    <p className="text-sm font-bold text-slate-500 mb-6 px-4">Đăng nhập ngay để "chém gió" cùng 500 anh em nha Sếp!</p>
                    <Link href="/login" className="inline-block bg-slate-900 text-white hover:bg-blue-600 font-black px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-blue-500/30 hover:-translate-y-1 uppercase tracking-widest text-xs">
                      Tới Trang Đăng Nhập
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Cột danh sách bình luận */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                  <div className="text-6xl mb-6 grayscale opacity-40">💬</div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Chưa có đánh giá nào!</h3>
                  <p className="text-slate-500 font-medium">Hãy là vị Chủ Tịch đầu tiên bóc tem và để lại nhận xét cho siêu phẩm này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rv, idx) => (
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex gap-4 md:gap-6 hover:border-blue-100 transition-colors group">

                      <img
                        src={rv.user?.avatarUrl || "https://i.stack.imgur.com/l60Hf.png"}
                        alt="avatar"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm shrink-0 group-hover:border-blue-200 transition-colors"
                      />

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                          <div>
                            <h4 className="font-black text-slate-900 text-base">{rv.user?.username || rv.user?.name || "Người Dùng Bí Ẩn"}</h4>
                            <div className="flex text-yellow-400 text-sm mt-1 gap-0.5">
                              {"★".repeat(rv.rating)}<span className="text-slate-200">{"★".repeat(5 - rv.rating)}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-4 md:p-5 rounded-2xl rounded-tl-none border border-slate-100 text-slate-600 font-medium text-sm leading-relaxed relative">
                          {/* Dấu nháy quote */}
                          <div className="absolute top-0 left-0 -mt-2 -ml-2 text-2xl text-blue-200 opacity-50 font-serif">"</div>
                          {rv.comment}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}