import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // States for expanding categories
  const [expandedCategories, setExpandedCategories] = useState({}); // { [id]: boolean }

  const loadData = () => {
    setLoading(true);
    Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      // load brands for info
      import('../services/brandService').then(m => m.brandService.getAll().catch(() => []))
    ])
      .then(([productsData, categoriesData, brandsData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      })
      .catch(err => {
        console.error("Lỗi tải dữ liệu:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleProducts = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getBrandsByCategory = (catId) => {
    const brandIdsWithProducts = new Set(
      products
        .filter(p => p.categoryId === catId || p.CategoryId === catId)
        .map(p => p.brandId || p.BrandId)
        .filter(Boolean)
    );
    return brands.filter(b => brandIdsWithProducts.has(b.id));
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
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Quản lý các mặt hàng kinh doanh chính trong hệ thống</p>
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
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] w-24">ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Tên danh mục</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Mô tả</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const catBrands = getBrandsByCategory(cat.id);
                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="hover:bg-[#F4F7FE] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-[#A3AED0] font-bold">#{cat.id}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-base font-bold text-[#2B3674]">{cat.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#A3AED0] font-semibold">{cat.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleProducts(cat.id)}
                              className="p-2 text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE] rounded-lg transition-all"
                              title={expandedCategories[cat.id] ? 'Thu gọn' : 'Xem thương hiệu'}
                            >
                              {expandedCategories[cat.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedCategories[cat.id] && (
                        <tr className="bg-[#F4F7FE] animate-in slide-in-from-top-2 duration-300">
                          <td colSpan="4" className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {catBrands.length > 0 ? (
                                catBrands.map((brand) => {
                                  const productCount = products.filter(p => 
                                    (p.categoryId === cat.id || p.CategoryId === cat.id) && 
                                    (p.brandId === brand.id || p.BrandId === brand.id)
                                  ).length;
                                  return (
                                    <div key={brand.id} className="bg-[#FFFFFF] p-4 rounded-[20px] shadow-sm flex items-center gap-4 border border-[#E0E5F2] hover:shadow-md transition-all group/item">
                                      <div className="w-16 h-16 rounded-[15px] bg-[#F4F7FE] p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {brand.iconUrl || brand.logo || brand.image ? (
                                          <img src={brand.iconUrl || brand.logo || brand.image} alt={brand.name} className="w-full h-full object-contain group-hover/item:scale-105 transition-transform" />
                                        ) : (
                                          <ImageIcon className="text-[#A3AED0]" size={24} />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#2B3674] truncate text-base">{brand.name}</h4>
                                        <p className="text-xs text-[#A3AED0] font-medium mt-1">
                                          Có {productCount} mặt hàng trong danh mục
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="col-span-full py-8 flex flex-col items-center justify-center text-[#A3AED0] bg-[#FFFFFF] rounded-[20px] border-2 border-dashed border-[#E0E5F2]">
                                  <FolderOpen size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                                  <p className="text-sm font-bold">Danh mục này chưa có thương hiệu nào</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
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
    </div>
  );
}
