import React, { useState, useEffect } from 'react';
import { Package, Layout, Bell, ShoppingCart, Settings2, Plus, Edit, Trash2, X, FolderTree, UploadCloud, Loader2, Link2, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
// import { TRANSACTIONS_MOCK } from '../utils/constants'; // Removed invalid import
import AdminProductVariants from '../components/AdminProductVariants';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { productService } from '../services/productService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';
import { cleanDescription } from '../utils/productHelper';

// gọi API
const TRANSACTIONS = [
  { id: 'IMPORT_SUPPLIER', name: 'Nhập từ nhà cung cấp', type: 'IN', bgColor: '#F4F7FE', textColor: '#4318FF', borderColor: '#4318FF' },
  { id: 'IMPORT_RETURN', name: 'Nhập hàng khách trả', type: 'IN', bgColor: '#01B574', textColor: '#FFFFFF', borderColor: '#01B574' },
  { id: 'EXPORT_SELL', name: 'Xuất bán hàng', type: 'OUT', bgColor: '#FFFFFF', textColor: '#2B3674', borderColor: '#E0E5F2' },
  { id: 'EXPORT_DEFECT', name: 'Xuất trả hàng lỗi cho NCC', type: 'OUT', bgColor: '#EE5D50', textColor: '#FFFFFF', borderColor: '#EE5D50' }
];

export default function AdminProducts() {
  const [categories, setCategories] = useState([]); // Sidebar brands
  const [dbCategories, setDbCategories] = useState([]); // Database categories
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [activeTxTab, setActiveTxTab] = useState(null);

  // State for Product CRUD
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    stockQuantity: 0,
    categoryId: '',
    brandId: '',
    description: '',
    image: ''
  });

  // State for variants inside inventory
  const [variants, setVariants] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState({});

  const [imageInputMethod, setImageInputMethod] = useState('upload'); // 'upload' | 'url'
  const [uploadType, setUploadType] = useState('local'); // 'local' | 'cloud'
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn file dưới 2MB.');
      return;
    }

    setUploading(true);
    try {
      let res;
      if (uploadType === 'local') {
        res = await productService.uploadLocalImage(file);
      } else {
        res = await productService.uploadCloudImage(file);
      }

      if (res && res.url) {
        let finalUrl = res.url;
        // Nếu là local upload và kết quả là relative path, nối thêm domain backend
        if (uploadType === 'local' && finalUrl.startsWith('/')) {
          const apiBase = import.meta.env.VITE_API_URL || 'https://localhost:7279/api';
          const hostBase = apiBase.replace('/api', '');
          finalUrl = `${hostBase}${finalUrl}`;
        }
        
        setProductFormData(prev => ({
          ...prev,
          image: finalUrl
        }));
        alert('Tải ảnh lên thành công!');
      } else {
        alert('Tải ảnh thất bại: Phản hồi từ server không hợp lệ.');
      }
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert('Lỗi khi tải ảnh lên: ' + (err.message || JSON.stringify(err)));
    } finally {
      setUploading(false);
    }
  };

  // State for inventory transactions
  const [txProductId, setTxProductId] = useState('');
  const [txQuantity, setTxQuantity] = useState(1);
  const [txPrice, setTxPrice] = useState('');
  const [txNote, setTxNote] = useState('');

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
        // Do backend không có endpoint getByCategory nên ta lấy tất cả và lọc ở client
        const allProducts = await productService.getAll();
        if (Array.isArray(allProducts)) {
          const filtered = allProducts.filter(p => p.brandId === category.id || p.BrandId === category.id);
          setProducts(filtered);
        } else {
          setProducts([]);
        }
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
        const [brandsData, catsData] = await Promise.all([
          brandService.getAll(),
          categoryService.getAll()
        ]);
        if (brandsData && brandsData.length > 0) {
          setCategories(brandsData);
          setSelectedBrand(brandsData[0].name);
        }
        if (catsData) {
          setDbCategories(catsData);
        }
      } catch (error) {
        console.log("Lỗi tải dữ liệu Thương hiệu/Danh mục", error);
      }
    };

    fetchCategoriesData();
  }, []);

  const fetchVariants = async () => {
    try {
      const { variantService } = await import('../services/variantService');
      const data = await variantService.getAll();
      if (Array.isArray(data)) {
        setVariants(data);
      }
    } catch (err) {
      console.error("Lỗi tải biến thể:", err);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, categories]);

  const stats = [
    { label: 'Tổng sản phẩm', value: products.length, icon: 'Package', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
    { label: 'Giá trị tồn kho', value: products.reduce((acc, p) => acc + ((p.basePrice || p.price || 0) * (p.totalStock ?? p.stock ?? p.stockQuantity ?? 0)), 0), icon: 'Layout', bgColor: '#FFFFFF', textColor: '#2B3674', isCurrency: true, iconColor: '#01B574' },
    { label: 'Sắp hết hàng', value: products.filter(p => (p.totalStock ?? p.stock ?? p.stockQuantity ?? 0) < 5).length, icon: 'Bell', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#FFB547' },
    { label: 'Đã bán tháng này', value: 24, icon: 'ShoppingCart', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#39B8FF' },
  ];

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      const imgUrl = product.thumbnailImage || product.image || '';
      setProductFormData({
        name: product.name,
        price: product.basePrice || product.price || 0,
        originalPrice: product.originalPrice || product.basePrice || product.price || 0,
        stockQuantity: product.totalStock ?? product.stock ?? product.stockQuantity ?? 0,
        categoryId: product.categoryId || product.CategoryId || '',
        brandId: product.brandId || product.BrandId || '',
        description: cleanDescription(product.description),
        image: imgUrl
      });
      // Tự động chọn tab URL nếu đó là link ảnh ngoài (không phải localhost hoặc cloudinary)
      if (imgUrl.startsWith('http') && !imgUrl.includes('localhost') && !imgUrl.includes('cloudinary')) {
        setImageInputMethod('url');
      } else {
        setImageInputMethod('upload');
      }
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        price: 0,
        originalPrice: 0,
        stockQuantity: 0,
        categoryId: dbCategories[0]?.id || '',
        brandId: categories.find(c => c.name === selectedBrand)?.id || '',
        description: '',
        image: ''
      });
      setImageInputMethod('upload');
    }
    setUploadType('local');
    setUploading(false);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      // Map frontend form data to backend DTO structure
      const payload = {
        name: productFormData.name,
        slug: productFormData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: productFormData.description || '',
        basePrice: productFormData.price,
        totalStock: productFormData.stockQuantity,
        isActive: true,
        categoryId: parseInt(productFormData.categoryId) || 1,
        brandId: parseInt(productFormData.brandId) || null,
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

  const handleExecuteTransaction = async () => {
    if (!txProductId) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }
    const product = products.find(p => p.id === parseInt(txProductId));
    if (!product) {
      alert('Sản phẩm không hợp lệ!');
      return;
    }

    const txConf = TRANSACTIONS.find(t => t.id === activeTxTab);
    const quantity = parseInt(txQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Số lượng phải lớn hơn 0!');
      return;
    }

    let newStock = product.totalStock ?? product.stock ?? product.stockQuantity ?? 0;
    if (txConf.type === 'IN') {
      newStock += quantity;
    } else {
      if (newStock < quantity) {
        alert(`Số lượng xuất vượt quá tồn kho hiện tại (${newStock} sản phẩm)!`);
        return;
      }
      newStock -= quantity;
    }

    try {
      const payload = {
        name: product.name,
        slug: product.slug || product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: product.description || '',
        basePrice: product.basePrice || product.price || 0,
        totalStock: newStock,
        isActive: product.isActive !== undefined ? product.isActive : true,
        shopId: product.shopId || 1,
        categoryId: product.categoryId || 1,
        thumbnailImage: product.thumbnailImage || "",
        mainImage: product.mainImage || "",
        images: product.images || ""
      };

      await productService.update(product.id, payload);
      alert(`${txConf.name} thành công! Tồn kho mới: ${newStock}`);
      setActiveTxTab(null);
      // Reset form
      setTxProductId('');
      setTxQuantity(1);
      setTxPrice('');
      setTxNote('');
      fetchProducts();
    } catch (err) {
      console.error("Lỗi thực hiện giao dịch kho:", err);
      alert('Giao dịch thất bại: ' + (err.message || JSON.stringify(err)));
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
            <select
              value={txProductId}
              onChange={(e) => setTxProductId(e.target.value)}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            >
              <option value="">-- Chọn sản phẩm {selectedBrand} --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Số lượng</label>
            <input
              type="number"
              min="1"
              value={txQuantity}
              onChange={(e) => setTxQuantity(e.target.value)}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">
              {txConf.type === 'IN' ? 'Giá nhập (VNĐ)' : 'Giá xuất/Bán (VNĐ)'}
            </label>
            <input
              type="text"
              placeholder="VD: 25.000.000"
              value={txPrice}
              onChange={(e) => setTxPrice(e.target.value)}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Ghi chú</label>
            <input
              type="text"
              placeholder="Lý do, mã phiếu..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-xl px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExecuteTransaction}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 shadow-sm bg-[#4318FF] text-[#FFFFFF]"
          >
            Xác nhận {txConf.type === 'IN' ? 'Nhập Kho' : 'Xuất Kho'}
          </button>
        </div>
      </div>
    );
  };



  return (
    <div className="flex flex-col md:flex-row min-h-full gap-6">
      {/* Sidebar chọn thương hiệu */}
      <div className="w-full md:w-64 flex-shrink-0 bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden h-fit md:h-auto">
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
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý sản phẩm: {selectedBrand}</h2>
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
                    paginatedProducts.map((product) => {
                      const productVariants = variants.filter(v => v.productId === product.id);
                      return (
                        <React.Fragment key={product.id}>
                          <tr className="border-b border-[#E0E5F2] hover:bg-[#F4F7FE] transition-colors group">
                            <td className="py-4 px-2 font-bold text-[#2B3674]">{product.name}</td>
                            <td className="py-4 px-2 text-center font-bold text-[#2B3674]">{product.totalStock ?? product.stock ?? product.stockQuantity ?? 0}</td>
                            <td className="py-4 px-2 font-bold text-[#2B3674]">{formatCurrency(product.basePrice ?? product.price ?? 0)}</td>
                            <td className="py-4 px-2 text-center">
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${(product.totalStock ?? product.stock ?? product.stockQuantity ?? 0) > 0 ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                                {(product.totalStock ?? product.stock ?? product.stockQuantity ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center justify-center gap-2">
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
                          {productVariants.length > 0 && productVariants.map((v) => (
                            <tr key={`v-${v.id}`} className="border-b border-[#E0E5F2]/60 hover:bg-[#F4F7FE]/40 transition-colors text-xs text-gray-600 bg-gray-50/50">
                              <td className="py-3 px-6 font-medium text-gray-700 flex items-center gap-2">
                                <span className="text-gray-400">↳</span>
                                <span>{v.name}</span>
                              </td>
                              <td className="py-3 px-2 text-center font-semibold text-gray-700">{v.totalStock}</td>
                              <td className="py-3 px-2 font-semibold text-gray-700">{formatCurrency(v.price)}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.totalStock > 0 ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                                  {v.totalStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center text-gray-400">-</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
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
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá bán(VNĐ)</label>
                  <input
                    type="number" required
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.originalPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Số lượng tồn</label>
                  <input
                    type="number" required
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                    value={productFormData.stockQuantity}
                    onChange={(e) => setProductFormData({ ...productFormData, stockQuantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Thương hiệu</label>
                  <select
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] bg-[#FFFFFF]"
                    value={productFormData.brandId}
                    onChange={(e) => setProductFormData({ ...productFormData, brandId: e.target.value })}
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Danh mục</label>
                  <select
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] bg-[#FFFFFF]"
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {dbCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Hình ảnh sản phẩm</label>
                  
                  {/* Selector Tabs */}
                  <div className="flex border-b border-[#E0E5F2] mb-4">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
                        imageInputMethod === 'upload'
                          ? 'border-[#4318FF] text-[#4318FF]'
                          : 'border-transparent text-[#A3AED0] hover:text-[#2B3674]'
                      }`}
                    >
                      <UploadCloud size={16} />
                      Tải lên từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
                        imageInputMethod === 'url'
                          ? 'border-[#4318FF] text-[#4318FF]'
                          : 'border-transparent text-[#A3AED0] hover:text-[#2B3674]'
                      }`}
                    >
                      <Link2 size={16} />
                      Nhập liên kết URL
                    </button>
                  </div>

                  {/* Image Tab Contents */}
                  {imageInputMethod === 'upload' ? (
                    <div className="space-y-4">
                      {/* Upload Options: Local vs Cloud */}
                      <div className="flex items-center gap-4 text-xs font-bold mb-2">
                        <span className="text-[#A3AED0] uppercase tracking-wider">Nơi lưu trữ:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#2B3674]">
                          <input
                            type="radio"
                            name="uploadType"
                            value="local"
                            checked={uploadType === 'local'}
                            onChange={() => setUploadType('local')}
                            className="w-4 h-4 text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                          />
                          Lưu trên Server (Local)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#2B3674]">
                          <input
                            type="radio"
                            name="uploadType"
                            value="cloud"
                            checked={uploadType === 'cloud'}
                            onChange={() => setUploadType('cloud')}
                            className="w-4 h-4 text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                          />
                          Lưu trên Cloud (Cloudinary)
                        </label>
                      </div>

                      {/* Upload Area / Live Preview */}
                      {productFormData.image ? (
                        <div className="flex items-center gap-6 p-4 border border-[#E0E5F2] rounded-xl bg-[#F4F7FE]/20">
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#E0E5F2] bg-white flex items-center justify-center p-1 shrink-0 shadow-sm">
                            <img
                              src={productFormData.image}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#A3AED0] font-bold uppercase truncate">Đường dẫn ảnh hiện tại</p>
                            <p className="text-sm text-[#2B3674] font-medium truncate mt-0.5" title={productFormData.image}>
                              {productFormData.image}
                            </p>
                            <button
                              type="button"
                              onClick={() => setProductFormData(prev => ({ ...prev, image: '' }))}
                              className="mt-2 text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
                            >
                              Xóa hình ảnh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-[#E0E5F2] hover:border-[#4318FF] transition-colors rounded-xl p-8 flex flex-col items-center justify-center bg-[#F4F7FE]/10 hover:bg-[#F4F7FE]/20 group cursor-pointer h-40">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          {uploading ? (
                            <div className="flex flex-col items-center gap-2 text-[#4318FF]">
                              <Loader2 size={36} className="animate-spin" />
                              <span className="text-sm font-bold animate-pulse">Đang tải ảnh lên...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center">
                              <UploadCloud size={36} className="text-[#A3AED0] group-hover:text-[#4318FF] transition-colors mb-2" />
                              <span className="text-sm font-bold text-[#2B3674]">Click để tải lên ảnh sản phẩm từ máy</span>
                              <span className="text-xs text-[#A3AED0] mt-1">Hỗ trợ file PNG, JPG, JPEG dưới 2MB</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                        placeholder="Dán link hình ảnh vào đây (https://...)"
                        value={productFormData.image}
                        onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                      />
                      {productFormData.image && (
                        <div className="flex items-center gap-4 p-3 border border-[#E0E5F2] rounded-xl bg-gray-50/50">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#E0E5F2] bg-white flex items-center justify-center p-1 shrink-0">
                            <img
                              src={productFormData.image}
                              alt="Preview"
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Invalid+URL'; }}
                            />
                          </div>
                          <span className="text-xs text-[#A3AED0] font-bold">Hình ảnh xem trước</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Mô tả ngắn</label>
                  <textarea
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] h-24 resize-none"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
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
