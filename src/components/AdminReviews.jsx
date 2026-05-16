import React, { useState, useEffect } from 'react';
import { Search, Trash2, Star, Calendar, MessageSquare, Filter } from 'lucide-react';
// import { MOCK_REVIEWS } from '../utils/mockData'; // Removed mock data
import { reviewService } from '../services/reviewService';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchReviews = () => {
    setLoading(true);
    // Assuming userService.getAllReviews exists, or use appropriate service
    reviewService.getAll()
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Lỗi tải đánh giá:", err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      reviewService.delete(id).then(() => {
        alert('Xóa thành công!');
        fetchReviews();
      }).catch(err => {
        alert('Lỗi xóa đánh giá: ' + err.message);
      });
    }
  };

  const filteredReviews = reviews.filter(rev =>
    String(rev.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(rev.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(rev.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản Lý Đánh Giá</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Theo dõi phản hồi từ khách hàng về sản phẩm</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm border border-[#E0E5F2] p-6 space-y-6">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[300px] space-y-2">
            <label className="text-[12px] font-bold text-[#2B3674] ml-1">Lọc theo mã đánh giá / user / email / nội dung...</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Nhập thông tin cần tìm..."
                className="w-full pl-11 pr-4 py-3 bg-[#FFFFFF] border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all font-medium text-[#2B3674] placeholder-[#A3AED0]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#2B3674] ml-1">Ngày bắt đầu</label>
            <input
              type="date"
              className="px-4 py-3 bg-[#FFFFFF] border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all text-sm font-bold text-[#2B3674]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#2B3674] ml-1">Ngày kết thúc</label>
            <input
              type="date"
              className="px-4 py-3 bg-[#FFFFFF] border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all text-sm font-bold text-[#2B3674]"
            />
          </div>

          <button className="px-6 py-3 bg-[#EE5D50]/10 text-[#EE5D50] rounded-xl font-bold text-sm hover:bg-[#EE5D50]/20 transition-all active:scale-95">
            Xóa lọc
          </button>

          <button className="px-6 py-3 bg-[#F4F7FE] text-[#4318FF] rounded-xl font-bold text-sm hover:bg-[#E0E5F2] transition-all active:scale-95">
            Làm mới
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#E0E5F2]">
          <h3 className="text-sm font-bold text-[#2B3674] flex items-center gap-2">
            <MessageSquare size={18} className="text-[#4318FF]" />
            Danh sách đánh giá ({filteredReviews.length} bản ghi)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Mã đánh giá</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Người dùng</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Biến thể</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Số sao</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Nội dung</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Ngày tạo</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Ngày sửa</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#F4F7FE] transition-colors group">
                    <td className="px-6 py-4 text-[#A3AED0] font-bold">#{rev.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#2B3674]">{rev.user}</span>
                        <span className="text-[12px] text-[#A3AED0] font-medium">{rev.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#4318FF]">{rev.variantId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 text-[#FFB547]">
                        <span className="font-bold text-[#2B3674]">{rev.stars}</span>
                        <Star size={16} fill="currentColor" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#2B3674] max-w-[200px] truncate" title={rev.content}>
                        {rev.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] whitespace-nowrap">{rev.createdAt}</td>
                    <td className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] whitespace-nowrap">{rev.updatedAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center bg-[#FFFFFF]">
                    <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                      <MessageSquare size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy đánh giá nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#E0E5F2] flex items-center justify-between text-[12px] font-bold text-[#A3AED0]">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl hover:bg-[#E0E5F2] transition-colors disabled:opacity-50" disabled>Trang trước</button>
            <span className="flex items-center px-4">Trang 1 / 1</span>
            <button className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl hover:bg-[#E0E5F2] transition-colors disabled:opacity-50" disabled>Trang sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
