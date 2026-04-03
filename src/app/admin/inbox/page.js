"use client";

import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "../../../store/useAuthStore";

export default function AdminInbox() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Lưu người đang chat
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin' || user.role === '69c79a3c076efe132ceab729' || user.role?._id === '69c79a3c076efe132ceab729';
      if (!isAdmin) {
        toast.error("Khu vực cấm! Chỉ dành cho Chủ Tịch!");
        router.push("/");
        return;
      }
      fetchInbox();
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAuthHeaders = () => {
    let auth_token = token || user?.token || user?.accessToken;
    if (!token && typeof window !== 'undefined') {
      auth_token = localStorage.getItem("token");
    }
    return {
      headers: { "Authorization": `Bearer ${auth_token}` }
    };
  };

  // 1. Lấy danh sách Inbox (Bên trái)
  const fetchInbox = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://doan-ecommerce-backend.vercel.app/api/v1/chats",
        getAuthHeaders()
      );

      if (res.data?.success) {
        setInbox(res.data.data || []);
      } else {
        setInbox([]);
      }

    } catch (error) {
      console.error("=== LỖI FETCH INBOX CHI TIẾT ===");

      if (error.response) {
        if (
          error.response.data === "jwt expired" ||
          error.response.data?.message === "jwt expired" ||
          error.response.status === 401
        ) {
          toast.error("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          logout();
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
      }
      else if (error.request) {
        toast.error("Không kết nối được với server. Kiểm tra backend có chạy không?");
      }

      setInbox([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lấy chi tiết đoạn chat khi click vào 1 người (Bên phải)
  const fetchMessages = async (partnerId) => {
    try {
      const res = await axios.get(`https://doan-ecommerce-backend.vercel.app/api/v1/chats/${partnerId}`, getAuthHeaders());
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy tin nhắn chi tiết:", err);
    }
  };

  const handleSelectChat = (partner) => {
    setActiveChat(partner);
    fetchMessages(partner.partnerId);
  };

  // 3. Admin gửi tin nhắn rep lại khách
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    // Hiện tạm lên UI cho mượt
    const tempMsg = {
      _id: Date.now().toString(),
      sender: user._id || user.id || user.userId || user.data?._id,
      messageContent: { type: "text", text: inputText },
      createdAt: new Date().toISOString(),
      isAdminMsg: true
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputText("");

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("to", activeChat.partnerId);
      formData.append("text", tempMsg.messageContent.text);

      await axios.post(`https://doan-ecommerce-backend.vercel.app/api/v1/chats`, formData, getAuthHeaders());

      // Load lại để cập nhật cái inbox bên trái (đưa tin nhắn mới lên đầu)
      fetchInbox();
      fetchMessages(activeChat.partnerId);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      toast.error("Gửi lỗi rồi Sếp ơi!");
    } finally {
      setSending(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* 🚀 SIDEBAR ADMIN */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:flex flex-col shrink-0 relative z-20">
        <h2 className="text-2xl font-black mb-10 tracking-wider">
          👑 ADMIN <span className="text-blue-500">PANEL</span>
        </h2>
        <nav className="space-y-4 flex-1">
          <Link href="/admin" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            📦 Tổng Quan & Kho
          </Link>
          <Link href="/admin/products" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👕 Quản lý Sản Phẩm
          </Link>
          {/* Menu Inbox đang Active */}
          <Link href="/admin/inbox" className="block px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition transform hover:translate-x-1 flex justify-between items-center">
            <span>💬 Chăm Sóc Khách</span>
            {inbox.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{inbox.length}</span>
            )}
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👥 Quản lý Users
          </Link>

          <Link href="/admin/vouchers" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            🎟️ Quản lý Vouchers
          </Link>
        </nav>

        <div className="mt-auto">
          <Link href="/" className="block text-center px-4 py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl font-bold transition text-sm uppercase tracking-widest">
            ← Về Cửa Hàng
          </Link>
        </div>
      </div>

      {/* 🚀 MAIN CHAT INTERFACE */}
      <div className="flex-1 flex flex-col md:flex-row bg-white m-4 md:m-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">

        {/* Cột Trái: Danh Sách Inbox */}
        <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">Tin Nhắn</h2>
            <button onClick={fetchInbox} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {loading ? (
              <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : inbox.length === 0 ? (
              <div className="text-center p-10 opacity-50">
                <div className="text-4xl mb-2 grayscale">📭</div>
                <p className="text-sm font-bold text-slate-500">Chưa có ai nhắn tin</p>
              </div>
            ) : (
              inbox.map((chat, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeChat?.partnerId === chat.partnerId ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}
                >
                  <img
                    src={chat.partnerAvatar || "https://i.stack.imgur.com/l60Hf.png"}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white shrink-0"
                    alt="avatar"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm font-black truncate ${activeChat?.partnerId === chat.partnerId ? 'text-white' : 'text-slate-800'}`}>
                        {chat.partnerName || "Khách Hàng"}
                      </h4>
                      <span className={`text-[10px] font-bold ${activeChat?.partnerId === chat.partnerId ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(chat.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs truncate font-medium ${activeChat?.partnerId === chat.partnerId ? 'text-blue-100' : 'text-slate-500'}`}>
                      {chat.lastMessage?.text || "Gửi một tệp đính kèm"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột Phải: Khung Chat Chi Tiết */}
        <div className="flex-1 flex flex-col bg-white h-full relative">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4">💬</div>
              <h3 className="text-xl font-black text-slate-800">Trung Tâm Phản Hồi</h3>
              <p className="text-slate-500 font-medium text-sm mt-2">Chọn một cuộc hội thoại bên trái để bắt đầu hỗ trợ khách hàng.</p>
            </div>
          ) : (
            <>
              {/* Header Khung Chat */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 shadow-sm z-10 bg-white">
                <img src={activeChat.partnerAvatar || "https://i.stack.imgur.com/l60Hf.png"} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                <div>
                  <h3 className="font-black text-slate-900">{activeChat.partnerName || "Khách Hàng"}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang trực tuyến</span>
                  </div>
                </div>
              </div>

              {/* Lịch sử tin nhắn */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/80 custom-scrollbar">
                {messages.map((msg, idx) => {
                  const senderObj = msg.sender || msg.from || msg.senderId;
                  const senderId = senderObj ? (typeof senderObj === 'object' ? String(senderObj._id || senderObj.id || "") : String(senderObj)) : "";

                  // 🚀 CÔNG THỨC CHỐNG CƯỚP CÔNG (BẢN ADMIN)
                  // Lật ngược: Nếu ID người gửi KHÔNG PHẢI là ID của ông khách hàng (partnerId), thì 100% nó là tin của Admin!
                  const isCustomer = senderId === String(activeChat?.partnerId);
                  const isAdminMsg = msg.isAdminMsg !== undefined ? msg.isAdminMsg : !isCustomer;

                  const timeString = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
                  const senderName = isAdminMsg ? "Admin 2FAST.SHOP" : (activeChat?.partnerName || "Khách hàng");

                  return (
                    <div key={idx} className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'} mb-3`}>
                      <div className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                        {senderName} {timeString && `• ${timeString}`}
                      </div>
                      <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isAdminMsg
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                        }`}>
                        {msg.messageContent?.text || msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Ô nhập tin nhắn */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
                <button type="button" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Nhập tin nhắn hỗ trợ ${activeChat.partnerName}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}