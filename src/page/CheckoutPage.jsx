import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import { CreditCard, Truck, MapPin, FileText, CheckCircle2, ChevronRight, AlertCircle, Palette } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500 bg-white min-h-screen rounded-[3rem]">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100/50">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md font-medium">
          Cảm ơn bạn đã tin tưởng PhoneShop. Mã đơn hàng của bạn là <span className="font-bold text-blue-600">#PS{Math.floor(Math.random() * 100000)}</span>. 
          Chúng tôi sẽ sớm liên hệ xác nhận qua số điện thoại của bạn.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"
        >
          TIẾP TỤC MUA SẮM
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 rounded-[3rem] overflow-hidden shadow-sm border border-gray-100">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[{ label: 'Giỏ hàng', link: '/cart' }, { label: 'Thanh toán' }]} />
        
        <div className="mt-8">
          <div className="flex items-center gap-5 mb-12">
            <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-200 text-white">
              <CreditCard size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Đặt hàng & Thanh toán</h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1 opacity-70">Xác nhận thông tin & Chọn phương thức</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cột trái: Thông tin khách hàng */}
            <div className="lg:col-span-8 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Card thông tin */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-10 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">Thông tin giao hàng</h2>
                    {!isLoggedIn && (
                      <span className="ml-auto text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-orange-200">
                        Khách vãng lai
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên người nhận *</label>
                      <input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="VD: Nguyễn Văn A"
                        className={`w-full bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                      />
                      {errors.fullName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại *</label>
                      <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0xxx xxx xxx"
                        className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                      />
                      {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phone}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ giao hàng chi tiết *</label>
                      <input 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường, phường/xã..."
                        className={`w-full bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                      />
                      {errors.address && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.address}</p>}
                    </div>
                    {!isLoggedIn && (
                      <div className="md:col-span-2 space-y-2.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email liên hệ *</label>
                        <input 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                        />
                        {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-10 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">Phương thức thanh toán</h2>
                  </div>

                  <div className="space-y-4">
                    {isLoggedIn && (
                      <label className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cod' ? 'border-blue-500' : 'border-gray-300'}`}>
                          {formData.paymentMethod === 'cod' && <div className="w-3 h-3 bg-blue-500 rounded-full animate-in zoom-in"></div>}
                        </div>
                        <input type="radio" name="paymentMethod" value="cod" className="hidden" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} />
                        <div className="flex-1">
                          <p className="font-black text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter italic">Giao hàng và thu tiền tận nơi</p>
                        </div>
                        <Truck className={formData.paymentMethod === 'cod' ? 'text-blue-500' : 'text-gray-300'} />
                      </label>
                    )}

                    <label className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'transfer' ? 'border-blue-500' : 'border-gray-300'}`}>
                        {formData.paymentMethod === 'transfer' && <div className="w-3 h-3 bg-blue-500 rounded-full animate-in zoom-in"></div>}
                      </div>
                      <input type="radio" name="paymentMethod" value="transfer" className="hidden" checked={formData.paymentMethod === 'transfer'} onChange={handleInputChange} />
                      <div className="flex-1">
                        <p className="font-black text-gray-900">Chuyển khoản ngân hàng</p>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter italic">Ưu tiên xác nhận nhanh, nhận thêm mã giảm giá</p>
                      </div>
                      <CreditCard className={formData.paymentMethod === 'transfer' ? 'text-blue-500' : 'text-gray-300'} />
                    </label>

                    {!isLoggedIn && (
                      <div className="p-5 bg-orange-50 border border-orange-100 rounded-[1.5rem] flex gap-4 text-orange-700 shadow-inner">
                        <AlertCircle size={24} className="shrink-0 text-orange-500" />
                        <p className="text-xs font-bold leading-relaxed italic uppercase tracking-tighter">
                          Lưu ý: Đối với <strong className="text-orange-900">Khách vãng lai</strong>, chúng tôi chỉ áp dụng thanh toán qua chuyển khoản để đảm bảo tính minh bạch và an toàn cho đơn hàng của bạn.
                        </p>
                      </div>
                    )}
                  </div>

                  {formData.paymentMethod === 'transfer' && (
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-200 space-y-6 animate-in slide-in-from-top-4 duration-300">
                       <h3 className="font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                         <Palette size={14} />
                         Thông tin tài khoản nhận tiền
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                          <div className="space-y-4">
                            <div className="flex justify-between text-xs border-b border-gray-200 pb-3">
                              <span className="text-gray-400 font-bold uppercase tracking-tighter">Ngân hàng:</span>
                              <span className="font-black text-gray-900">MB BANK (Quân Đội)</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-gray-200 pb-3">
                              <span className="text-gray-400 font-bold uppercase tracking-tighter">Chủ tài khoản:</span>
                              <span className="font-black text-gray-900 uppercase">PhoneShop Official</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-gray-200 pb-3">
                              <span className="text-gray-400 font-bold uppercase tracking-tighter">Số tài khoản:</span>
                              <span className="font-black text-blue-600 tracking-widest text-base">098 7654 3210</span>
                            </div>
                            <div className="flex justify-between text-xs pt-2">
                              <span className="text-gray-400 font-bold uppercase tracking-tighter">Số tiền cần thanh toán:</span>
                              <span className="font-black text-2xl text-red-600">{cartTotal.toLocaleString('vi-VN')}₫</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                             <div className="w-40 h-40 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 shadow-inner">
                               <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v6H3V3zm1 1v4h4V4H4zm1 1h2v2H5V5zM3 15h6v6H3v-6zm1 1v4h4v-4H4zm1 1h2v2H5v-2zM15 3h6v6h-6V3zm1 1v4h4V4h-4zm1 1h2v2h-2V5zM15 15h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 2v2h-2v-2zm2 0h2v2h-2v-2zM10 3h4v2h-4V3zm0 4h4v2h-4V7zm0 8h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/></svg>
                             </div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quét QR để chuyển khoản nhanh</span>
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">Ghi chú thêm</h2>
                  </div>
                  <textarea 
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400 resize-none"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-8">
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-xl shadow-gray-200/50">
                  <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6">Đơn hàng của bạn</h2>
                  
                  <div className="space-y-6 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.cartId} className="flex gap-5 group">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border border-gray-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic leading-tight">{item.selectedStorage} | SL: {item.quantity}</p>
                          <p className="text-sm font-black text-blue-600 mt-2 break-words">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-gray-50 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-tighter gap-2">
                      <span className="shrink-0">Tạm tính ({cartItems.length} SP)</span>
                      <span className="text-gray-900 text-right">{cartTotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-tighter gap-2">
                      <span className="shrink-0">Phí vận chuyển</span>
                      <span className="text-green-600 font-black text-right">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-center pt-6 flex-wrap gap-2">
                      <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Tổng cộng</span>
                      <span className="text-2xl sm:text-3xl font-black text-red-600 text-right break-words">{cartTotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] text-xl uppercase shadow-2xl shadow-blue-200 transition-all transform active:scale-95 mt-10 flex items-center justify-center gap-3 group"
                  >
                    XÁC NHẬN ĐẶT HÀNG
                    <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
                
                <div className="bg-blue-600 rounded-[2.5rem] p-8 flex gap-5 items-center text-white shadow-lg shadow-blue-100">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Truck size={30} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-lg font-black uppercase tracking-tight">Giao hàng miễn phí</p>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-tighter mt-0.5">Nhận hàng thần tốc toàn quốc</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
