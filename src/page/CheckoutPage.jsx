import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import { CreditCard, Truck, MapPin, FileText, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Giả lập trạng thái đăng nhập (sau này lấy từ context auth)
  const isLoggedIn = false; 

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hồ Chí Minh',
    district: '',
    note: '',
    paymentMethod: isLoggedIn ? 'cod' : 'transfer' // Khách vãng lai mặc định là transfer
  });

  const [isFinished, setIsFinished] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cartItems.length === 0 && !isFinished) {
      navigate('/cart');
    }
  }, [cartItems, navigate, isFinished]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!isLoggedIn && !formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Xử lý đặt hàng ở đây (gọi API)
      console.log('Order submitted:', { items: cartItems, customer: formData });
      setIsFinished(true);
      clearCart();
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Cảm ơn bạn đã tin tưởng PhoneShop. Mã đơn hàng của bạn là <span className="font-bold text-blue-600">#PS{Math.floor(Math.random() * 100000)}</span>. 
          Chúng tôi sẽ sớm liên hệ xác nhận.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95"
        >
          TIẾP TỤC MUA SẮM
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 rounded-3xl overflow-hidden shadow-2xl">
      <Breadcrumb items={[{ label: 'Giỏ hàng', link: '/cart' }, { label: 'Thanh toán' }]} />
      
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Đặt hàng & Thanh toán</h1>
            <p className="text-gray-400 text-sm font-medium">Hoàn tất thông tin để sở hữu siêu phẩm ngay</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Thông tin khách hàng */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card thông tin */}
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <MapPin size={20} className="text-blue-400" />
                  <h2 className="text-lg font-bold">Thông tin giao hàng</h2>
                  {!isLoggedIn && (
                    <span className="ml-auto text-[10px] font-black bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg uppercase tracking-widest">
                      Khách vãng lai
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên *</label>
                    <input 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="VD: Nguyễn Văn A"
                      className={`w-full bg-[#0f172a] border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-white placeholder:text-gray-600`}
                    />
                    {errors.fullName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại *</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại nhận hàng"
                      className={`w-full bg-[#0f172a] border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-white placeholder:text-gray-600`}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ nhận hàng *</label>
                    <input 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường, phường/xã..."
                      className={`w-full bg-[#0f172a] border ${errors.address ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-white placeholder:text-gray-600`}
                    />
                    {errors.address && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.address}</p>}
                  </div>
                  {!isLoggedIn && (
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email (Nhận thông báo đơn hàng) *</label>
                      <input 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className={`w-full bg-[#0f172a] border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-white placeholder:text-gray-600`}
                      />
                      {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <CreditCard size={20} className="text-blue-400" />
                  <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-4">
                  {isLoggedIn && (
                    <label className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-xs text-gray-400 mt-1">Giao hàng và thu tiền tận nơi</p>
                      </div>
                      <Truck className="text-gray-400" />
                    </label>
                  )}

                  <label className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-bold">Chuyển khoản ngân hàng</p>
                      <p className="text-xs text-gray-400 mt-1">Xác nhận nhanh chóng, nhiều ưu đãi đi kèm</p>
                    </div>
                    <CreditCard className="text-gray-400" />
                  </label>

                  {!isLoggedIn && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3 text-orange-200">
                      <AlertCircle size={20} className="shrink-0" />
                      <p className="text-xs leading-relaxed">
                        Đối với <strong>khách vãng lai</strong>, chúng tôi chỉ hỗ trợ thanh toán qua hình thức chuyển khoản để đảm bảo tính an toàn của đơn hàng.
                      </p>
                    </div>
                  )}
                </div>

                {formData.paymentMethod === 'transfer' && (
                  <div className="p-6 bg-[#0f172a] rounded-3xl border border-blue-500/20 space-y-4 animate-in slide-in-from-top-4">
                     <h3 className="font-bold text-blue-400 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                       Thông tin chuyển khoản
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                            <span className="text-gray-500">Ngân hàng:</span>
                            <span className="font-bold">MB BANK</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                            <span className="text-gray-500">Chủ TK:</span>
                            <span className="font-bold uppercase">PhoneShop Admin</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                            <span className="text-gray-500">Số TK:</span>
                            <span className="font-bold text-blue-400 tracking-wider">09876543210</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Số tiền:</span>
                            <span className="font-black text-lg text-red-500">{cartTotal.toLocaleString('vi-VN')}₫</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl shadow-inner">
                           <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                             {/* Giả lập mã QR */}
                             <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v6H3V3zm1 1v4h4V4H4zm1 1h2v2H5V5zM3 15h6v6H3v-6zm1 1v4h4v-4H4zm1 1h2v2H5v-2zM15 3h6v6h-6V3zm1 1v4h4V4h-4zm1 1h2v2h-2V5zM15 15h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 2v2h-2v-2zm2 0h2v2h-2v-2zM10 3h4v2h-4V3zm0 4h4v2h-4V7zm0 8h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/></svg>
                           </div>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Quét để thanh toán</span>
                        </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-blue-400" />
                  <h2 className="text-lg font-bold">Ghi chú (Tùy chọn)</h2>
                </div>
                <textarea 
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Yêu cầu cụ thể của bạn về đơn hàng..."
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-white placeholder:text-gray-600 resize-none"
                ></textarea>
              </div>
            </form>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                <h2 className="text-xl font-bold mb-6 border-b border-white/5 pb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex gap-4 group">
                      <div className="w-16 h-16 bg-[#0f172a] rounded-2xl p-2 border border-white/5 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.selectedStorage} | SL: {item.quantity}</p>
                        <p className="text-sm font-black text-blue-400 mt-1">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span>{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-500 font-bold uppercase text-[10px]">Miễn phí</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-bold">Tổng tiền</span>
                    <span className="text-2xl font-black text-red-500">{cartTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl text-lg uppercase shadow-2xl shadow-blue-500/20 transition-all transform active:scale-95 mt-8 flex items-center justify-center gap-2 group"
                >
                  ĐẶT HÀNG NGAY
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 italic">
                  Bằng cách đặt hàng, bạn đồng ý với các điều khoản của chúng tôi.
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 flex gap-4 items-center">
                 <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                    <Truck size={24} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-blue-400">Giao hàng siêu tốc</p>
                    <p className="text-[11px] text-blue-300 opacity-80">Nhận hàng trong vòng 24h tại nội thành</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
