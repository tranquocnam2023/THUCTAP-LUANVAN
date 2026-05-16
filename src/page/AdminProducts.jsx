import React, { useState, useEffect } from 'react';
import { Package, Layout, Bell, ShoppingCart, Settings2, Plus, Edit, Trash2, X, FolderTree } from 'lucide-react';
// import { TRANSACTIONS_MOCK } from '../utils/constants'; // Removed invalid import
import AdminProductVariants from '../components/AdminProductVariants';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';

// gọi API
const TRANSACTIONS = [
  { id: 'IMPORT_SUPPLIER', name: 'Nhập từ nhà cung cấp', type: 'IN', bgColor: '#F4F7FE', textColor: '#4318FF', borderColor: '#4318FF' },
  { id: 'IMPORT_RETURN', name: 'Nhập hàng khách trả', type: 'IN', bgColor: '#01B574', textColor: '#FFFFFF', borderColor: '#01B574' },
  { id: 'EXPORT_SELL', name: 'Xuất bán hàng', type: 'OUT', bgColor: '#FFFFFF', textColor: '#2B3674', borderColor: '#E0E5F2' },
  { id: 'EXPORT_DEFECT', name: 'Xuất trả hàng lỗi cho NCC', type: 'OUT', bgColor: '#EE5D50', textColor: '#FFFFFF', borderColor: '#EE5D50' }
];

