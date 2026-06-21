import React, { useState, useEffect } from 'react';
import { Package, Layout, Bell, ShoppingCart, Settings2, Plus, Edit, Trash2, X, FolderTree, UploadCloud, Loader2, Link2, ChevronDown, ChevronUp, Image as ImageIcon, Search } from 'lucide-react';
// import { TRANSACTIONS_MOCK } from '../utils/constants'; // Removed invalid import
import AdminProductVariants from '../components/AdminProductVariants';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
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

export default function AdminProducts({ onCreate, onEdit }) {
  const [categories, setCategories] = useState([]); // Sidebar brands
  const [dbCategories, setDbCategories] = useState([]); // Database categories
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isActiveFilter, setIsActiveFilter] = useState('ALL'); // 'ALL', 'TRUE', 'FALSE'
  const [isFeaturedFilter, setIsFeaturedFilter] = useState('ALL'); // 'ALL', 'TRUE', 'FALSE'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTxTab, setActiveTxTab] = useState(null);

  // State for variants inside inventory
  const [variants, setVariants] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState({});

  // State for inventory transactions
  const [txProductId, setTxProductId] = useState('');
  const [txQuantity, setTxQuantity] = useState(1);
  const [txPrice, setTxPrice] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txHistory, setTxHistory] = useState([]);

  // Khởi tạo các hook
  const filteredProducts = products.filter(p => {
    let match = true;
    if (selectedBrand !== 'ALL' && String(p.brandId) !== String(selectedBrand)) match = false;
    if (selectedCategory !== 'ALL' && String(p.categoryId) !== String(selectedCategory)) match = false;
    if (isActiveFilter !== 'ALL') {
      const activeValue = isActiveFilter === 'TRUE';
      if (p.isActive !== activeValue) match = false;
    }
    if (isFeaturedFilter !== 'ALL') {
      const featuredValue = isFeaturedFilter === 'TRUE';
      if (p.isFeatured !== featuredValue) match = false;
    }
    if (searchQuery) {
      if (!p.name.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
    }
    return match;
  });

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
  } = usePagination(filteredProducts, 10); // Hiển thị 10 sản phẩm mỗi trang

  const fetchProducts = async () => {
    try {
      const allProducts = await productService.getAll();
      if (Array.isArray(allProducts)) {
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
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
          // setSelectedBrand('ALL');
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

  const fetchTxHistory = async () => {
    try {
      const res = await inventoryService.getAll();
      if (Array.isArray(res)) {
        setTxHistory(res);
      }
    } catch (err) {
      console.log("Lỗi tải lịch sử giao dịch:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTxHistory();
  }, []);

  const stats = [
    { label: 'Tổng sản phẩm', value: products.length, icon: 'Package', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
    { label: 'Giá trị tồn kho', value: products.reduce((acc, p) => acc + ((p.basePrice || p.price || 0) * (p.totalStock ?? p.stock ?? p.stockQuantity ?? 0)), 0), icon: 'Layout', bgColor: '#FFFFFF', textColor: '#2B3674', isCurrency: true, iconColor: '#01B574' },
    { label: 'Sắp hết hàng', value: products.filter(p => (p.totalStock ?? p.stock ?? p.stockQuantity ?? 0) < 5).length, icon: 'Bell', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#FFB547' },
    { label: 'Đã bán tháng này', value: 24, icon: 'ShoppingCart', bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#39B8FF' },
  ];



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

    try {
      await inventoryService.create({
        productId: product.id,
        quantityChanged: quantity,
        transactionType: activeTxTab,
        price: parseFloat(txPrice) || 0,
        note: txNote || ''
      });

      alert(`${txConf.name} thành công!`);
      setActiveTxTab(null);
      // Reset form
      setTxProductId('');
      setTxQuantity(1);
      setTxPrice('');
      setTxNote('');
      fetchProducts();
      fetchTxHistory();
    } catch (err) {
      console.error("Lỗi thực hiện giao dịch kho:", err);
      alert('Giao dịch thất bại: ' + (err.response?.data || err.message || JSON.stringify(err)));
    }
  };

  const handleRevertTransaction = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hoàn tác/hủy giao dịch này không? Số lượng kho sẽ được điều chỉnh ngược lại.")) return;
    try {
      await inventoryService.revert(id);
      alert("Hoàn tác giao dịch thành công!");
      fetchProducts();
      fetchTxHistory();
    } catch (err) {
      console.error("Lỗi hoàn tác giao dịch:", err);
      alert("Lỗi hoàn tác: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  // Tái sử dụng form giao dịch chung cho cả 4 loại
  const renderReusableTransactionForm = () => {
    if (!activeTxTab) return null;
    const txConf = TRANSACTIONS.find(t => t.id === activeTxTab);

    return (
      <div className="bg-[#FFFFFF] p-6 rounded-md animate-fade-in mb-8">
        <div className="flex justify-between items-center mb-6 border-b border-[#E0E5F2] pb-4">
          <h3 className="text-xl font-bold text-[#2B3674] flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-3" style={{ backgroundColor: txConf.bgColor === '#FFFFFF' ? '#A3AED0' : txConf.bgColor }}></span>
            {txConf.name} ({selectedBrand})
          </h3>
          <button
            onClick={() => setActiveTxTab(null)}
            className="text-sm font-bold px-4 py-2 rounded-md transition-colors hover:bg-[#F4F7FE] text-[#A3AED0] hover:text-[#2B3674]"
          >
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Chọn sản phẩm</label>
            <select
              value={txProductId}
              onChange={(e) => {
                const prodId = e.target.value;
                setTxProductId(prodId);
                const selectedProd = products.find(p => p.id === parseInt(prodId));
                if (selectedProd) {
                  setTxPrice((selectedProd.basePrice || selectedProd.price || 0).toString());
                  setTxNote(activeTxTab === 'IMPORT_SUPPLIER' ? 'Nhập hàng từ nhà cung cấp' :
                            activeTxTab === 'IMPORT_RETURN' ? 'Khách trả hàng' :
                            activeTxTab === 'EXPORT_SELL' ? 'Xuất bán lẻ trực tiếp tại quầy' :
                            activeTxTab === 'EXPORT_DEFECT' ? 'Trả hàng lỗi cho nhà cung cấp' : '');
                } else {
                  setTxPrice('');
                  setTxNote('');
                }
              }}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
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
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
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
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Ghi chú</label>
            <input
              type="text"
              placeholder="Lý do, mã phiếu..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-3 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExecuteTransaction}
            className="px-6 py-3 rounded-md font-bold transition-all hover:opacity-90 bg-[#4318FF] text-[#FFFFFF]"
          >
            Xác nhận {txConf.type === 'IN' ? 'Nhập Kho' : 'Xuất Kho'}
          </button>
        </div>

        {/* Render filtered transaction history below the form */}
        {renderInventoryHistory(activeTxTab)}
      </div>
    );
  };

  const renderInventoryHistory = (filterType = null) => {
    // Filter history based on filterType
    const filteredHistory = filterType 
      ? txHistory.filter(t => t.transactionType === filterType)
      : txHistory;

    return (
      <div className="mt-12 border-t border-[#E0E5F2] pt-8">
        <h4 className="text-lg font-bold text-[#2B3674] mb-4">
          Lịch sử xuất/nhập kho {filterType ? `(${TRANSACTIONS.find(tx => tx.id === filterType)?.name})` : '(Tất cả)'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2] text-[#A3AED0] text-[11px] font-bold uppercase">
                <th className="pb-3 px-2">Mã Đơn hàng</th>
                <th className="pb-3 px-2">Thời gian</th>
                <th className="pb-3 px-2">Sản phẩm & Biến thể</th>
                <th className="pb-3 px-2">Loại GD</th>
                <th className="pb-3 px-2 text-right">Số lượng</th>
                <th className="pb-3 px-2 text-right">Giá trị</th>
                <th className="pb-3 px-2">Người thực hiện</th>
                <th className="pb-3 px-2">Ghi chú</th>
                <th className="pb-3 px-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((t) => {
                  const code = t.orderId ? `#PS${t.orderId}` : `#PS${t.id}`;
                  const formattedDate = new Date(t.createdAt).toLocaleString('vi-VN');
                  const qty = Math.abs(t.quantityChanged);
                  const totalVal = t.price * qty;
                  
                  return (
                    <tr key={t.id} className={`border-b border-[#E0E5F2] hover:bg-[#F4F7FE] transition-colors ${t.isReverted ? 'opacity-50 line-through' : ''}`}>
                      <td className="py-3 px-2 font-mono font-bold text-xs text-blue-600">{code}</td>
                      <td className="py-3 px-2 text-xs text-[#A3AED0]">{formattedDate}</td>
                      <td className="py-3 px-2 font-bold text-[#2B3674]">
                        {t.productName} <span className="text-xs font-normal text-gray-500">({t.variantName})</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.transactionType === 'IMPORT_SUPPLIER' ? 'bg-blue-50 text-blue-600' :
                          t.transactionType === 'IMPORT_RETURN' ? 'bg-green-50 text-green-600' :
                          t.transactionType === 'EXPORT_SELL' ? 'bg-purple-50 text-purple-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {t.transactionType === 'IMPORT_SUPPLIER' ? 'Nhập NCC' :
                           t.transactionType === 'IMPORT_RETURN' ? 'Khách trả' :
                           t.transactionType === 'EXPORT_SELL' ? 'Xuất bán lẻ' : 'Xuất lỗi'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-[#2B3674]">
                        {t.quantityChanged > 0 ? `+${qty}` : `-${qty}`}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-[#2B3674]">{formatCurrency(totalVal)}</td>
                      <td className="py-3 px-2 text-xs text-[#2B3674]">{t.createdByUsername}</td>
                      <td className="py-3 px-2 text-xs text-[#A3AED0]">{t.note}</td>
                      <td className="py-3 px-2 text-center">
                        {t.orderId ? (
                          <span className="text-xs text-gray-400 italic">Theo đơn hàng</span>
                        ) : !t.isReverted ? (
                          <button
                            onClick={() => handleRevertTransaction(t.id)}
                            className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-md font-bold transition-all"
                          >
                            Hoàn tác
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Đã hủy</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400 bg-white italic">
                    Chưa có lịch sử giao dịch kho nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };



  return (
    <div className="flex flex-col md:flex-row min-h-full gap-6">
      {/* Sidebar Bộ lọc */}
      <div className="w-full md:w-64 flex-shrink-0 bg-[#FFFFFF] rounded-md overflow-hidden h-fit md:h-auto">
        <div className="px-6 py-5 border-b border-[#E0E5F2] font-bold text-[#2B3674] flex items-center text-lg">
          <Settings2 className="w-5 h-5 mr-3 text-[#4318FF]" />
          Bộ lọc sản phẩm
        </div>
        <div className="flex flex-col p-4 gap-4">
          
          {/* Lọc theo Brand */}
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Thương hiệu</label>
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); goToPage(1); }}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-2 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            >
              <option value="ALL">Tất cả thương hiệu</option>
              {categories.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Lọc theo Category */}
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); goToPage(1); }}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-2 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            >
              <option value="ALL">Tất cả danh mục</option>
              {dbCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Lọc theo IsActive */}
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Trạng thái</label>
            <select
              value={isActiveFilter}
              onChange={(e) => { setIsActiveFilter(e.target.value); goToPage(1); }}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-2 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="TRUE">Đang bán (Active)</option>
              <option value="FALSE">Ngừng bán (Inactive)</option>
            </select>
          </div>

          {/* Lọc theo IsFeatured */}
          <div>
            <label className="block text-sm font-bold text-[#2B3674] mb-2">Sản phẩm nổi bật</label>
            <select
              value={isFeaturedFilter}
              onChange={(e) => { setIsFeaturedFilter(e.target.value); goToPage(1); }}
              className="w-full border border-[#E0E5F2] text-[#2B3674] rounded-md px-4 py-2 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none bg-[#FFFFFF]"
            >
              <option value="ALL">Tất cả</option>
              <option value="TRUE">Có</option>
              <option value="FALSE">Không</option>
            </select>
          </div>

        </div>
      </div>

      {/* Khu vực Chính: Chức năng nhập xuất & Danh sách */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý sản phẩm</h2>
            <p className="text-sm text-[#A3AED0] font-medium mt-1">Xem danh sách, chỉnh sửa thông tin và nhập xuất kho</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0]">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); goToPage(1); }}
                className="w-full pl-11 pr-4 py-2.5 border border-[#E0E5F2] rounded-md focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] font-semibold text-[#2B3674] placeholder-[#A3AED0] text-sm"
              />
            </div>
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4318FF] text-[#FFFFFF] rounded-md font-bold hover:bg-[#3911D1] transition-all active:scale-95 text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item, i) => {
            return (
              <div
                key={i}
                className="p-5 rounded-md transition-all flex items-center justify-between h-28 bg-[#FFFFFF]"
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
              className={`p-4 rounded-md font-bold text-sm transition-all transform hover:-translate-y-1 ${activeTxTab === tx.id ? 'ring-2 ring-offset-2 ring-[#4318FF] shadow-md' : 'shadow-sm border border-[#E0E5F2]'}`}
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
          <>
            <div className="bg-[#FFFFFF] rounded-md p-6 flex-1 flex flex-col mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#2B3674]">Danh sách sản phẩm</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E5F2] text-[#A3AED0] text-[12px] font-bold">
                      <th className="pb-3 px-2">Tên sản phẩm({products.length}) </th>
                      <th className="pb-3 px-2">Thương hiệu</th>
                      <th className="pb-3 px-2">Danh mục</th>
                      <th className="pb-3 px-2">Giá bán</th>
                      <th className="pb-3 px-2 text-center">Tồn kho</th>
                      <th className="pb-3 px-2 text-center">IsActive</th>
                      <th className="pb-3 px-2 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product) => {
                        const productVariants = variants.filter(v => v.productId === product.id);
                        const isExpanded = expandedProducts[product.id];
                        
                        const brandName = categories.find(c => c.id === product.brandId)?.name || product.brandName || 'N/A';
                        const categoryName = dbCategories.find(c => c.id === product.categoryId)?.name || 'N/A';
  
                        return (
                          <React.Fragment key={product.id}>
                            <tr className="border-b border-[#E0E5F2] hover:bg-[#F4F7FE] transition-colors group cursor-pointer" onClick={() => setExpandedProducts(prev => ({ ...prev, [product.id]: !prev[product.id] }))}>
                              <td className="py-4 px-2 font-bold text-[#2B3674]">
                                <div className="flex items-center gap-2">
                                  {productVariants.length > 0 && (
                                    <span className="text-[#A3AED0]">
                                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </span>
                                  )}
                                  {product.name}
                                  {product.isFeatured && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFB547]/10 text-[#FFB547]">
                                      Nổi bật
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2 text-[#2B3674]">{brandName}</td>
                              <td className="py-4 px-2 text-[#2B3674]">{categoryName}</td>
                              <td className="py-4 px-2 font-bold text-[#2B3674]">{formatCurrency(product.basePrice ?? product.price ?? 0)}</td>
                              <td className="py-4 px-2 text-center font-bold text-[#2B3674]">{product.totalStock ?? product.stock ?? product.stockQuantity ?? 0}</td>
                              <td className="py-4 px-2 text-center">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${product.isActive ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(product.id); }}
                                    className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-md transition-all"
                                    title="Sửa"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                    className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-md transition-all"
                                    title="Xóa"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Variant Rows (Chỉ hiển thị khi expanded) */}
                            {isExpanded && productVariants.length > 0 && productVariants.map((v) => (
                              <tr key={`v-${v.id}`} className="border-b border-[#E0E5F2]/60 hover:bg-[#F4F7FE]/40 transition-colors text-xs text-gray-600 bg-gray-50/50">
                                <td className="py-3 px-6 font-medium text-gray-700 flex items-center gap-2">
                                  <span className="text-gray-400">↳</span>
                                  <span>{v.name}</span>
                                </td>
                                <td className="py-3 px-2 text-center text-gray-400">-</td>
                                <td className="py-3 px-2 text-center text-gray-400">-</td>
                                <td className="py-3 px-2 font-semibold text-gray-700">{formatCurrency(v.price)}</td>
                                <td className="py-3 px-2 text-center font-semibold text-gray-700">{v.totalStock}</td>
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
                        <td colSpan="7" className="p-8 text-center text-gray-500 bg-white">
                          Chưa có dữ liệu sản phẩm
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
                    className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-md text-sm font-bold hover:bg-[#E0E5F2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-md text-sm font-bold hover:bg-[#E0E5F2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    SAU
                  </button>
                </div>
              </div>
            </div>
            
            {/* Lịch sử giao dịch kho chung */}
            <div className="bg-[#FFFFFF] rounded-md p-6 mb-8">
              {renderInventoryHistory(null)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
