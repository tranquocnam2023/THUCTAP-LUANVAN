import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Image as ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import { brandService } from '../services/brandService';
import { productService } from '../services/productService';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  
  // New states for expanding brands
  const [expandedBrands, setExpandedBrands] = useState({}); // { [id]: boolean }
  const [brandProducts, setBrandProducts] = useState({}); // { [id]: [] }
  const [loadingProducts, setLoadingProducts] = useState({}); // { [id]: boolean }

  // Fallback images for phone brands
  const brandImages = {
    'iPhone': 'https://applecenter.com.vn/uploads/2023/iphone-15-pro-max-black-titanium.jpg',
    'Samsung': 'https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-s928-sm-s928bztqxxv-539311681',
    'Xiaomi': 'https://genk.mediacdn.vn/139269124445442048/2023/10/26/xiaomi-14-pro-titanium-edition-02-16983333333332029706346.jpg',
    'Oppo': 'https://image.oppo.com/content/dam/oppo/common/mkt/v2-2/reno11-pro-5g/navigation/reno11-pro-navigation-white.png',
  };

  const fetchBrands = () => {
    setLoading(true);
    brandService.getAll()
      .then(data => {
        setBrands(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Lỗi tải thương hiệu:", err);
        setBrands([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ 
        name: brand.name,
        slug: brand.slug || brand.name.toLowerCase().replace(/ /g, '-'),
        description: brand.description || '',
        iconUrl: brand.iconUrl || '',
        metaTitle: brand.metaTitle || brand.name,
        metaDescription: brand.metaDescription || '',
        isActive: brand.isActive !== undefined ? brand.isActive : true
      });
    } else {
      setEditingBrand(null);
      setFormData({ 
        name: '',
        slug: '',
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
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
      };

      if (editingBrand) {
        await brandService.update(editingBrand.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await brandService.create(payload);
        alert('Thêm mới thành công!');
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error('Lưu thương hiệu thất bại:', error);
      alert('Có lỗi xảy ra: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProducts = async (brand) => {
    const brandId = brand.id;
    const isExpanded = expandedBrands[brandId];
    
    setExpandedBrands(prev => ({ ...prev, [brandId]: !isExpanded }));
    
    if (!isExpanded && !brandProducts[brandId]) {
      setLoadingProducts(prev => ({ ...prev, [brandId]: true }));
      try {
        let products;
        try {
          products = await productService.getByCategory(brandId);
        } catch (apiErr) {
          console.warn('Endpoint getByCategory failed, falling back to getAll + filter', apiErr);
          const allProducts = await productService.getAll();
          products = allProducts.filter(p => p.categoryId === brandId || p.CategoryId === brandId);
        }
        setBrandProducts(prev => ({ ...prev, [brandId]: products }));
      } catch (err) {
        console.error('Failed to load products for brand', brandId, err);
        setBrandProducts(prev => ({ ...prev, [brandId]: [] }));
      } finally {
        setLoadingProducts(prev => ({ ...prev, [brandId]: false }));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      try {
        await brandService.delete(id);
        alert('Xóa thành công!');
        fetchBrands();
      } catch (error) {
        alert('Không thể xóa thương hiệu này. Có thể nó đang chứa sản phẩm.');
      }
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý Thương Hiệu</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Quản lý danh sách các thương hiệu điện thoại trong hệ thống</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên thương hiệu..."
              className="w-full pl-11 pr-4 py-3 border border-[#E0E5F2] rounded-md focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] font-medium text-[#2B3674] placeholder-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-md font-bold hover:bg-[#3911D1] transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Thêm thương hiệu</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#FFFFFF] rounded-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] w-24">ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Tên thương hiệu</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <React.Fragment key={brand.id}>
                    <tr className="hover:bg-[#F4F7FE] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[#A3AED0] font-bold">#{brand.id}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-base font-bold text-[#2B3674]">{brand.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleProducts(brand)}
                            className="p-2 text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] rounded-md transition-all"
                            title={expandedBrands[brand.id] ? 'Thu gọn' : 'Xem sản phẩm'}
                          >
                            {expandedBrands[brand.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(brand)}
                            className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-md transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-md transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedBrands[brand.id] && (
                      <tr className="bg-[#F4F7FE] animate-in slide-in-from-top-2 duration-300">
                        <td colSpan="3" className="px-6 py-4">
                          {loadingProducts[brand.id] ? (
                            <div className="flex items-center justify-center py-4 text-[#4318FF] gap-3">
                              <div className="w-5 h-5 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
                              <span className="font-bold text-sm">Đang tải sản phẩm...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {brandProducts[brand.id] && brandProducts[brand.id].length > 0 ? (
                                brandProducts[brand.id].map((prod) => (
                                  <div key={prod.id} className="bg-[#FFFFFF] p-4 rounded-md flex gap-4 transition-all group/item border border-[#E0E5F2]">
                                    <div className="w-16 h-16 rounded-md bg-[#F4F7FE] p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(prod.availableStock ?? prod.totalStock ?? prod.stock ?? prod.stockQuantity ?? 0) > 0 ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                                          {(prod.availableStock ?? prod.totalStock ?? prod.stock ?? prod.stockQuantity ?? 0) > 0 ? `Còn ${prod.availableStock ?? prod.totalStock ?? prod.stock ?? prod.stockQuantity ?? 0}` : 'Hết hàng'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full py-8 flex flex-col items-center justify-center text-[#A3AED0] bg-[#FFFFFF] rounded-md border-2 border-dashed border-[#E0E5F2]">
                                  <FolderOpen size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                                  <p className="text-sm font-bold">Thương hiệu này chưa có sản phẩm nào</p>
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
                  <td colSpan="3" className="px-6 py-20 text-center bg-[#FFFFFF]">
                    <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                      <FolderOpen size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy thương hiệu nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#E0E5F2] flex items-center justify-between text-sm font-bold text-[#A3AED0]">
          <span>Tổng cộng: {filteredBrands.length} thương hiệu</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-md hover:bg-[#E0E5F2] transition-colors disabled:opacity-50" disabled>TRƯỚC</button>
            <button className="px-4 py-2 bg-[#4318FF] text-[#FFFFFF] rounded-md">1</button>
            <button className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-md hover:bg-[#E0E5F2] transition-colors disabled:opacity-50" disabled>SAU</button>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-md w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F4F7FE]">
              <h3 className="text-xl font-bold text-[#2B3674]">{editingBrand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A3AED0] hover:text-[#4318FF] transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên thương hiệu</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-md focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all font-medium text-[#2B3674]"
                  placeholder="VD: iPhone, Samsung..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-[#F4F7FE] text-[#2B3674] rounded-md font-bold hover:bg-[#E0E5F2] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-md font-bold hover:bg-[#3911D1] transition-all active:scale-95"
                >
                  {editingBrand ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
