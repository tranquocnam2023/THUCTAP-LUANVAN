import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Image as ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
// import { MOCK_CATEGORIES } from '../utils/mockData'; // Removed mock data
import { categoryService } from '../services/categoryService';
import { shopTypeService } from '../services/shopTypeService';
import { productService } from '../services/productService';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [shopTypes, setShopTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New states for expanding categories
  const [expandedCategories, setExpandedCategories] = useState({}); // { [id]: boolean }
  const [categoryProducts, setCategoryProducts] = useState({}); // { [id]: [] }
  const [loadingProducts, setLoadingProducts] = useState({}); // { [id]: boolean }

  // Fallback images for phone brands
  const brandImages = {
    'iPhone': 'https://applecenter.com.vn/uploads/2023/iphone-15-pro-max-black-titanium.jpg',
    'Samsung': 'https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-s928-sm-s928bztqxxv-539311681',
    'Xiaomi': 'https://genk.mediacdn.vn/139269124445442048/2023/10/26/xiaomi-14-pro-titanium-edition-02-16983333333332029706346.jpg',
    'Oppo': 'https://image.oppo.com/content/dam/oppo/common/mkt/v2-2/reno11-pro-5g/navigation/reno11-pro-navigation-white.png',
  };

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAll()
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Lỗi tải danh mục:", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
    // Tải danh sách ShopTypes để chọn
    shopTypeService.getAll()
      .then(data => {
        if (Array.isArray(data)) setShopTypes(data);
      })
      .catch(err => console.error("Lỗi tải ShopTypes cho dropdown:", err));
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/ /g, '-'),
        shopTypeId: category.shopTypeId || 1,
        description: category.description || '',
        iconUrl: category.iconUrl || '',
        metaTitle: category.metaTitle || category.name,
        metaDescription: category.metaDescription || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setEditingCategory(null);
      setFormData({ 
        name: '',
        slug: '',
        shopTypeId: 1,
        description: '',
        iconUrl: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi (đảm bảo slug không trống)
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
        shopTypeId: formData.shopTypeId || 1
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await categoryService.create(payload);
        alert('Thêm mới thành công!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Lưu danh mục thất bại:', error);
      alert('Có lỗi xảy ra: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProducts = async (category) => {
    const catId = category.id;
    const isExpanded = expandedCategories[catId];
    
    // Toggle expansion state
    setExpandedCategories(prev => ({ ...prev, [catId]: !isExpanded }));
    
    if (!isExpanded && !categoryProducts[catId]) {
      // If expanding and products not yet loaded, fetch them
      setLoadingProducts(prev => ({ ...prev, [catId]: true }));
      try {
        let products;
        try {
          products = await productService.getByCategory(catId);
        } catch (apiErr) {
          console.warn('Endpoint getByCategory failed, falling back to getAll + filter', apiErr);
          // Fallback: Fetch all products and filter
          const allProducts = await productService.getAll();
          console.log('All products fetched:', allProducts);
          products = allProducts.filter(p => p.categoryId === catId || p.CategoryId === catId);
          console.log('Filtered products for category', catId, ':', products);
        }
        setCategoryProducts(prev => ({ ...prev, [catId]: products }));
      } catch (err) {
        console.error('Failed to load products for category', catId, err);
        setCategoryProducts(prev => ({ ...prev, [catId]: [] }));
      } finally {
        setLoadingProducts(prev => ({ ...prev, [catId]: false }));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await categoryService.delete(id);
        alert('Xóa thành công!');
        fetchCategories();
      } catch (error) {
        alert('Không thể xóa danh mục này. Có thể nó đang chứa sản phẩm.');
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý Danh Mục</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Quản lý danh sách các dòng điện thoại trong hệ thống</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên danh mục..."
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
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] w-24">ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] w-32">Hình</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Tên danh mục</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr className="hover:bg-[#F4F7FE] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[#A3AED0] font-bold">#{cat.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-[20px] bg-[#F4F7FE] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                          {brandImages[cat.name] ? (
                            <img src={brandImages[cat.name]} alt={cat.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <ImageIcon className="text-[#A3AED0]" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-base font-bold text-[#2B3674]">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleProducts(cat)}
                            className="p-2 text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] rounded-lg transition-all"
                            title={expandedCategories[cat.id] ? 'Thu gọn' : 'Xem sản phẩm'}
                          >
                            {expandedCategories[cat.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCategories[cat.id] && (
                      <tr className="bg-[#F4F7FE] animate-in slide-in-from-top-2 duration-300">
                        <td colSpan="4" className="px-6 py-4">
                          {loadingProducts[cat.id] ? (
                            <div className="flex items-center justify-center py-4 text-[#4318FF] gap-3">
                              <div className="w-5 h-5 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
                              <span className="font-bold text-sm">Đang tải sản phẩm...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryProducts[cat.id] && categoryProducts[cat.id].length > 0 ? (
                                categoryProducts[cat.id].map((prod) => (
                                  <div key={prod.id} className="bg-[#FFFFFF] p-4 rounded-[20px] shadow-sm flex gap-4 hover:shadow-md transition-all group/item border border-[#E0E5F2]">
                                    <div className="w-16 h-16 rounded-[15px] bg-[#F4F7FE] p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {prod.thumbnailImage ? (
                                        <img src={prod.thumbnailImage} alt={prod.name} className="w-full h-full object-contain group-hover/item:scale-105 transition-transform" />
                                      ) : (
                                        <ImageIcon className="text-[#A3AED0]" size={24} />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <h4 className="font-bold text-[#2B3674] truncate text-sm">{prod.name}</h4>
                                      <p className="text-[#4318FF] font-bold text-sm mt-0.5">
                                        {prod.basePrice?.toLocaleString('vi-VN')} ₫
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.stock > 0 ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                                          {prod.stock > 0 ? `Còn ${prod.stock}` : 'Hết hàng'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full py-8 flex flex-col items-center justify-center text-[#A3AED0] bg-[#FFFFFF] rounded-[20px] border-2 border-dashed border-[#E0E5F2]">
                                  <FolderOpen size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                                  <p className="text-sm font-bold">Danh mục này chưa có sản phẩm nào</p>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center bg-[#FFFFFF]">
                    <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                      <FolderOpen size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy danh mục nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#E0E5F2] flex items-center justify-between text-sm font-bold text-[#A3AED0]">
          <span>Tổng cộng: {filteredCategories.length} danh mục</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl hover:bg-[#E0E5F2] transition-colors disabled:opacity-50" disabled>TRƯỚC</button>
            <button className="px-4 py-2 bg-[#4318FF] text-[#FFFFFF] rounded-xl shadow-md">1</button>
            <button className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl hover:bg-[#E0E5F2] transition-colors disabled:opacity-50" disabled>SAU</button>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F4F7FE]">
              <h3 className="text-xl font-bold text-[#2B3674]">{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A3AED0] hover:text-[#4318FF] transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên danh mục</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all font-medium text-[#2B3674]"
                  placeholder="VD: iPhone, Samsung..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Loại cửa hàng</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all font-medium bg-[#FFFFFF] text-[#2B3674]"
                  value={formData.shopTypeId}
                  onChange={(e) => setFormData({ ...formData, shopTypeId: parseInt(e.target.value) })}
                >
                  <option value="">-- Chọn loại cửa hàng --</option>
                  {shopTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                {shopTypes.length === 0 && (
                  <p className="text-[11px] text-[#EE5D50] mt-1 font-bold italic">* Bạn cần tạo ít nhất một Loại cửa hàng trước.</p>
                )}
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
                  className="flex-1 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95"
                >
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
