import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import { CreditCard, Truck, MapPin, FileText, CheckCircle2, ChevronRight, AlertCircle, Palette, Check, ChevronLeft, User, Lock, Gift } from 'lucide-react';
import { shippingInfoService } from '../services/shippingInfoService';
import { orderService } from '../services/orderService';
import api from '../services/api';
import PromotionSelector from '../components/PromotionSelector';
import OtpVerification from '../components/OtpVerification';

// Dữ liệu địa chỉ rút gọn của Việt Nam
const VIETNAM_ADDRESSES = {
  'Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Phạm Ngũ Lão', 'Phường Nguyễn Cư Trinh', 'Phường Đa Kao'],
    'Quận 3': ['Phường Võ Thị Sáu', 'Phường 11', 'Phường 12', 'Phường 14', 'Phường 5'],
    'Quận 10': ['Phường 1', 'Phường 2', 'Phường 12', 'Phường 15', 'Phường 14'],
    'Bình Thạnh': ['Phường 15', 'Phường 25', 'Phường 26', 'Phường 19', 'Phường 21'],
    'Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 5', 'Phường 10', 'Phường 15']
  },
  'Hà Nội': {
    'Hoàn Kiếm': ['Phường Hàng Bạc', 'Phường Hàng Bông', 'Phường Tràng Tiền', 'Phường Lý Thái Tổ'],
    'Ba Đình': ['Phường Cống Vị', 'Phường Kim Mã', 'Phường Ngọc Khánh', 'Phường Giảng Võ'],
    'Đống Đa': ['Phường Cát Linh', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa'],
    'Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Tân']
  },
  'Đà Nẵng': {
    'Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam'],
    'Thanh Khê': ['Phường An Khê', 'Phường Chính Gián', 'Phường Tam Thuận', 'Phường Thạc Gián'],
    'Liên Chiểu': ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam']
  }
};

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Lấy thông tin user từ localStorage
  let currentUser = null;
  try {
    const userJson = localStorage.getItem('user');
    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      currentUser = JSON.parse(userJson);
      
      const token = localStorage.getItem('token');
      if (!currentUser.username && token) {
        try {
          const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadJson = decodeURIComponent(atob(payloadBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(payloadJson);
          currentUser.username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.unique_name || payload.name || payload.sub;
        } catch (e) {
          console.error("Lỗi decode token:", e);
        }
      }
    }
  } catch (err) {
    console.error("Lỗi parse user:", err);
    localStorage.removeItem('user');
  }
  
  const isLoggedIn = !!(currentUser && (currentUser.id || currentUser.Id)); 

  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.username || currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    address: '',
    city: 'Hồ Chí Minh',
    district: '',
    note: '',
    paymentMethod: isLoggedIn ? 'cod' : 'transfer' 
  });

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [checkoutOtp, setCheckoutOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);

  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States dành cho Địa chỉ Dropdowns Việt Nam
  const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  // Phục vụ nhập thủ công tỉnh khác
  const [customDistrict, setCustomDistrict] = useState('');
  const [customWard, setCustomWard] = useState('');

  // States Đăng ký tài khoản ngầm cho khách vãng lai
  const [createAccount, setCreateAccount] = useState(false);
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // State Điểm thưởng
  const [usePoints, setUsePoints] = useState(false);

  // State Khuyến mãi Voucher
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Step cho Khách vãng lai (Step 1: Info, Step 2: Payment)
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Lấy địa chỉ đã lưu cho User đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      shippingInfoService.getAll()
        .then(res => {
          if (Array.isArray(res) && res.length > 0) {
            setShippingAddresses(res);
            const defaultAddr = res.find(addr => addr.isDefault) || res[0];
            setSelectedAddressId(defaultAddr.id);
            
            setFormData(prev => ({
              ...prev,
              fullName: defaultAddr.recipientName || prev.fullName,
              phone: defaultAddr.phoneNumber || prev.phone,
              address: `${defaultAddr.addressLine}, ${defaultAddr.ward}, ${defaultAddr.province}`
            }));
          } else {
            setSelectedAddressId('new');
          }
        })
        .catch(err => {
          console.error("Lỗi lấy danh sách địa chỉ nhận hàng:", err);
          setSelectedAddressId('new');
        });
    } else {
      setSelectedAddressId('new');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (cartItems.length === 0 && !isFinished) {
      navigate('/cart');
    }
  }, [cartItems, navigate, isFinished]);

  // Đồng bộ dropdown địa chỉ sang formData.address
  useEffect(() => {
    if (selectedAddressId === 'new') {
      const city = selectedCity;
      const district = city === 'Tỉnh/Thành khác' ? customDistrict : selectedDistrict;
      const ward = city === 'Tỉnh/Thành khác' ? customWard : selectedWard;
      
      const parts = [];
      if (streetAddress.trim()) parts.push(streetAddress.trim());
      if (ward) parts.push(ward);
      if (district) parts.push(district);
      if (city) parts.push(city);
      
      setFormData(prev => ({
        ...prev,
        address: parts.join(', '),
        city: city,
        district: district
      }));
    }
  }, [selectedCity, selectedDistrict, selectedWard, streetAddress, customDistrict, customWard, selectedAddressId]);

  // Reset dropdown con khi đổi tỉnh/thành
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedDistrict('');
    setSelectedWard('');
    setCustomDistrict('');
    setCustomWard('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedWard('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Tính toán toán học hóa đơn
  const pointsDiscount = usePoints ? Math.min(50000, cartTotal - discountAmount) : 0;
  const finalTotalPay = cartTotal - discountAmount - pointsDiscount;

  // Validate form cho bước 1 (Khách vãng lai)
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    
    if (selectedAddressId === 'new') {
      if (!streetAddress.trim()) newErrors.address = 'Vui lòng nhập số nhà, tên đường';
      
      if (selectedCity === 'Tỉnh/Thành khác') {
        if (!customDistrict.trim()) newErrors.district = 'Vui lòng nhập quận/huyện';
        if (!customWard.trim()) newErrors.ward = 'Vui lòng nhập phường/xã';
      } else {
        if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
        if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';
      }
    }

    if (createAccount) {
      if (!registerPassword) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (registerPassword.length < 6) {
        newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
      }
      if (registerPassword !== registerConfirmPassword) {
        newErrors.passwordConfirm = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate toàn bộ form trước khi gửi (Dành cho One-page Checkout của hội viên)
  const validateMemberForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    
    if (selectedAddressId === 'new') {
      if (!streetAddress.trim()) newErrors.address = 'Vui lòng nhập số nhà, tên đường';
      if (selectedCity === 'Tỉnh/Thành khác') {
        if (!customDistrict.trim()) newErrors.district = 'Vui lòng nhập quận/huyện';
        if (!customWard.trim()) newErrors.ward = 'Vui lòng nhập phường/xã';
      } else {
        if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
        if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCheckoutStep(2);
    }
  };

  // Gửi đơn hàng (Checkout)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 1. Kiểm tra Validate
    if (isLoggedIn) {
      if (!validateMemberForm()) return;
    } else {
      if (checkoutStep === 1) {
        if (!validateStep1()) return;
        setCheckoutStep(2);
        return;
      }
    }

    // Lấy ID địa chỉ để thanh toán
    let checkoutAddressId = null;
    if (selectedAddressId && selectedAddressId !== 'new') {
      checkoutAddressId = selectedAddressId;
    }

    // Chuẩn bị payload checkout trước
    const payload = {
      shippingInfoId: checkoutAddressId,
      recipientName: formData.fullName,
      phoneNumber: formData.phone,
      addressLine: formData.address,
      ward: selectedAddressId === 'new' ? (selectedCity === 'Tỉnh/Thành khác' ? customWard : selectedWard) : '',
      province: selectedAddressId === 'new' ? selectedCity : 'Hồ Chí Minh',
      promotionCode: appliedPromo || '',
      items: cartItems.map(item => ({
        productId: item.id || item.Id,
        storage: item.selectedStorage || '',
        color: item.selectedColor || '',
        quantity: item.quantity,
        price: item.price
      }))
    };

    setPendingPayload(payload);

    // Tạo mã OTP ngẫu nhiên và mở Modal xác thực
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCheckoutOtp(code);
    setOtpError('');
    setShowOtpModal(true);
  };

  const handleVerifyOrderOtp = async (otpCode) => {
    if (otpCode !== checkoutOtp) {
      setOtpError('Mã OTP không chính xác. Vui lòng nhập lại!');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');

    try {
      // 2. Nếu khách vãng lai, xử lý đăng ký tài khoản ngầm dưới nền
      if (!isLoggedIn) {
        let authUsername = formData.email.trim();
        let authPassword = registerPassword;

        if (!createAccount) {
          // Tạo ngẫu nhiên tài khoản ẩn để khách thanh toán
          const randSuffix = Math.floor(1000 + Math.random() * 9000);
          authUsername = `guest_${formData.phone}_${randSuffix}`;
          authPassword = `Guest@${formData.phone}`; // Mật khẩu an toàn dựa trên số điện thoại
        }

        try {
          // Thực hiện đăng ký
          await api.post('/Auth/register', {
            username: authUsername,
            email: formData.email.trim(),
            password: authPassword
          });

          // Đăng nhập để lấy Token
          const loginRes = await api.post('/Auth/login', {
            username: authUsername,
            password: authPassword
          });

          // Lưu token và profile để các cuộc gọi Cart và Checkout tiếp theo được đính kèm Authorization Header
          localStorage.setItem('token', loginRes.token);
          localStorage.setItem('user', JSON.stringify({
            id: loginRes.id,
            username: authUsername,
            email: formData.email.trim(),
            role: loginRes.role
          }));
        } catch (authErr) {
          console.error("Lỗi đăng ký/đăng nhập ngầm:", authErr);
          setOtpError("Lỗi tạo phiên giao dịch: " + (authErr.message || JSON.stringify(authErr)));
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Đồng bộ giỏ hàng từ localStorage lên database cart
      await api.delete('/Cart/clear');
      
      for (const item of cartItems) {
        const productId = item.id || item.Id;
        if (!productId) continue;

        let variants = await api.get(`/ProductVariant?productId=${productId}`);
        let matchedVariant = null;

        if (Array.isArray(variants) && variants.length > 0) {
          matchedVariant = variants.find(v => 
            v.name && (
              (item.selectedStorage && v.name.toLowerCase().includes(item.selectedStorage.toLowerCase())) ||
              (item.selectedColor && v.name.toLowerCase().includes(item.selectedColor.toLowerCase()))
            )
          );
          if (!matchedVariant) matchedVariant = variants[0];
        }

        if (matchedVariant) {
          await api.post('/CartItem', {
            variantId: matchedVariant.id,
            quantity: item.quantity
          });
        }
      }

      // 5. Gửi đơn hàng (Checkout)
      await orderService.checkout(pendingPayload);
      
      setShowOtpModal(false);
      setIsFinished(true);
      clearCart();
    } catch (err) {
      console.error('Lỗi đặt hàng:', err);
      let errorMsg = 'Lỗi hệ thống, vui lòng thử lại sau.';
      if (typeof err === 'string') {
        errorMsg = err;
      } else if (err && typeof err === 'object') {
        if (err.errors) {
          errorMsg = Object.entries(err.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        } else {
          errorMsg = err.title || err.message || JSON.stringify(err);
        }
      }
      setOtpError('Đặt hàng thất bại:\n' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Màn hình hoàn thành
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500 bg-white min-h-screen rounded-[3rem]">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100/50">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md font-medium px-4">
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
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-200 text-white">
              <CreditCard size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Đặt hàng & Thanh toán</h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1 opacity-70">
                {isLoggedIn ? 'Một trang thanh toán nhanh chóng' : 'Xác nhận thông tin giao hàng & Phương thức'}
              </p>
            </div>
          </div>

          {/* Thanh Tiến trình (Progress Bar) - Chỉ hiển thị cho KHÁCH VÃNG LAI */}
          {!isLoggedIn && (
            <div className="flex items-center justify-center gap-4 mb-10 pb-6 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCheckoutStep(1)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    checkoutStep === 1 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {checkoutStep > 1 ? '✓' : '1'}
                </button>
                <span className={`text-xs font-black tracking-tight ${checkoutStep === 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                  Thông tin giao nhận
                </span>
              </div>
              <div className={`w-14 h-0.5 transition-colors duration-300 ${checkoutStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  checkoutStep === 2 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
                <span className={`text-xs font-black tracking-tight ${checkoutStep === 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                  Thanh toán & Xác nhận
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & PHƯƠNG THỨC */}
            <div className="lg:col-span-8 space-y-8">
              {/* KHU VỰC 1: THÔNG TIN GIAO HÀNG */}
              {(!isLoggedIn || checkoutStep === 1) && (
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-8 shadow-sm">
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

                  {/* Sổ địa chỉ (Address Book) - Chỉ hiện khi ĐÃ đăng nhập */}
                  {isLoggedIn && shippingAddresses.length > 0 && (
                    <div className="space-y-4 border-b border-gray-50 pb-8">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chọn địa chỉ đã lưu *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                        {shippingAddresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setFormData(prev => ({
                                ...prev,
                                fullName: addr.recipientName,
                                phone: addr.phoneNumber,
                                address: `${addr.addressLine}, ${addr.ward}, ${addr.province}`
                              }));
                            }}
                            className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-gray-800 text-sm flex items-center gap-1.5">
                                {selectedAddressId === addr.id && <Check size={14} className="text-blue-500" strokeWidth={3} />}
                                {addr.recipientName}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">Mặc định</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-bold">{addr.phoneNumber}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{addr.addressLine}, {addr.ward}, {addr.province}</p>
                          </div>
                        ))}
                        <div 
                          onClick={() => {
                            setSelectedAddressId('new');
                            setFormData(prev => ({
                              ...prev,
                              fullName: currentUser?.username || currentUser?.name || '',
                              phone: '',
                              address: ''
                            }));
                            setStreetAddress('');
                            setSelectedDistrict('');
                            setSelectedWard('');
                          }}
                          className={`p-5 rounded-[2rem] border-2 border-dashed cursor-pointer flex flex-col items-center justify-center text-center transition-all ${selectedAddressId === 'new' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <span className="font-black text-sm text-gray-700">Giao đến địa chỉ khác</span>
                          <span className="text-[10px] text-gray-400 font-medium mt-1">Nhập thông tin nhận hàng mới</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form nhập liệu địa chỉ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Họ tên người nhận - Khóa khi chọn địa chỉ lưu sẵn */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên người nhận *</label>
                      <div className="relative">
                        <input 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={isLoggedIn && selectedAddressId !== 'new'}
                          placeholder="VD: Nguyễn Văn A"
                          className={`w-full bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400 ${isLoggedIn && selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                        {isLoggedIn && selectedAddressId !== 'new' && <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                      </div>
                      {errors.fullName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.fullName}</p>}
                    </div>

                    {/* Số điện thoại - Khóa khi chọn địa chỉ lưu sẵn */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại liên hệ *</label>
                      <div className="relative">
                        <input 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isLoggedIn && selectedAddressId !== 'new'}
                          placeholder="0xxx xxx xxx"
                          className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400 ${isLoggedIn && selectedAddressId !== 'new' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                        {isLoggedIn && selectedAddressId !== 'new' && <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                      </div>
                      {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phone}</p>}
                    </div>

                    {/* Email - Chỉ hiện cho Khách vãng lai */}
                    {!isLoggedIn && (
                      <div className="md:col-span-2 space-y-2.5 animate-in fade-in">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email nhận thông tin đơn hàng *</label>
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

                    {/* Chọn Địa chỉ 3 cấp độ chuẩn Việt Nam (Chỉ mở khi chọn Địa chỉ mới) */}
                    {selectedAddressId === 'new' && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                        {/* 1. Tỉnh/Thành phố */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tỉnh / Thành phố *</label>
                          <select 
                            value={selectedCity} 
                            onChange={handleCityChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 text-sm appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em 1.25em', backgroundRepeat: 'no-repeat' }}
                          >
                            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                            <option value="Tỉnh/Thành khác">Tỉnh / Thành khác</option>
                          </select>
                        </div>

                        {/* Dropdown Quận/Huyện và Phường/Xã cho 3 thành phố lớn */}
                        {selectedCity !== 'Tỉnh/Thành khác' ? (
                          <>
                            {/* 2. Quận/Huyện */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quận / Huyện *</label>
                              <select 
                                value={selectedDistrict} 
                                onChange={handleDistrictChange}
                                className={`w-full bg-gray-50 border ${errors.district ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 text-sm appearance-none`}
                                style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em 1.25em', backgroundRepeat: 'no-repeat' }}
                              >
                                <option value="">Chọn Quận/Huyện</option>
                                {Object.keys(VIETNAM_ADDRESSES[selectedCity] || {}).map(dist => (
                                  <option key={dist} value={dist}>{dist}</option>
                                ))}
                              </select>
                              {errors.district && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.district}</p>}
                            </div>

                            {/* 3. Phường/Xã */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phường / Xã *</label>
                              <select 
                                value={selectedWard} 
                                onChange={(e) => setSelectedWard(e.target.value)}
                                disabled={!selectedDistrict}
                                className={`w-full bg-gray-50 border ${errors.ward ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 text-sm appearance-none ${!selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em 1.25em', backgroundRepeat: 'no-repeat' }}
                              >
                                <option value="">Chọn Phường/Xã</option>
                                {(VIETNAM_ADDRESSES[selectedCity]?.[selectedDistrict] || []).map(ward => (
                                  <option key={ward} value={ward}>{ward}</option>
                                ))}
                              </select>
                              {errors.ward && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.ward}</p>}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Nhập Quận Huyện thủ công */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quận / Huyện *</label>
                              <input 
                                value={customDistrict}
                                onChange={(e) => setCustomDistrict(e.target.value)}
                                placeholder="Nhập Quận/Huyện..."
                                className={`w-full bg-gray-50 border ${errors.district ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                              />
                              {errors.district && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.district}</p>}
                            </div>

                            {/* Nhập Phường Xã thủ công */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phường / Xã *</label>
                              <input 
                                value={customWard}
                                onChange={(e) => setCustomWard(e.target.value)}
                                placeholder="Nhập Phường/Xã..."
                                className={`w-full bg-gray-50 border ${errors.ward ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                              />
                              {errors.ward && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.ward}</p>}
                            </div>
                          </>
                        )}

                        {/* Số nhà, Tên đường chi tiết */}
                        <div className="md:col-span-3 space-y-2.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số nhà, Tên đường chi tiết *</label>
                          <input 
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="Số nhà, ngõ, tên đường..."
                            className={`w-full bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400`}
                          />
                          {errors.address && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.address}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TÍCH HỢP ĐĂNG KÝ NGẦM - Chỉ hiện cho Khách vãng lai */}
                  {!isLoggedIn && (
                    <div className="space-y-4 pt-6 border-t border-gray-50">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={createAccount} 
                          onChange={(e) => setCreateAccount(e.target.checked)} 
                          className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                          Tạo tài khoản để tích điểm và theo dõi đơn hàng
                        </span>
                      </label>

                      {/* Trượt xuống nhập Mật khẩu */}
                      <div className={`transition-all duration-300 overflow-hidden ${
                        createAccount ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu mới *</label>
                            <input 
                              type="password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              placeholder="Mật khẩu từ 6 ký tự..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 text-sm placeholder:text-gray-400"
                            />
                            {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.password}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu *</label>
                            <input 
                              type="password"
                              value={registerConfirmPassword}
                              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                              placeholder="Xác nhận lại mật khẩu..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 text-sm placeholder:text-gray-400"
                            />
                            {errors.passwordConfirm && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.passwordConfirm}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nút chuyển sang bước Tiếp theo (Chỉ hiển thị ở Step 1 của Khách vãng lai) */}
                  {!isLoggedIn && (
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-200 transition-all flex items-center gap-2 group transform active:scale-95"
                      >
                        TIẾP TỤC THANH TOÁN
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* KHU VỰC 2: PHƯƠNG THỨC THANH TOÁN (Hiện ngay ở One-page hoặc ở Step 2 của khách) */}
              {(isLoggedIn || checkoutStep === 2) && (
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-10 shadow-sm animate-in slide-in-from-bottom-6 duration-300">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                    {/* Nút quay lại bước 1 cho khách vãng lai */}
                    {!isLoggedIn && (
                      <button 
                        onClick={() => setCheckoutStep(1)}
                        className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors mr-1"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">Phương thức thanh toán</h2>
                  </div>

                  <div className="space-y-4">
                    {/* COD - Chỉ khả dụng khi ĐÃ ĐĂNG NHẬP */}
                    <label className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all ${
                      !isLoggedIn 
                        ? 'border-gray-50 bg-gray-50/50 opacity-50 cursor-not-allowed' 
                        : formData.paymentMethod === 'cod' 
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-50' 
                        : 'border-gray-100 hover:border-gray-200 cursor-pointer'
                    }`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cod' && isLoggedIn ? 'border-blue-500' : 'border-gray-300'}`}>
                        {formData.paymentMethod === 'cod' && isLoggedIn && <div className="w-3 h-3 bg-blue-500 rounded-full animate-in zoom-in"></div>}
                      </div>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        disabled={!isLoggedIn}
                        className="hidden" 
                        checked={formData.paymentMethod === 'cod' && isLoggedIn} 
                        onChange={handleInputChange} 
                      />
                      <div className="flex-1">
                        <p className="font-black text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter italic">Giao hàng và thu tiền tận nơi</p>
                      </div>
                      <Truck className={formData.paymentMethod === 'cod' && isLoggedIn ? 'text-blue-500' : 'text-gray-300'} />
                    </label>

                    {/* Chuyển khoản ngân hàng - Mặc định cho khách vãng lai */}
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

                    {/* Cảnh báo cho Khách vãng lai khi COD bị khóa */}
                    {!isLoggedIn && (
                      <div className="p-5 bg-orange-50 border border-orange-100 rounded-[1.5rem] flex gap-4 text-orange-700 shadow-inner">
                        <AlertCircle size={22} className="shrink-0 text-orange-500" />
                        <p className="text-xs font-bold leading-relaxed italic uppercase tracking-tighter">
                          Lưu ý: Đối với <strong className="text-orange-900">Khách vãng lai</strong>, chúng tôi chỉ áp dụng thanh toán qua chuyển khoản để đảm bảo tính xác thực đơn hàng. Hãy tích chọn tạo tài khoản để sử dụng hình thức COD.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Thông tin chuyển khoản */}
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
                              <span className="text-gray-400 font-bold uppercase tracking-tighter">Số tiền cần chuyển:</span>
                              <span className="font-black text-2xl text-red-600">{finalTotalPay.toLocaleString('vi-VN')}₫</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                             <div className="w-40 h-40 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 shadow-inner">
                               <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v6H3V3zm1 1v4h4V4H4zm1 1h2v2H5V5zM3 15h6v6H3v-6zm1 1v4h4v-4H4zm1 1h2v2H5v-2zM15 3h6v6h-6V3zm1 1v4h4V4h-4zm1 1h2v2h-2V5zM15 15h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 2v2h-2v-2zm2 0h2v2h-2v-2zM10 3h4v2h-4V3zm0 4h4v2h-4V7zm0 8h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/></svg>
                             </div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">QR chuyển khoản nhanh</span>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* KHU VỰC 3: GHI CHÚ ĐƠN HÀNG (Hiển thị ngay cho hội viên hoặc ở bước 2 của khách) */}
              {(isLoggedIn || checkoutStep === 2) && (
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">Ghi chú giao hàng</h2>
                  </div>
                  <textarea 
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="VD: Giao giờ hành chính, vui lòng gọi trước khi giao..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-6 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-800 placeholder:text-gray-400 resize-none text-sm"
                  ></textarea>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & MÃ KHUYẾN MÃI (Side Bar cố định) */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-xl shadow-gray-200/40 space-y-6">
                  <h2 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-4">Tóm tắt đơn hàng</h2>
                  
                  {/* Danh sách sản phẩm mua */}
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.cartId} className="flex gap-4 group">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 border border-gray-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic leading-tight">
                            {item.selectedStorage} | SL: {item.quantity}
                          </p>
                          <p className="text-xs font-black text-blue-600 mt-1">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Component Chọn Mã Khuyến Mãi kiểu TGDĐ */}
                  <div className="border-t border-gray-50 pt-5">
                    <PromotionSelector 
                      subTotal={cartTotal} 
                      onApplyPromotion={(code, discount) => {
                        setAppliedPromo(code);
                        setDiscountAmount(discount);
                      }} 
                    />
                  </div>

                  {/* TÍCH HỢP ĐIỂM THƯỞNG VIP - Chỉ hiện khi ĐÃ ĐĂNG NHẬP */}
                  {isLoggedIn && (
                    <div className="border-t border-gray-50 pt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                          <Gift size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-800">Dùng điểm tích lũy VIP</p>
                          <p className="text-[9px] text-gray-400 font-bold">Số dư: 50.000 điểm (= 50.000đ)</p>
                        </div>
                      </div>
                      
                      {/* iOS-style Toggle Switch */}
                      <button 
                        type="button"
                        onClick={() => setUsePoints(!usePoints)}
                        className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 focus:outline-none shrink-0 ${
                          usePoints ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all duration-300 ${
                          usePoints ? 'translate-x-5' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  )}

                  {/* Phần Tính toán chi tiết hóa đơn */}
                  <div className="border-t border-gray-50 pt-5 space-y-3.5">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
                      <span>Tạm tính ({cartItems.length} SP)</span>
                      <span className="text-gray-900 font-black">{cartTotal.toLocaleString('vi-VN')}₫</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-xs font-bold text-green-600 uppercase tracking-tighter animate-in fade-in">
                        <span>Voucher ({appliedPromo})</span>
                        <span className="font-black">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}

                    {usePoints && (
                      <div className="flex justify-between items-center text-xs font-bold text-green-600 uppercase tracking-tighter animate-in fade-in">
                        <span>Điểm VIP tích lũy</span>
                        <span className="font-black">-{pointsDiscount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
                      <span>Phí vận chuyển</span>
                      <span className="text-green-600 font-black">Miễn phí</span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-100">
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Tổng cộng</span>
                      <span className="text-xl font-black text-red-600">{finalTotalPay.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>

                  {/* Nút đặt hàng: Chỉ hiển thị/hoạt động khi hội viên đang xem hoặc khách hàng đã ở bước 2 */}
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full text-white font-black py-4.5 rounded-2xl text-md uppercase shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 group ${
                      isSubmitting 
                        ? 'bg-blue-400 cursor-not-allowed opacity-70' 
                        : !isLoggedIn && checkoutStep === 1 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                    }`}
                  >
                    {isSubmitting 
                      ? 'ĐANG XỬ LÝ...' 
                      : !isLoggedIn && checkoutStep === 1 
                      ? 'TIẾP TỤC THANH TOÁN' 
                      : 'XÁC NHẬN ĐẶT HÀNG'}
                    {!isSubmitting && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>

                <div className="bg-blue-600 rounded-[2rem] p-6 flex gap-4 items-center text-white shadow-lg shadow-blue-100">
                   <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Truck size={24} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-md font-black uppercase tracking-tight">Giao hàng miễn phí</p>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter mt-0.5">Nhận hàng thần tốc toàn quốc</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP verification modal overlay */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-md my-8">
            <OtpVerification
              email={formData.email}
              mockOtp={checkoutOtp}
              onVerify={handleVerifyOrderOtp}
              onCancel={() => {
                setShowOtpModal(false);
                setIsSubmitting(false);
              }}
              onResend={() => {
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                setCheckoutOtp(code);
                setOtpError('');
              }}
              isSubmitting={isSubmitting}
              error={otpError}
              title="Xác thực đơn hàng"
              description="Để hoàn tất chốt đơn hàng, vui lòng nhập mã xác thực OTP gửi đến email nhận hàng của bạn."
            />
          </div>
        </div>
      )}
    </div>
  );
}
