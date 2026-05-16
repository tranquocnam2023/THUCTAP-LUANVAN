import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, LayoutGrid, X } from 'lucide-react';
import { shopTypeService } from '../services/shopTypeService';

export default function AdminShopTypes() {
  const [shopTypes, setShopTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShopType, setEditingShopType] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    isActive: true 
  });
  const [loading, setLoading] = useState(false);

  const fetchShopTypes = () => {
    setLoading(true);
    shopTypeService.getAll()
      .then(data => {
        if (Array.isArray(data)) setShopTypes(data);
      })
      .catch(err => console.error("Lỗi tải ShopTypes:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShopTypes();
  }, []);

  const handleOpenModal = (shopType = null) => {
    if (shopType) {
      setEditingShopType(shopType);
      setFormData({ 
        name: shopType.name,
        slug: shopType.slug || shopType.name.toLowerCase().replace(/ /g, '-'),
        isActive: shopType.isActive !== undefined ? shopType.isActive : true
      });
    } else {
      setEditingShopType(null);
      setFormData({ 
        name: '',
        slug: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-')
      };

      if (editingShopType) {
        await shopTypeService.update(editingShopType.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await shopTypeService.create(payload);
        alert('Thêm mới thành công!');
      }
      setIsModalOpen(false);
      fetchShopTypes();
    } catch (error) {
      console.error('Lưu ShopType thất bại:', error);
      alert('Có lỗi xảy ra: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại cửa hàng này?')) {
      try {
        await shopTypeService.delete(id);
        alert('Xóa thành công!');
        fetchShopTypes();
      } catch (error) {
        alert('Không thể xóa. Có thể nó đang chứa danh mục hoặc cửa hàng.');
      }
    }
  };

  const filteredShopTypes = shopTypes.filter(st =>
    st.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý Loại Cửa Hàng</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Phân loại hệ thống cửa hàng</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên loại..."
              className="w-full pl-11 pr-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] shadow-sm font-medium text-[#2B3674] placeholder-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Thêm Loại Mới</span>
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredShopTypes.length > 0 ? (
          filteredShopTypes.map((st) => (
            <div key={st.id} className="bg-[#FFFFFF] rounded-[20px] shadow-sm hover:shadow-md transition-all border border-[#E0E5F2] overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#4318FF] group-hover:scale-105 transition-transform">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenModal(st)}
                      className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(st.id)}
                      className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2B3674] mb-1">{st.name}</h3>
                  <p className="text-[12px] text-[#A3AED0] font-medium">Slug: {st.slug}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${st.isActive ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                      {st.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                    <span className="text-[12px] text-[#A3AED0] font-bold">ID: #{st.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-[#A3AED0] bg-[#FFFFFF] rounded-[20px] shadow-sm border border-[#E0E5F2]">
            <LayoutGrid size={48} strokeWidth={1} className="mb-4 opacity-50" />
            <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy loại cửa hàng nào</p>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F4F7FE]">
              <h3 className="text-xl font-bold text-[#2B3674]">{editingShopType ? 'Cập nhật Loại' : 'Thêm Loại Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A3AED0] hover:text-[#4318FF] transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên loại cửa hàng</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all font-medium text-[#2B3674]"
                  placeholder="VD: Điện thoại, Phụ kiện..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-5 h-5 rounded border-[#E0E5F2] text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-bold text-[#2B3674] cursor-pointer">Kích hoạt hoạt động</label>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-[#F4F7FE] text-[#2B3674] rounded-xl font-bold hover:bg-[#E0E5F2] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : (editingShopType ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
