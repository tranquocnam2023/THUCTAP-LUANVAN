import React, { useState } from 'react';
import { Search, Trash2, Star, Calendar, MessageSquare, Filter } from 'lucide-react';
import { MOCK_REVIEWS } from '../utils/mockData';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const filteredReviews = reviews.filter(rev => 
    rev.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Quản Lý Đánh Giá</h2>
          <p className="text-sm text-gray-500 font-medium italic">Theo dõi phản hồi từ khách hàng về sản phẩm</p>
        </div>
      </div>

      {/* Filter Section - Based on screenshot but simplified */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[300px] space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lọc theo mã đánh giá / user / email / nội dung...</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Nhập thông tin cần tìm..."
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày bắt đầu</label>
            <input 
              type="date" 
              className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày kết thúc</label>
            <input 
              type="date" 
              className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-600"
            />
          </div>

          <button className="px-8 py-3.5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95">
            Xóa lọc
          </button>
          
          <button className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95">
            Làm mới
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-500" />
            Danh sách đánh giá ({filteredReviews.length} bản ghi)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Mã đánh giá</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Người dùng</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Biến thể</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Số sao</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Nội dung</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Ngày tạo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Ngày sửa</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 text-gray-400 font-bold">#{rev.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{rev.user}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{rev.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-blue-600">{rev.variantId}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-0.5 text-yellow-400">
                        <span className="font-black text-sm mr-1 text-gray-900">{rev.stars}</span>
                        <Star size={14} fill="currentColor" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-600 max-w-[200px] truncate" title={rev.content}>
                        {rev.content}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-500 whitespace-nowrap">{rev.createdAt}</td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-500 whitespace-nowrap">{rev.updatedAt}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleDelete(rev.id)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-8 py-20 text-center bg-white">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <MessageSquare size={64} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold">Không tìm thấy đánh giá nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-tighter">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50" disabled>Trang trước</button>
            <span className="flex items-center px-4">Trang 1 / 1</span>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50" disabled>Trang sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
