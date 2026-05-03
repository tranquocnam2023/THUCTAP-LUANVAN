import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { MOCK_CATEGORIES } from '../utils/mockData';

export default function AdminCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback images for phone brands
  const brandImages = {
    'iPhone': 'https://applecenter.com.vn/uploads/2023/iphone-15-pro-max-black-titanium.jpg',
    'Samsung': 'https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-s928-sm-s928bztqxxv-539311681',
    'Xiaomi': 'https://genk.mediacdn.vn/139269124445442048/2023/10/26/xiaomi-14-pro-titanium-edition-02-16983333333332029706346.jpg',
    'Oppo': 'https://image.oppo.com/content/dam/oppo/common/mkt/v2-2/reno11-pro-5g/navigation/reno11-pro-navigation-white.png',
  };

  useEffect(() => {
    categoryService.getAll()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCategories(data);
      })
      .catch(err => console.log("Sử dụng dữ liệu ảo cho Danh mục"));
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Danh Mục</h2>
          <p className="text-sm text-gray-500 font-medium">Quản lý danh sách các dòng điện thoại trong hệ thống</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên danh mục..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
            <Plus size={18} />
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest w-24">ID</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest w-32">Hình</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-center">Tên danh mục</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-gray-900/5">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-gray-400 font-bold">#{cat.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 p-2 flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                        {brandImages[cat.name] ? (
                          <img src={brandImages[cat.name]} alt={cat.name} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-lg font-black text-gray-800">{cat.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chỉnh sửa">
                          <Edit size={18} />
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center bg-white">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <FolderOpen size={64} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold">Không tìm thấy danh mục nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
          <span>Tổng cộng: {filteredCategories.length} danh mục</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50" disabled>TRƯỚC</button>
            <button className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-xl shadow-lg shadow-blue-200">1</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:text-gray-900 transition-colors shadow-sm">SAU</button>
          </div>
        </div>
      </div>
    </div>
  );
}
