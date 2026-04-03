"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import Link from "next/link";

export default function ChatBubble() {
  const { user, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ⚠️ QUAN TRỌNG: Thay ID này bằng _id của tài khoản Admin trong Database của ní
  const ADMIN_ID = "69c76c973aee4e3f42467437"; // <--- SỬA CHỖ NÀY NHA CHỦ TỊCH

  // Cuộn xuống cuối mỗi khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Lấy lịch sử chat khi mở bong bóng
  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      // Tùy chọn: Cài một cái đồng hồ (interval) gọi API 5s/lần để check tin nhắn mới (Polling)
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  const getAuthHeaders = () => {
    let auth_token = token || user?.token || user?.accessToken;
    if (!token && typeof window !== 'undefined') {
      auth_token = localStorage.getItem("token");
    }
    return {
      headers: {
        "Authorization": `Bearer ${auth_token}`
      }
    };
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/chats/${ADMIN_ID}`, getAuthHeaders());
      if (res.data.success) {
        // Đảm bảo dữ liệu luôn là mảng để tránh lỗi .map() làm sập web
        setMessages(res.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải tin nhắn:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Hiển thị tin nhắn tạm thời lên UI trước cho mượt (Optimistic UI)
    const tempMsg = {
      _id: Date.now().toString(),
      sender: user._id || user.id || user.userId || user.data?._id,
      messageContent: { type: "text", text: inputText },
      createdAt: new Date().toISOString(),
      isMine: true
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputText("");

    try {
      setLoading(true);
      // Gửi đi theo chuẩn form-data vì BE nãy mình hỗ trợ uploadImage
      const formData = new FormData();
      formData.append("to", ADMIN_ID);
      formData.append("text", tempMsg.messageContent.text);

      await axios.post(`https://doan-ecommerce-backend.vercel.app/api/v1/chats`, formData, getAuthHeaders());

      // Gửi xong gọi lại danh sách cho chắc
      fetchMessages();
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      toast.error("Gửi lỗi rồi ní ơi!");
    } finally {
      setLoading(false);
    }
  };

  // Nếu là admin thì không hiện bong bóng này (Admin có trang Inbox riêng)
  const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin' || user.role === '69c79a3c076efe132ceab729');
  if (isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[450px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">

          {/* Header */}
          <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl shadow-inner shadow-blue-400">👨‍💼</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide">CSKH 2FAST.SHOP</h3>
                <p className="text-[10px] text-blue-200 font-bold tracking-widest uppercase">Đang hoạt động</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors hover:rotate-90 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body Chat */}
          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="text-5xl mb-3 grayscale opacity-40">🔒</div>
                <p className="text-sm font-bold text-slate-500 mb-4">Ní phải đăng nhập mới chat được với Shop nha!</p>
                <Link href="/login" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-900 transition-colors text-xs uppercase tracking-widest">
                  Đăng nhập ngay
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <div className="text-4xl mb-2">👋</div>
                <p className="text-xs font-bold text-slate-500">Chưa có tin nhắn nào. Ní hỏi gì đi!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                // 🚀 CÔNG THỨC CHỐNG CƯỚP CÔNG MỚI: Quét diện rộng mọi trường dữ liệu
                const senderObj = msg.sender || msg.from || msg.senderId;
                const senderId = senderObj ? (typeof senderObj === 'object' ? String(senderObj._id || senderObj.id || "") : String(senderObj)) : "";
                const myId = String(user?._id || user?.id || user?.userId || user?.data?._id || "");

                // Lật ngược vấn đề: Đứa nào gửi mà ID không phải là ADMIN, thì đứa đó chắc chắn là Mình!
                const isMine = msg.isMine !== undefined ? msg.isMine : (senderId === myId || (senderId !== "" && senderId !== ADMIN_ID));

                // Format thời gian và tên
                const timeString = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
                const senderName = isMine ? (user?.fullname || user?.username || "Bạn") : "CSKH 2FAST.SHOP";

                return (
                  <div key={msg._id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-2`}>
                    <div className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                      {senderName} {timeString && `• ${timeString}`}
                    </div>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${isMine
                      ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-sm shadow-sm'  // User màu trắng
                      : 'bg-blue-600 text-white rounded-tl-sm shadow-md' // Admin màu xanh
                      }`}>
                      {msg.messageContent?.text || msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khung Nhập Text */}
          {user && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhắn tin cho Shop..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Nút Tròn Mở Bong Bóng */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 hover:bg-blue-600 transition-all duration-300 relative group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          {/* Chấm đỏ thông báo */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
        </button>
      )}
    </div>
  );
}