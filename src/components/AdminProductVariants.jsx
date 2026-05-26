import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, Save, ArrowLeft, Check, Palette } from 'lucide-react';

export default function AdminProductVariants({ product, onBack }) {
  const [variants, setVariants] = useState([
    { id: 421, image: product.image || 'https://applecenter.com.vn/uploads/2023/iphone-15-pro-max-black-titanium.jpg', capacity: '512 GB', color: 'Đen', colorCode: '#000000', price: 26000000, stock: 5 },
    { id: 422, image: product.image || 'https://applecenter.com.vn/uploads/2023/iphone-15-pro-max-black-titanium.jpg', capacity: '256 GB', color: 'Titan', colorCode: '#8e8e93', price: 23000000, stock: 12 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVariant, setNewVariant] = useState({
    capacity: '128 GB',
    color: '',
    colorCode: '#007aff',
    price: product.price || 0,
    stock: 0,
    image: null
  });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa biến thể này?')) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const handleAddVariant = (e) => {
    e.preventDefault();
    const id = Math.floor(Math.random() * 1000);
    setVariants([...variants, { ...newVariant, id, image: product.image }]);
    setShowAddModal(false);
    setNewVariant({ capacity: '128 GB', color: '', colorCode: '#007aff', price: product.price || 0, stock: 0, image: null });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 pb-20 bg-gray-50/50 min-h-screen">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Quay lại danh sách</span>
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} />
          THÊM BIẾN THỂ
        </button>
      </div>

      {/* Product Summary Card - Light Theme */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-40 h-40 bg-gray-50 rounded-3xl p-4 border border-gray-100 flex items-center justify-center shrink-0 shadow-inner">
            <img src={product.image || 'https://applecenter.com.vn/uploads/2023/iphone-15-pro-max-black-titanium.jpg'} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{product.name}</h2>
            <p className="text-blue-600 font-bold text-2xl">{product.price?.toLocaleString('vi-VN')}₫</p>
            <div className="inline-flex items-center px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Danh mục: {product.categoryName || 'iPhone'}
            </div>
          </div>
        </div>
      </div>

      {/* Variants Table - Light Theme */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Danh sách biến thể</h3>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">{variants.length} Phiên bản</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Mã</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Hình ảnh</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Giá trị (Dung lượng / Màu)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Giá bán</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Tồn kho</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-gray-300 font-bold">#{v.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 p-2 shadow-sm group-hover:scale-110 transition-transform">
                      <img src={v.image} alt="variant" className="w-full h-full object-contain" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Dung lượng: <span className="text-blue-600">{v.capacity}</span></span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: v.colorCode }}></div>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter italic">Màu sắc: {v.color} ({v.colorCode})</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-gray-900 text-lg">{v.price.toLocaleString('vi-VN')}₫</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${v.stock > 0 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                      {v.stock} sản phẩm
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Variant Modal - Light Theme */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white border border-gray-100 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-blue-600 px-8 py-6 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Thêm biến thể mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Color Input - HEX Picker */}
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thông tin màu sắc</label>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="text-[9px] font-bold text-gray-400 uppercase ml-1">Tên màu</p>
                      <input
                        type="text"
                        required
                        placeholder="VD: Xanh Titan, Đen Nhám..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                        value={newVariant.color}
                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <p className="text-[9px] font-bold text-gray-400 uppercase ml-1">Mã HEX</p>
                      <div className="relative group">
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          value={newVariant.colorCode}
                          onChange={(e) => setNewVariant({ ...newVariant, colorCode: e.target.value })}
                        />
                        <div
                          className="w-full h-[52px] rounded-2xl border border-gray-200 shadow-sm"
                          style={{ backgroundColor: newVariant.colorCode }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Select */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dung lượng</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['128 GB', '256 GB', '512 GB', '1 T', '2 T'].map(cap => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setNewVariant({ ...newVariant, capacity: cap })}
                        className={`py-3.5 rounded-2xl text-xs font-bold border transition-all ${newVariant.capacity === cap ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'}`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giá bán</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tồn kho</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                  />
                </div>

                {/* Image Placeholder */}
                <div className="col-span-2">
                  <div className="w-full h-28 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500/40 hover:text-blue-500 cursor-pointer transition-all">
                    <ImageIcon size={28} className="mb-1.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Tải ảnh cho biến thể</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  XÁC NHẬN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
