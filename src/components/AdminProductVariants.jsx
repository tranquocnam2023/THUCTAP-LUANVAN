import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, X, Check, Eye, FolderOpen } from 'lucide-react';
import { productService } from '../services/productService';
import { variantService } from '../services/variantService';

export default function AdminProductVariants() {
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [variantStock, setVariantStock] = useState('0');
  const [variantImage, setVariantImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Dynamic spec states based on category
  const [color, setColor] = useState('');
  const [version, setVersion] = useState(''); // Used for sizes / storage / specs

  const [imageInputMethod, setImageInputMethod] = useState('url'); // 'url' | 'upload'
  const [uploading, setUploading] = useState(false);

  // Load products and variants
  const loadData = () => {
    setLoading(true);
    Promise.all([
      productService.getAll(),
      variantService.getAll()
    ])
      .then(([productsData, variantsData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setVariants(Array.isArray(variantsData) ? variantsData : []);
      })
      .catch(err => {
        console.error("Lỗi tải dữ liệu biến thể:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductById = (id) => {
    return products.find(p => p.id === id);
  };

  const handleOpenModal = (v = null) => {
    if (v) {
      setEditingVariant(v);
      setSelectedProductId(v.productId.toString());
      setVariantPrice(v.price.toString());
      setVariantStock(v.totalStock.toString());
      setVariantImage(v.imageId || '');
      setIsActive(true);

      let parsedAttributes = {};
      try {
        parsedAttributes = v.attributes ? JSON.parse(v.attributes) : {};
      } catch (e) {
        console.error("Lỗi parse attributes", e);
      }
      
      const vVersion = parsedAttributes["Dung Lượng RAM - ROM"] || '';
      const vColor = parsedAttributes["Màu sắc"] || '';

      setVersion(vVersion);
      setColor(vColor);
    } else {
      setEditingVariant(null);
      setSelectedProductId(products[0]?.id?.toString() || '');
      setVariantPrice('');
      setVariantStock('0');
      setVariantImage('');
      setIsActive(true);
      setColor('');
      setVersion('');
    }
    setShowModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await productService.uploadLocalImage(file);
      if (res && res.url) {
        let finalUrl = res.url;
        if (finalUrl.startsWith('/')) {
          const apiBase = import.meta.env.VITE_API_URL || 'https://localhost:7279/api';
          const hostBase = apiBase.replace('/api', '');
          finalUrl = `${hostBase}${finalUrl}`;
        }
        setVariantImage(finalUrl);
        alert('Tải ảnh lên thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const product = getProductById(parseInt(selectedProductId));
    if (!product) {
      alert('Vui lòng chọn sản phẩm hợp lệ!');
      return;
    }

    // Construct variant name
    const cleanVersion = version.trim() || 'Mặc định';
    const cleanColor = color.trim();
    const name = product.name;

    // Check duplicate variant for this product
    const duplicate = variants.find(v => {
      if (v.productId !== product.id) return false;
      if (editingVariant && v.id === editingVariant.id) return false;
      
      let parsedAttr = {};
      try { parsedAttr = v.attributes ? JSON.parse(v.attributes) : {}; } catch(e){}
      const vColor = (parsedAttr["Màu sắc"] || '').trim().toLowerCase();
      const vVersion = (parsedAttr["Dung Lượng RAM - ROM"] || '').trim().toLowerCase();
      
      return vColor === cleanColor.toLowerCase() && vVersion === cleanVersion.toLowerCase();
    });

    if (duplicate) {
      alert(`Biến thể với cấu hình "${cleanVersion} - ${cleanColor}" đã tồn tại cho sản phẩm này!`);
      return;
    }

    // Price fallback logic
    let priceVal = parseFloat(variantPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      priceVal = product.basePrice || product.price || 0;
    }

    const attributesObj = {};
    if (cleanColor) attributesObj["Màu sắc"] = cleanColor;
    if (cleanVersion) attributesObj["Dung Lượng RAM - ROM"] = cleanVersion;

    const payload = {
      name,
      price: priceVal,
      totalStock: parseInt(variantStock) || 0,
      productId: product.id,
      imageId: variantImage,
      attributes: JSON.stringify(attributesObj)
    };

    try {
      if (editingVariant) {
        await variantService.update(editingVariant.id, payload);
        alert('Cập nhật biến thể thành công!');
      } else {
        await variantService.create(payload);
        alert('Thêm biến thể mới thành công!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Lưu biến thể thất bại:', err);
      alert('Có lỗi xảy ra: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      try {
        await variantService.delete(id);
        alert('Xóa thành công!');
        loadData();
      } catch (err) {
        console.error(err);
        alert('Không thể xóa biến thể này. Có thể nó đang nằm trong giỏ hàng hoặc đơn hàng.');
      }
    }
  };

  const selectedProduct = getProductById(parseInt(selectedProductId));

  const filteredVariants = variants.filter(v => {
    const product = getProductById(v.productId);
    const prodName = product ? product.name.toLowerCase() : '';
    const varName = v.name ? v.name.toLowerCase() : '';
    const query = searchTerm.toLowerCase();
    return prodName.includes(query) || varName.includes(query);
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý Biến thể</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Quản lý kích thước, bộ nhớ, màu sắc và tồn kho của sản phẩm</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm theo sản phẩm hoặc biến thể..."
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
            <span>Thêm biến thể</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] w-20">ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] w-24">Hình ảnh</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Sản phẩm gốc</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Thông số biến thể</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-right">Giá bán</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Tồn kho</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {filteredVariants.length > 0 ? (
                filteredVariants.map((v) => {
                  const product = getProductById(v.productId);
                  return (
                    <tr key={v.id} className="hover:bg-[#F4F7FE] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[#A3AED0] font-bold">#{v.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-14 h-14 rounded-xl bg-[#F4F7FE] flex items-center justify-center overflow-hidden border border-[#E0E5F2] p-1">
                          {v.imageId ? (
                            <img src={v.imageId} alt="Variant" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="text-[#A3AED0]" size={20} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#2B3674]">{product ? product.name : `Sản phẩm #${v.productId}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
                          {(() => {
                            let parsedAttr = {};
                            try { parsedAttr = v.attributes ? JSON.parse(v.attributes) : {}; } catch(e){}
                            const vVersion = parsedAttr["Dung Lượng RAM - ROM"];
                            const vColor = parsedAttr["Màu sắc"];
                            if (vVersion && vColor) return `${vVersion} - ${vColor}`;
                            if (vVersion) return vVersion;
                            if (vColor) return vColor;
                            return v.name || 'Mặc định';
                          })()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#2B3674] text-base">{v.price.toLocaleString('vi-VN')} ₫</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${v.totalStock > 0 ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#EE5D50]/10 text-[#EE5D50]'}`}>
                          {v.totalStock > 0 ? `Còn ${v.totalStock}` : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(v)}
                            className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center bg-[#FFFFFF]">
                    <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                      <FolderOpen size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy biến thể nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F4F7FE]">
              <h3 className="text-xl font-bold text-[#2B3674]">{editingVariant ? 'Cập nhật Biến thể' : 'Thêm Biến thể mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#A3AED0] hover:text-[#EE5D50] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Product Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Sản phẩm</label>
                  <select
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] bg-[#FFFFFF] font-medium"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Phiên bản</label>
                  <input
                    type="text"
                    placeholder="VD: 128GB, 256GB, LTE, 40mm..."
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Màu sắc</label>
                  <input
                    type="text"
                    placeholder="VD: Đen, Trắng, Titan Tự Nhiên..."
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                  />
                </div>

                {/* Price (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá bán (Để trống = Theo sản phẩm gốc)</label>
                  <input
                    type="number"
                    placeholder={selectedProduct ? `Giá gốc: ${selectedProduct.basePrice?.toLocaleString('vi-VN')} ₫` : 'Giá bán'}
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                    value={variantStock}
                    onChange={(e) => setVariantStock(e.target.value)}
                    required
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 rounded border-[#E0E5F2] text-[#4318FF] focus:ring-[#4318FF]"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-[#2B3674] cursor-pointer">Hoạt động (Is Active)</label>
                </div>

                {/* Image Upload/URL Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Hình ảnh biến thể</label>
                  <div className="flex border-b border-[#E0E5F2] mb-3">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors ${imageInputMethod === 'upload' ? 'border-[#4318FF] text-[#4318FF]' : 'border-transparent text-[#A3AED0]'}`}
                    >
                      Tải lên từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors ${imageInputMethod === 'url' ? 'border-[#4318FF] text-[#4318FF]' : 'border-transparent text-[#A3AED0]'}`}
                    >
                      Nhập liên kết URL
                    </button>
                  </div>

                  {imageInputMethod === 'upload' ? (
                    <div className="relative border-2 border-dashed border-[#E0E5F2] rounded-xl p-6 flex flex-col items-center justify-center bg-[#F4F7FE]/10 h-28 cursor-pointer hover:border-[#4318FF] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {uploading ? (
                        <span className="text-xs font-bold text-[#4318FF]">Đang tải ảnh...</span>
                      ) : (
                        <span className="text-xs font-bold text-[#A3AED0]">Nhấp để tải lên ảnh biến thể</span>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                      placeholder="Dán link ảnh biến thể (https://...)"
                      value={variantImage}
                      onChange={(e) => setVariantImage(e.target.value)}
                    />
                  )}
                  {variantImage && (
                    <div className="flex items-center gap-3 mt-3 p-2 border border-[#E0E5F2] rounded-xl w-fit bg-gray-50">
                      <img src={variantImage} alt="Preview" className="w-12 h-12 object-contain rounded" />
                      <span className="text-xs text-[#A3AED0] font-bold">Hình ảnh xem trước</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory history (Mocked table as requested by UI design) */}
              <div className="border border-[#E0E5F2] rounded-xl overflow-hidden mt-6">
                <div className="bg-gray-50 px-4 py-2 border-b border-[#E0E5F2] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Lịch sử tồn kho
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FFFFFF] text-gray-400 border-b border-[#E0E5F2]">
                        <th className="px-4 py-2 font-bold uppercase">Loại</th>
                        <th className="px-4 py-2 font-bold uppercase">Số lượng</th>
                        <th className="px-4 py-2 font-bold uppercase">Tồn trước</th>
                        <th className="px-4 py-2 font-bold uppercase">Tồn sau</th>
                        <th className="px-4 py-2 font-bold uppercase">Ghi chú</th>
                        <th className="px-4 py-2 font-bold uppercase">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E5F2] text-gray-600">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-bold text-green-600">NHẬP KHO</td>
                        <td className="px-4 py-2 font-bold">{variantStock}</td>
                        <td className="px-4 py-2">0</td>
                        <td className="px-4 py-2">{variantStock}</td>
                        <td className="px-4 py-2">Khởi tạo tồn kho ban đầu</td>
                        <td className="px-4 py-2 text-[#A3AED0]">{new Date().toLocaleDateString('vi-VN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#E0E5F2]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-[#F4F7FE] text-[#2B3674] rounded-xl font-bold hover:bg-[#E0E5F2] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95"
                >
                  Lưu Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
