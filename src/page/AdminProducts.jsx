import React, { useState, useEffect } from 'react';
import { Package, Layout, Bell, ShoppingCart, Settings2 } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../utils/mockData';
import AdminProductVariants from '../components/AdminProductVariants';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';

// gọi API
const TRANSACTIONS = [
  { id: 'IMPORT_SUPPLIER', name: 'Nhập từ nhà cung cấp', type: 'IN', bgColor: '#ffffffff', textColor: '#db3e3eff', borderColor: 'var(--color-primary)' },
  { id: 'IMPORT_RETURN', name: 'Nhập hàng khách trả', type: 'IN', bgColor: '#23b85fff', textColor: '#ffffff', borderColor: 'var(--color-secondary)' },
  { id: 'EXPORT_SELL', name: 'Xuất bán hàng', type: 'OUT', bgColor: '#d1117aff', textColor: '#000000', borderColor: 'var(--color-yellow)' },
  { id: 'EXPORT_DEFECT', name: 'Xuất trả hàng lỗi cho NCC', type: 'OUT', bgColor: '#84e8c3ff', textColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }
];

export default function AdminProducts() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [products, setProducts] = useState(MOCK_PRODUCTS['iPhone'] || []);
  const [selectedBrand, setSelectedBrand] = useState('iPhone');
  const [activeTxTab, setActiveTxTab] = useState(null);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  
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
    if (selectedBrand && selectedBrand !== 'Đang tải...' && selectedBrand !== 'Không có danh mục') {
      const category = categories.find(c => c.name === selectedBrand);
      if (category) {
        productService.getByCategory(category.id)
          .then(data => {
            if (Array.isArray(data) && data.length > 0) setProducts(data);
            else setProducts(MOCK_PRODUCTS[selectedBrand] || []);
          })
          .catch(err => {
            setProducts(MOCK_PRODUCTS[selectedBrand] || []);
          });
      }
    }
  }, [selectedBrand, categories]);

  const stats = [
    { label: 'Tổng sản phẩm', value: products.length, icon: 'Package', bgColor: '#5856d6', textColor: '#ffffff' },
    { label: 'Giá trị tồn kho', value: products.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 0)), 0), icon: 'Layout', bgColor: '#007aff', textColor: '#ffffff', isCurrency: true },
    { label: 'Sắp hết hàng', value: products.filter(p => p.stockQuantity < 5).length, icon: 'Bell', bgColor: '#ff9500', textColor: '#ffffff' },
    { label: 'Đã bán tháng này', value: 24, icon: 'ShoppingCart', bgColor: '#34c759', textColor: '#ffffff' },
  ];

  // Tái sử dụng form giao dịch chung cho cả 4 loại
  const renderReusableTransactionForm = () => {
    if (!activeTxTab) return null;
    const txConf = TRANSACTIONS.find(t => t.id === activeTxTab);

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-3" style={{ backgroundColor: txConf.bgColor, border: `1px solid ${txConf.borderColor}` }}></span>
            {txConf.name} ({selectedBrand})
          </h3>
          <button
            onClick={() => setActiveTxTab(null)}
            className="text-sm font-medium px-3 py-1 rounded transition-opacity hover:opacity-80 shadow-sm"
            style={{ backgroundColor: '#1711d1ff', color: '#e1dfdfff', border: `1px solid ${txConf.borderColor}` }}
          >
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Chọn sản phẩm</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option>-- Chọn sản phẩm {selectedBrand} --</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Số lượng</label>
            <input type="number" min="1" defaultValue="1" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              {txConf.type === 'IN' ? 'Giá nhập (VNĐ)' : 'Giá xuất/Bán (VNĐ)'}
            </label>
            <input type="text" placeholder="VD: 25.000.000" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Ghi chú</label>
            <input type="text" placeholder="Lý do, mã phiếu..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-2.5 rounded-lg font-semibold transition-colors hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#1711d1ff', color: '#e1dfdfff', border: `1px solid ${txConf.borderColor}` }}
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
      {/* Sidebar chọn thương hiệu (Nằm gọn bên trái) */}
      <div className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden h-fit">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-gray-700 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Thương hiệu
        </div>
        <div className="flex flex-col p-2">
          {categories.length > 0 ? (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => { setSelectedBrand(category.name); setActiveTxTab(null); }}
                className={`px-4 py-2.5 text-left rounded-lg mb-1 transition-colors ${selectedBrand === category.name
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                • {category.name}
              </button>
            ))
          ) : (
            <div className="text-center p-4 text-sm text-gray-500">Đang tải API...</div>
          )}
        </div>
      </div>

      {/* Khu vực Chính: Chức năng nhập xuất & Danh sách */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý kho: {selectedBrand}</h2>
        
        {/* Stats Overview - MISA Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item, i) => {
            return (
              <div 
                key={i} 
                className="p-5 rounded-2xl shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between h-28 border border-white/10"
                style={{ backgroundColor: item.bgColor }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80" style={{ color: item.textColor }}>
                    {item.label}
                  </p>
                </div>
                <h3 className="text-2xl font-black leading-none" style={{ color: item.textColor }}>
                  {item.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)}
                </h3>
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
              className={`p-4 rounded-xl font-semibold text-sm transition-all transform hover:-translate-y-1 ${activeTxTab === tx.id ? 'ring-2 ring-offset-2 ring-gray-400 shadow-md' : 'shadow-sm'}`}
              style={{ backgroundColor: tx.bgColor, color: tx.textColor, border: `2px solid ${tx.borderColor}` }}
            >
              {/*phông chữ*/}
              <div className="flex flex-col items-center justify-center w-full h-full text-center">
                <span>{tx.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Hiển thị form tái sử dụng hoặc danh sách mặc định */}
        {activeTxTab ? renderReusableTransactionForm() : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2 gap-3">
              <h3 className="text-lg font-bold text-gray-800">Danh sách tồn kho {selectedBrand}</h3>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm theo tên sản phẩm..." 
                  className="border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            {/* Giả lập bảng danh sách */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b">Sản phẩm</th>
                    <th className="p-3 border-b text-center">Tồn kho</th>
                    <th className="p-3 border-b">Giá bán</th>
                    <th className="p-3 border-b text-center">Trạng thái</th>
                    <th className="p-3 border-b text-center">Biến thể</th>
                  </tr>
                </thead>
                <tbody className="text-sm border-b">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-b font-medium">{product.name}</td>
                        <td className="p-3 border-b text-center">{product.stockQuantity || 0}</td>
                        <td className="p-3 border-b">{formatCurrency(product.price)}</td>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${product.stockQuantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center">
                          <button 
                            onClick={() => setSelectedProductForVariants(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                            title="Quản lý biến thể"
                          >
                            <Settings2 size={18} />
                          </button>
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
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 px-2 py-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Hiển thị {startIndex}-{endIndex} trên {totalItems} sản phẩm
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  TRƯỚC
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-100 text-gray-400 hover:border-blue-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  SAU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
