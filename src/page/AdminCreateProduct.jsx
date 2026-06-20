import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, UploadCloud, Loader2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { productService } from '../services/productService';
import { variantService } from '../services/variantService';

const parseRamRom = (value) => {
  if (!value) return { ram: '', rom: '' };
  const parts = value.split('-');
  const ramPart = parts[0] || '';
  const romPart = parts[1] || '';
  const ram = ramPart.replace(/[^0-9]/g, '');
  const rom = romPart.replace(/[^0-9]/g, '');
  return { ram, rom };
};

export default function AdminCreateProduct({ onBack }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    brandId: '',
    description: '',
    basePrice: 0,
    originalPrice: 0,
    isActive: true,
    isFeatured: false,
    images: [], // { url, isMain, order }
    variants: [] // { tempId, name, price, totalStock, isActive, attr1Value, attr2Value }
  });

  const [attr1Name, setAttr1Name] = useState('Màu sắc');
  const [attr2Name, setAttr2Name] = useState('Phiên bản');
  const [hasAttr2, setHasAttr2] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, catsData] = await Promise.all([
          brandService.getAll(),
          categoryService.getAll()
        ]);
        if (brandsData) setBrands(brandsData);
        if (catsData) setCategories(catsData);
      } catch (e) {
        console.error("Lỗi tải danh mục/thương hiệu", e);
      }
    };
    fetchData();
  }, []);

  // Handle auto slug with Vietnamese diacritic removal
  const generateSlug = (text) => {
    let str = text.toString().toLowerCase();
    str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
    str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
    str = str.replace(/[ìíịỉĩ]/g, "i");
    str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
    str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
    str = str.replace(/[ỳýỵỷỹ]/g, "y");
    str = str.replace(/đ/g, "d");
    return str
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      slug: generateSlug(newName)
    });
  };

  // Hình ảnh
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const newImages = [...formData.images];
      for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
          alert(`File ${file.name} quá lớn (>2MB).`);
          continue;
        }
        const res = await productService.uploadLocalImage(file);
        if (res && res.url) {
          let finalUrl = res.url;
          if (finalUrl.startsWith('/')) {
            const apiBase = import.meta.env.VITE_API_URL || 'https://localhost:7279/api';
            const hostBase = apiBase.replace('/api', '');
            finalUrl = `${hostBase}${finalUrl}`;
          }
          newImages.push({
            url: finalUrl,
            isMain: newImages.length === 0, // Auto set first image as main
            order: newImages.length
          });
        }
      }
      setFormData({ ...formData, images: newImages });
    } catch (e) {
      alert("Lỗi tải ảnh: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  const updateImageOrder = (index, newOrder) => {
    const newImages = [...formData.images];
    newImages[index].order = parseInt(newOrder) || 0;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length > 0 && formData.images[index].isMain) {
      newImages[0].isMain = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  // Biến thể
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { tempId: Date.now(), name: '', price: '', totalStock: 0, isActive: true, attr1Value: '', attr2Value: '', imageId: '' }
      ]
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  // Lưu
  const handleSaveAndNew = async () => {
    if (hasAttr2 && attr1Name.trim().toLowerCase() === attr2Name.trim().toLowerCase()) {
      return alert("Trùng lặp thuộc tính! Vui lòng đặt tên hai thuộc tính khác nhau.");
    }
    if (!formData.name) return alert("Vui lòng nhập tên sản phẩm.");
    setSaving(true);
    try {
      // Sort images by order before saving
      const sortedImages = [...formData.images].sort((a, b) => a.order - b.order);
      const mainImage = sortedImages.find(i => i.isMain)?.url || "";
      const otherImages = sortedImages.filter(i => !i.isMain).map(i => i.url);
      
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        originalPrice: formData.originalPrice !== '' ? Number(formData.originalPrice) : null,
        totalStock: formData.variants.length > 0 ? formData.variants.reduce((acc, v) => acc + (Number(v.totalStock) || 0), 0) : 0,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        categoryId: parseInt(formData.categoryId) || 1,
        brandId: parseInt(formData.brandId) || null,
        thumbnailImage: mainImage,
        mainImage: mainImage,
        images: JSON.stringify(otherImages)
      };

      const res = await productService.create(payload);
      const newProductId = res?.id || (await (async () => {
        const allProds = await productService.getAll();
        return allProds.find(p => p.slug === formData.slug)?.id;
      })());
      
      if (newProductId && formData.variants.length > 0) {
        for (const v of formData.variants) {
          const attrObj = {};
          if (attr1Name.trim() && v.attr1Value) attrObj[attr1Name.trim()] = v.attr1Value;
          if (hasAttr2 && attr2Name.trim() && v.attr2Value) attrObj[attr2Name.trim()] = v.attr2Value;
          
          await variantService.create({
            name: v.name,
            price: v.price !== '' ? Number(v.price) : Number(formData.basePrice),
            totalStock: Number(v.totalStock) || 0,
            isActive: v.isActive,
            productId: newProductId,
            attributes: JSON.stringify(attrObj),
            imageId: v.imageId || ''
          });
        }
      }

      alert('Thêm sản phẩm thành công!');
      // Reset form
      setFormData({
        name: '', slug: '', categoryId: '', brandId: '', description: '',
        basePrice: 0, originalPrice: 0, isActive: true, isFeatured: false, images: [], variants: []
      });
    } catch (e) {
      alert("Lỗi lưu sản phẩm: " + (e.message || JSON.stringify(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-[#A3AED0] hover:text-[#2B3674] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-[#2B3674]">Thêm sản phẩm mới</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveAndNew}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4318FF] text-white rounded-xl font-bold shadow-sm hover:bg-[#3911D1] transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu và thêm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* A. Thông tin cơ bản */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E0E5F2]">
            <h3 className="text-lg font-bold text-[#2B3674] mb-4">A. Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên sản phẩm *</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Đường dẫn (Slug)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-3 border border-[#E0E5F2] bg-[#F4F7FE] rounded-xl outline-none text-[#A3AED0]"
                  placeholder="tu-dong-tao-tu-ten-san-pham"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Danh mục *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] bg-white"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Thương hiệu</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] bg-white"
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Mô tả chi tiết</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674]"
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>
            </div>
          </div>

          {/* D. Biến thể */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E0E5F2]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2B3674]">D. Biến thể sản phẩm (Tùy chọn)</h3>
              <button 
                onClick={addVariant}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#F4F7FE] text-[#4318FF] rounded-lg text-sm font-bold hover:bg-[#E0E5F2] transition-colors"
              >
                <Plus size={16} /> Thêm biến thể
              </button>
            </div>
            {formData.variants.length > 0 && (
              <div className="mb-4 p-4 bg-[#F4F7FE] rounded-xl border border-[#E0E5F2]">
                <h4 className="text-sm font-bold text-[#2B3674] mb-3">Cấu hình Thuộc tính</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2B3674] mb-1">Thuộc tính 1 *</label>
                    <input
                      type="text"
                      value={attr1Name}
                      onChange={(e) => setAttr1Name(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                      placeholder="VD: Màu sắc"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#2B3674]">Thuộc tính 2</label>
                      {!hasAttr2 ? (
                        <button onClick={() => setHasAttr2(true)} className="text-[10px] text-[#4318FF] font-bold">+ Thêm</button>
                      ) : (
                        <button onClick={() => setHasAttr2(false)} className="text-[10px] text-[#EE5D50] font-bold">Xóa</button>
                      )}
                    </div>
                    {hasAttr2 && (
                      <input
                        type="text"
                        value={attr2Name}
                        onChange={(e) => setAttr2Name(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                        placeholder="VD: Phiên bản"
                      />
                    )}
                  </div>
                </div>
                {hasAttr2 && attr1Name.trim().toLowerCase() === attr2Name.trim().toLowerCase() && (
                  <p className="text-xs text-[#EE5D50] font-bold mt-2">Trùng lặp thuộc tính!</p>
                )}
              </div>
            )}

            {formData.variants.length === 0 ? (
              <p className="text-sm text-[#A3AED0] italic">Chưa có biến thể nào. Sản phẩm sẽ sử dụng giá và tồn kho mặc định.</p>
            ) : (
              <div className="space-y-4">
                {formData.variants.map((variant, vIdx) => (
                  <div key={vIdx} className="p-4 border border-[#E0E5F2] rounded-xl bg-white relative hover:border-[#4318FF]/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Hàng 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                          <div className="lg:col-span-2">
                            <label className="block text-xs font-bold text-[#2B3674] mb-1">Tên biến thể (SKU) *</label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => updateVariant(vIdx, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                              placeholder="VD: Đen - 256GB"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#2B3674] mb-1">{attr1Name || 'Thuộc tính 1'} *</label>
                            {(attr1Name || '').trim().toLowerCase() === 'dung lượng ram - rom' ? (
                              <div className="flex items-center gap-1 border border-[#E0E5F2] rounded-lg px-2 bg-white h-9 focus-within:border-[#4318FF] focus-within:ring-1 focus-within:ring-[#4318FF] w-fit">
                                <input
                                  type="number"
                                  placeholder="RAM"
                                  value={parseRamRom(variant.attr1Value).ram}
                                  onChange={(e) => {
                                    const { rom } = parseRamRom(variant.attr1Value);
                                    updateVariant(vIdx, 'attr1Value', `${e.target.value || '0'}GB - ${rom || '0'}GB`);
                                  }}
                                  className="w-10 border-none outline-none text-sm text-center bg-transparent p-0"
                                />
                                <span className="text-[10px] text-gray-400 font-bold shrink-0">GB</span>
                                <span className="text-gray-300 px-0.5 shrink-0">/</span>
                                <input
                                  type="number"
                                  placeholder="ROM"
                                  value={parseRamRom(variant.attr1Value).rom}
                                  onChange={(e) => {
                                    const { ram } = parseRamRom(variant.attr1Value);
                                    updateVariant(vIdx, 'attr1Value', `${ram || '0'}GB - ${e.target.value || '0'}GB`);
                                  }}
                                  className="w-14 border-none outline-none text-sm text-center bg-transparent p-0"
                                />
                                <span className="text-[10px] text-gray-400 font-bold shrink-0">GB</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={variant.attr1Value}
                                onChange={(e) => updateVariant(vIdx, 'attr1Value', e.target.value)}
                                className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                                placeholder="VD: Đen"
                              />
                            )}
                          </div>
                          {hasAttr2 && (
                            <div>
                              <label className="block text-xs font-bold text-[#2B3674] mb-1">{attr2Name || 'Thuộc tính 2'} *</label>
                              {(attr2Name || '').trim().toLowerCase() === 'dung lượng ram - rom' ? (
                                <div className="flex items-center gap-1 border border-[#E0E5F2] rounded-lg px-2 bg-white h-9 focus-within:border-[#4318FF] focus-within:ring-1 focus-within:ring-[#4318FF] w-fit">
                                  <input
                                    type="number"
                                    placeholder="RAM"
                                    value={parseRamRom(variant.attr2Value).ram}
                                    onChange={(e) => {
                                      const { rom } = parseRamRom(variant.attr2Value);
                                      updateVariant(vIdx, 'attr2Value', `${e.target.value || '0'}GB - ${rom || '0'}GB`);
                                    }}
                                    className="w-10 border-none outline-none text-sm text-center bg-transparent p-0"
                                  />
                                  <span className="text-[10px] text-gray-400 font-bold shrink-0">GB</span>
                                  <span className="text-gray-300 px-0.5 shrink-0">/</span>
                                  <input
                                    type="number"
                                    placeholder="ROM"
                                    value={parseRamRom(variant.attr2Value).rom}
                                    onChange={(e) => {
                                      const { ram } = parseRamRom(variant.attr2Value);
                                      updateVariant(vIdx, 'attr2Value', `${ram || '0'}GB - ${e.target.value || '0'}GB`);
                                    }}
                                    className="w-14 border-none outline-none text-sm text-center bg-transparent p-0"
                                  />
                                  <span className="text-[10px] text-gray-400 font-bold shrink-0">GB</span>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={variant.attr2Value}
                                  onChange={(e) => updateVariant(vIdx, 'attr2Value', e.target.value)}
                                  className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                                  placeholder="VD: 256GB"
                                />
                              )}
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-bold text-[#2B3674] mb-1">Giá bán (VNĐ)</label>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => updateVariant(vIdx, 'price', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                              placeholder="Để trống = Giá SP"
                            />
                          </div>
                        </div>

                        {/* Hàng 2 */}
                        <div className="flex flex-wrap items-end gap-6 border-t border-gray-100 pt-3">
                          <div>
                            <label className="block text-xs font-bold text-[#2B3674] mb-1">Hình ảnh biến thể</label>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg border border-[#E0E5F2] flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                                {variant.imageId ? (
                                  <img src={variant.imageId} alt="Variant" className="w-full h-full object-contain" />
                                ) : (
                                  <ImageIcon className="text-[#A3AED0]" size={16} />
                                )}
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 bg-[#F4F7FE] text-[#4318FF] hover:bg-[#E0E5F2] text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                                >
                                  Tải ảnh
                                </button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    try {
                                      const res = await productService.uploadLocalImage(file);
                                      if (res && res.url) {
                                        let finalUrl = res.url;
                                        if (finalUrl.startsWith('/')) {
                                          const apiBase = import.meta.env.VITE_API_URL || 'https://localhost:7279/api';
                                          const hostBase = apiBase.replace('/api', '');
                                          finalUrl = `${hostBase}${finalUrl}`;
                                        }
                                        updateVariant(vIdx, 'imageId', finalUrl);
                                      }
                                    } catch (err) {
                                      alert("Lỗi tải ảnh: " + err.message);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              {variant.imageId && (
                                <button
                                  type="button"
                                  onClick={() => updateVariant(vIdx, 'imageId', '')}
                                  className="text-[#EE5D50] hover:text-red-700 text-xs font-bold"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="w-32">
                            <label className="block text-xs font-bold text-[#2B3674] mb-1">Tồn kho</label>
                            <input
                              type="number"
                              value={variant.totalStock}
                              onChange={(e) => updateVariant(vIdx, 'totalStock', e.target.value)}
                              className="w-full px-3 py-2 border border-[#E0E5F2] rounded-lg text-sm outline-none focus:border-[#4318FF]"
                            />
                          </div>

                          <div className="flex items-center pb-2.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={variant.isActive}
                                onChange={(e) => updateVariant(vIdx, 'isActive', e.target.checked)}
                                className="w-4 h-4 text-[#4318FF] border-[#E0E5F2] rounded focus:ring-[#4318FF]"
                              />
                              <span className="text-xs font-bold text-[#2B3674]">Đang bán</span>
                            </label>
                          </div>

                          <div className="flex items-center pb-1">
                            <button
                              type="button"
                              disabled
                              title="Lưu sản phẩm sẽ tự động lưu các biến thể này"
                              className="px-4 py-2 bg-gray-200 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed"
                            >
                              Lưu biến thể
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeVariant(vIdx)}
                        className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-red-50 rounded-lg transition-colors mt-5"
                        title="Xóa biến thể"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* B. Giá cả */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E0E5F2]">
            <h3 className="text-lg font-bold text-[#2B3674] mb-4">B. Giá cả cơ bản</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá khuyến mãi / Giá bán *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] outline-none text-[#2B3674]"
                  />
                  <span className="absolute right-4 top-3.5 text-[#A3AED0] font-bold text-sm">VNĐ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Giá gốc</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] outline-none text-[#2B3674]"
                  />
                  <span className="absolute right-4 top-3.5 text-[#A3AED0] font-bold text-sm">VNĐ</span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Trạng thái */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E0E5F2]">
            <h3 className="text-lg font-bold text-[#2B3674] mb-4">C. Trạng thái hiển thị</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 text-[#4318FF] border-[#E0E5F2] rounded focus:ring-[#4318FF]"
                />
                <span className="text-sm font-bold text-[#2B3674]">Đang bán (Active)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-5 h-5 text-[#FFB547] border-[#E0E5F2] rounded focus:ring-[#FFB547]"
                />
                <span className="text-sm font-bold text-[#2B3674]">Sản phẩm nổi bật</span>
              </label>
            </div>
          </div>

          {/* E. Hình ảnh */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E0E5F2]">
            <h3 className="text-lg font-bold text-[#2B3674] mb-4">E. Hình ảnh sản phẩm</h3>
            <div className="border-2 border-dashed border-[#E0E5F2] rounded-xl p-6 flex flex-col items-center justify-center bg-[#F4F7FE]/30 relative hover:border-[#4318FF] transition-colors mb-4">
              <input
                type="file" multiple accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-[#4318FF]">
                  <Loader2 size={32} className="animate-spin" />
                  <span className="text-sm font-bold">Đang tải...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-[#A3AED0]">
                  <UploadCloud size={32} className="mb-2" />
                  <span className="text-sm font-bold text-[#2B3674]">Tải ảnh từ máy tính</span>
                  <span className="text-xs mt-1">Hỗ trợ nhiều ảnh</span>
                </div>
              )}
            </div>

            {formData.images.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#E0E5F2] text-[10px] text-[#A3AED0] uppercase">
                      <th className="pb-2">Hình ảnh</th>
                      <th className="pb-2">Preview</th>
                      <th className="pb-2 text-center w-24">Ảnh đại diện</th>
                      <th className="pb-2 text-center w-20">Thứ tự</th>
                      <th className="pb-2 text-right">Tùy chọn xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.images.map((img, idx) => (
                      <tr key={idx} className="border-b border-[#E0E5F2] last:border-0">
                        <td className="py-2 text-xs text-[#2B3674] max-w-[120px] truncate" title={img.url}>
                          {img.url.split('/').pop()}
                        </td>
                        <td className="py-2">
                          <img src={img.url} alt="preview" className="w-10 h-10 object-cover rounded bg-gray-100" />
                        </td>
                        <td className="py-2 text-center">
                          <input 
                            type="radio" 
                            name="mainImage" 
                            checked={img.isMain} 
                            onChange={() => setMainImage(idx)}
                            className="w-4 h-4 text-[#4318FF] cursor-pointer"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input 
                            type="number" 
                            value={img.order} 
                            onChange={(e) => updateImageOrder(idx, e.target.value)}
                            className="w-12 px-1 py-1 text-center border border-[#E0E5F2] rounded outline-none focus:border-[#4318FF] text-xs"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <button onClick={() => removeImage(idx)} className="text-[#A3AED0] hover:text-[#EE5D50] p-1">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
