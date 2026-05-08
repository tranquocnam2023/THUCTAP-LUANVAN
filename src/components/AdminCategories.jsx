import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Image as ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_CATEGORIES } from '../utils/mockData';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';

export default function AdminCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
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
        if (Array.isArray(data) && data.length > 0) setCategories(data);
      })
      .catch(err => console.log("Sử dụng dữ liệu ảo cho Danh mục"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
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
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
          >
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
                  <React.Fragment key={cat.id}>
                    <tr className="hover:bg-blue-50/30 transition-colors group">
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
                          {/* Expand/Collapse button */}
                          <button
                            onClick={() => handleToggleProducts(cat)}
                            className="p-2.5 text-gray-500 hover:text-blue-600 rounded-xl transition-all"
                            title={expandedCategories[cat.id] ? 'Thu gọn' : 'Xem sản phẩm'}
                          >
                            {expandedCategories[cat.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded product list row */}
                    {expandedCategories[cat.id] && (
                      <tr className="bg-blue-50/40 animate-in slide-in-from-top-2 duration-300">
                        <td colSpan="4" className="px-8 py-6">
                          {loadingProducts[cat.id] ? (
                            <div className="flex items-center justify-center py-4 text-blue-500 gap-3">
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="font-bold text-sm">Đang tải sản phẩm...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryProducts[cat.id] && categoryProducts[cat.id].length > 0 ? (
                                categoryProducts[cat.id].map((prod) => (
                                  <div key={prod.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-all group/item">
                                    <div className="w-16 h-16 rounded-xl bg-gray-50 p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {prod.thumbnailImage ? (
                                        <img src={prod.thumbnailImage} alt={prod.name} className="w-full h-full object-contain group-hover/item:scale-110 transition-transform" />
                                      ) : (
                                        <ImageIcon className="text-gray-200" size={24} />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 truncate text-sm">{prod.name}</h4>
                                      <p className="text-blue-600 font-black text-sm mt-0.5">
                                        {prod.basePrice?.toLocaleString('vi-VN')} ₫
                                      </p>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${prod.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                          {prod.stock > 0 ? `Còn ${prod.stock}` : 'Hết hàng'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full py-8 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-2xl border-2 border-dashed border-gray-100">
                                  <FolderOpen size={32} strokeWidth={1.5} className="mb-2 opacity-30" />
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

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-black">{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Tên danh mục</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="VD: iPhone, Samsung..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
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