export default function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [activeTxTab, setActiveTxTab] = useState(null);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  
  // State for Product CRUD
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    stockQuantity: 0,
    categoryId: '',
    description: '',
    image: ''
  });

  // Khởi tạo các hook
  const { formatCurrency, formatNumber } = useFormat();
  const { 
    currentData: paginatedProducts, 
    currentPage, 
    totalPages, 
    nextPage, 
    prevPage, 
    goToPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination(products, 5); // Hiển thị 5 sản phẩm mỗi trang

  const fetchProducts = async () => {
      const category = categories.find(c => c.name === selectedBrand);
      if (category) {
        try {
          const data = await productService.getByCategory(category.id);
          setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Lỗi tải sản phẩm:", err);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
  };

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await categoryService.getAll();
        if (data && data.length > 0) {
          setCategories(data);
          setSelectedBrand(data[0].name);
        }
      } catch (error) {
        console.log("Sử dụng dữ liệu ảo cho Danh mục");
      }
    };
    
    fetchCategoriesData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, categories]);

  const stats = [
    { label: 'Tổng sản phẩm', value: products.length, icon: 'Package', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
    { label: 'Giá trị tồn kho', value: products.reduce((acc, p) => acc + ((p.basePrice || p.price || 0) * (p.stock || p.stockQuantity || 0)), 0), icon: 'Layout', bgColor: '#FFFFFF', textColor: '#2B3674', isCurrency: true, iconColor: '#01B574' },
    { label: 'Sắp hết hàng', value: products.filter(p => (p.stock || p.stockQuantity || 0) < 5).length, icon: 'Bell', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#FFB547' },
    { label: 'Đã bán tháng này', value: 24, icon: 'ShoppingCart', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#39B8FF' },
  ];

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name,
        price: product.basePrice || product.price || 0,
        originalPrice: product.originalPrice || product.basePrice || product.price || 0,
        stockQuantity: product.stock || product.stockQuantity || 0,
        categoryId: product.categoryId || (categories.find(c => c.name === selectedBrand)?.id || ''),
        description: product.description || '',
        image: product.thumbnailImage || product.image || ''
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        price: 0,
        originalPrice: 0,
        stockQuantity: 0,
        categoryId: categories.find(c => c.name === selectedBrand)?.id || '',
        description: '',
        image: ''
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      // Map frontend form data to backend DTO structure
      const payload = {
        name: productFormData.name,
        slug: productFormData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: productFormData.description,
        basePrice: productFormData.price,
        stock: productFormData.stockQuantity,
        isActive: true,
        shopId: 1, // Defaulting to shop 1 for now
        categoryId: parseInt(productFormData.categoryId) || 1,
        thumbnailImage: productFormData.image || "",
        mainImage: productFormData.image,
        images: ""
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productService.create(payload);
        alert('Thêm sản phẩm mới thành công!');
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Lưu sản phẩm thất bại:', error.response?.data || error.message);
      alert('Có lỗi xảy ra khi lưu sản phẩm: ' + (JSON.stringify(error.response?.data) || error.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productService.delete(id);
        alert('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể xóa sản phẩm'));
      }
    }
  };

  // Tái sử dụng form giao dịch chung cho cả 4 loại
  const renderReusableTransactionForm = () => {
    if (!activeTxTab) return null;
    const txConf = TRANSACTIONS.find(t => t.id === activeTxTab);

    return (
      <div className="bg-[#FFFFFF] p-6 rounded-[20px] shadow-sm animate-fade-in mb-8">
        <div className="flex justify-between items-center mb-6 border-b border-[#E0E5F2] pb-4">
          <h3 className="text-xl font-bold text-[#2B3674] flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-3" style={{ backgroundColor: txConf.bgColor === '#FFFFFF' ? '#A3AED0' : txConf.bgColor }}></span>
            {txConf.name} ({selectedBrand})
          </h3>
          <button
            onClick={() => setActiveTxTab(null)}
            className="text-sm font-bold px-4 py-2 rounded-xl transition-colors hover:bg-[#F4F7FE] text-[#A3AED0] hover:text-[#2B3674]"
          >
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Chọn sản phẩm</label>
            <select className="w-full border border-[#E0E5F2] text-[#A3AED0] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]">
              <option>-- Chọn sản phẩm {selectedBrand} --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Số lượng</label>
            <input type="number" min="1" defaultValue="1" className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">
              {txConf.type === 'IN' ? 'Giá nhập (VNĐ)' : 'Giá xuất/Bán (VNĐ)'}
            </label>
            <input type="text" placeholder="VD: 25.000.000" className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Ghi chú</label>
            <input type="text" placeholder="Lý do, mã phiếu..." className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 shadow-sm bg-[#4318FF] text-[#FFFFFF]"
          >
            Xác nhận {txConf.type === 'IN' ? 'Nhập Kho' : 'Xuất Kho'}
          </button>
        </div>
      </div>
    );
  };

  if (selectedProductForVariants) {
    return <AdminProductVariants product={selectedProductForVariants} onBack={() => setSelectedProductForVariants(null)} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      {/* Sidebar chọn thương hiệu */}
      <div className="w-full md:w-64 flex-shrink-0 bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden h-fit">
        <div className="px-6 py-5 border-b border-[#E0E5F2] font-bold text-[#2B3674] flex items-center text-lg">
          <FolderTree className="w-5 h-5 mr-3 text-[#4318FF]" />
          Thương hiệu
        </div>
        <div className="flex flex-col p-3">
          {categories.length > 0 ? (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => { setSelectedBrand(category.name); setActiveTxTab(null); }}
                className={`px-4 py-3 text-left rounded-xl mb-1 transition-all text-sm font-bold ${selectedBrand === category.name
                    ? 'bg-[#F4F7FE] text-[#4318FF]'
                    : 'text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#2B3674]'
                  }`}
              >
                {category.name}
              </button>
            ))
          ) : (
            <div className="text-center p-4 text-sm text-[#A3AED0]">Đang tải API...</div>
          )}
        </div>
      </div>

      {/* Khu vực Chính: Chức năng nhập xuất & Danh sách */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý kho: {selectedBrand}</h2>
          <button 
            onClick={() => handleOpenProductModal()}
            className="flex items-center gap-2 px-5 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item, i) => {
            return (
              <div 
                key={i} 
                className="p-5 rounded-[20px] shadow-sm transition-all hover:shadow-md flex items-center justify-between h-28 bg-[#FFFFFF]"
              >
                <div className="flex flex-col">
                  <p className="text-[12px] font-bold text-[#A3AED0] mb-1">
                    {item.label}
                  </p>
                  <h3 className="text-2xl font-bold text-[#2B3674] leading-none">
                    {item.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#F4F7FE] flex items-center justify-center flex-shrink-0">
                   {item.icon === 'Package' && <Package className="text-[#4318FF]" size={24} />}
                   {item.icon === 'Layout' && <Layout className="text-[#01B574]" size={24} />}
                   {item.icon === 'Bell' && <Bell className="text-[#FFB547]" size={24} />}
                   {item.icon === 'ShoppingCart' && <ShoppingCart className="text-[#39B8FF]" size={24} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Nút điều hướng Nhập/Xuất */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {TRANSACTIONS.map(tx => (
            <button
              key={tx.id}
              onClick={() => setActiveTxTab(tx.id)}
              className={`p-4 rounded-[20px] font-bold text-sm transition-all transform hover:-translate-y-1 ${activeTxTab === tx.id ? 'ring-2 ring-offset-2 ring-[#4318FF] shadow-md' : 'shadow-sm border border-[#E0E5F2]'}`}
              style={{ backgroundColor: tx.bgColor, color: tx.textColor }}
            >
              <div className="flex flex-col items-center justify-center w-full h-full text-center">
                <span>{tx.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Hiển thị form tái sử dụng hoặc danh sách mặc định */}
        {activeTxTab ? renderReusableTransactionForm() : (
          <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm p-6 flex-1 flex flex-col mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
              <h3 className="text-lg font-bold text-[#2B3674]">Danh sách tồn kho {selectedBrand}</h3>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-[#A3AED0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm theo tên..." 
                  className="bg-[#F4F7FE] border-none rounded-full pl-10 pr-4 py-2.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#4318FF] text-[#2B3674] placeholder-[#A3AED0]" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E0E5F2] text-[#A3AED0] text-[12px] font-bold">
                    <th className="pb-3 px-2">Sản phẩm</th>
                    <th className="pb-3 px-2 text-center">Tồn kho</th>
                    <th className="pb-3 px-2">Giá bán</th>
                    <th className="pb-3 px-2 text-center">Trạng thái</th>
                    <th className="pb-3 px-2 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className="border-b border-[#E0E5F2] hover:bg-[#F4F7FE] transition-colors group">
                        <td className="py-4 px-2 font-bold text-[#2B3674]">{product.name}</td>
                        <td className="py-4 px-2 text-center font-bold text-[#2B3674]">{product.stock ?? product.stockQuantity ?? 0}</td>
                        <td className="py-4 px-2 font-bold text-[#2B3674]">{formatCurrency(product.basePrice ?? product.price ?? 0)}</td>
                        <td className="py-4 px-2 text-center">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${(product.stock ?? product.stockQuantity ?? 0) > 0 ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                            {(product.stock ?? product.stockQuantity ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setSelectedProductForVariants(product)}
                              className="p-2 text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] rounded-lg transition-all" 
                              title="Quản lý biến thể"
                            >
                              <Settings2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleOpenProductModal(product)}
                              className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-lg transition-all" 
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-lg transition-all" 
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 bg-white">
                        Chưa có dữ liệu sản phẩm cho {selectedBrand}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm font-bold text-[#A3AED0]">
                Hiển thị {startIndex}-{endIndex} trên {totalItems} sản phẩm
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl text-sm font-bold hover:bg-[#E0E5F2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  TRƯỚC
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-[#4318FF] text-[#FFFFFF] shadow-md' : 'bg-transparent text-[#A3AED0] hover:bg-[#F4F7FE]'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl text-sm font-bold hover:bg-[#E0E5F2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SAU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product CRUD Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F4F7FE]">
              <h3 className="text-xl font-bold text-[#2B3674]">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[#A3AED0] hover:text-[#EE5D50] hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên sản phẩm</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá bán (VNĐ)</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({...productFormData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá gốc (VNĐ)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.originalPrice}
                    onChange={(e) => setProductFormData({...productFormData, originalPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Số lượng tồn</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.stockQuantity}
                    onChange={(e) => setProductFormData({...productFormData, stockQuantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Danh mục</label>
                  <select 
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] bg-[#FFFFFF]"
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({...productFormData, categoryId: e.target.value})}
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Link hình ảnh</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    placeholder="https://..."
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({...productFormData, image: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Mô tả ngắn</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] h-24 resize-none"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-3 bg-[#F4F7FE] text-[#2B3674] rounded-xl font-bold hover:bg-[#E0E5F2] transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95"
                >
                  {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
