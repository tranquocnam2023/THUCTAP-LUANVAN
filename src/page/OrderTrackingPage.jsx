import React, { useState } from 'react';
import api from '../services/api';
import OrderDetailsTracker from '../components/OrderDetailsTracker';
import Breadcrumb from '../components/Breadcrumb';
import { Search, FileSearch, ArrowLeft, AlertCircle } from 'lucide-react';

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Gọi API tra cứu không cần đăng nhập
      const res = await api.get(`/Order/track?orderId=${orderId.trim()}&phoneNumber=${phone.trim()}`);
      if (res) {
        setOrder(res);
      } else {
        setError('Không tìm thấy thông tin đơn hàng.');
      }
    } catch (err) {
      console.error('Lỗi tra cứu đơn hàng:', err);
      setError(
        typeof err === 'string' 
          ? err 
          : err.message || 'Mã đơn hàng không tồn tại hoặc số điện thoại không khớp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setOrderId('');
    setPhone('');
    setError('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Tra cứu đơn hàng' }]} />

      {order ? (
        // Đã tìm thấy đơn hàng: Hiển thị giao diện Theo dõi chi tiết
        <div className="space-y-4">
          <div className="flex justify-start">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-tight"
            >
              <ArrowLeft size={14} />
              Tra cứu đơn hàng khác
            </button>
          </div>
          <OrderDetailsTracker order={order} />
        </div>
      ) : (
        // Chưa tra cứu: Hiển thị Form nhập liệu tra cứu
        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm max-w-lg mx-auto space-y-8 animate-in zoom-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-md shadow-blue-50">
              <FileSearch size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tra cứu trạng thái đơn hàng</h1>
            <p className="text-xs text-gray-400 font-bold max-w-xs mx-auto">
              Dành cho khách hàng vãng lai không có mật khẩu. Vui lòng nhập Mã đơn hàng và Số điện thoại để tra cứu nhanh.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in shake duration-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTrack} className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mã đơn hàng *</label>
              <input 
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ví dụ: 12"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400 text-sm"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại mua hàng *</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại đã dùng đặt hàng..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl text-sm uppercase shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'ĐANG TÌM KIẾM...' : 'TRA CỨU NGAY'}
              {!loading && <Search size={16} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
