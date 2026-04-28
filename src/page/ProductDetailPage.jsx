import { useParams, Link, useNavigate } from 'react-router-dom';
import productsData from '../utils/products.json';
import Breadcrumb from '../components/Breadcrumb';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const THEME = {
  primary: '#288ad6',
  accent: '#ff9500',
  secondary: '#0d5cb6',
  background: '#f8f9fa',
  border: '#e9ecef',
  textDark: '#212529',
  textGray: '#6c757d'
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = productsData.find((p) => p.id === parseInt(id));
  const [activeTab, setActiveTab] = useState('specs'); 
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('Đen bóng');

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        selectedStorage,
        selectedColor
      });
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({
        ...product,
        selectedStorage,
        selectedColor
      });
      navigate('/cart');
    }
  };

  useEffect(() => {
    if (product && product.specs) {
      setSelectedStorage(product.specs[3] || 'Standard');
    }
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sản phẩm không tồn tại</h2>
        <p className="text-gray-500 mb-6 text-center max-w-xs">Có vẻ như sản phẩm này đã ngừng kinh doanh hoặc đường dẫn không chính xác.</p>
        <Link 
          to="/" 
          className="px-8 py-3 rounded-full font-bold transition-all transform active:scale-95 shadow-lg"
          style={{ backgroundColor: THEME.primary, color: '#fff' }}
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Điện thoại', link: '/' },
    { label: product.brand, link: `/danh-muc/${product.brand.toLowerCase()}` },
    { label: product.name }
  ];

  // Variants
  const storageVariants = ['128GB', '256GB', '512GB', '1TB'];
  const colorVariants = [
    { name: 'Đen bóng', hex: '#1a1a1a' },
    { name: 'Titan Tự nhiên', hex: '#bebebe' },
    { name: 'Xanh dương', hex: '#4682b4' },
    { name: 'Trắng Pearl', hex: '#f8f9fa' }
  ];

  const promotions = [
    "Thu cũ Đổi mới: Trợ giá lên đến 2.000.000₫",
    "Giảm thêm 500.000₫ khi thanh toán qua VNPay-QR",
    "Tặng gói bảo hành rơi vỡ 12 tháng (Trị giá 1.500.000₫)",
    "Ưu đãi mua kèm Phụ kiện Apple giảm đến 30%"
  ];

  return (
    <div className="flex flex-col w-full pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 mb-8 mt-4 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-blue-600 font-bold">142 đánh giá</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-blue-600 font-bold">52 hỏi đáp</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
             </button>
             <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                So sánh
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visuals & Content */}
          <div className="lg:col-span-7 space-y-10">
            {/* Gallery Section */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center">
               <div className="relative w-full aspect-square max-w-[450px] mb-8">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
                  {product.discount && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xl px-4 py-2 rounded-2xl shadow-xl transform rotate-3">
                       -{product.discount}%
                    </div>
                  )}
               </div>
               <div className="flex gap-4 overflow-x-auto w-full pb-4 scroll-smooth">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-gray-100 p-2 cursor-pointer hover:border-blue-500 transition-all">
                       <img src={product.image} className="w-full h-full object-contain" />
                    </div>
                  ))}
               </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setActiveTab('specs')}
                  className={`flex-1 py-4 font-bold text-sm transition-all relative ${
                    activeTab === 'specs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ĐẶC ĐIỂM NỔI BẬT
                  {activeTab === 'specs' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-4 font-bold text-sm transition-all relative ${
                    activeTab === 'info' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  THÔNG SỐ KỸ THUẬT
                  {activeTab === 'info' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
              </div>

              <div className="p-8">
                {activeTab === 'specs' ? (
                  <div className="prose prose-blue max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-black text-gray-800 mb-6">Trải nghiệm đẳng cấp cùng {product.name}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Sản phẩm mang đến sự đột phá về mặt hiệu năng với con chip thế hệ mới nhất, 
                      kết hợp cùng hệ thống camera chuyên nghiệp giúp bạn bắt trọn mọi khoảnh khắc. 
                      Thiết kế titan siêu bền và nhẹ tạo nên vẻ ngoài sang trọng bậc nhất.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                       <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h4 className="font-bold text-blue-700 mb-2">Màn hình sống động</h4>
                          <p className="text-sm text-gray-600">Công nghệ LTPO giúp tiết kiệm pin tối đa trong khi vẫn đảm bảo tần số quét 120Hz mượt mà.</p>
                       </div>
                       <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h4 className="font-bold text-blue-700 mb-2">Pin ấn tượng</h4>
                          <p className="text-sm text-gray-600">Thời lượng sử dụng lên đến 30 giờ phát video liên tục, hỗ trợ sạc siêu nhanh.</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { label: 'Kích thước màn hình', value: product.specs[0] },
                          { label: 'Công nghệ màn hình', value: product.specs[1] },
                          { label: 'RAM', value: product.specs[2] },
                          { label: 'Bộ nhớ trong', value: product.specs[3] },
                          { label: 'Camera sau', value: '48MP + 12MP + 12MP' },
                          { label: 'Camera trước', value: '12MP' },
                          { label: 'Chipset', value: 'A18 Pro (Dự kiến)' },
                          { label: 'Dung lượng pin', value: '4422 mAh' }
                        ].map((row, idx) => (
                          <tr key={idx} className="group">
                            <td className="py-4 font-bold text-gray-500 w-1/3 group-hover:text-blue-600 transition-colors">{row.label}</td>
                            <td className="py-4 text-gray-800 font-semibold">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Buying Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-10 space-y-6">
               {/* Selection Card */}
               <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-100 space-y-8">
                  {/* Variants */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Dung lượng:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {storageVariants.map((storage) => (
                          <button
                            key={storage}
                            onClick={() => setSelectedStorage(storage)}
                            className={`py-3 rounded-2xl border-2 font-black transition-all ${
                              selectedStorage === storage || (product.specs[3] && product.specs[3].includes(storage))
                              ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
                              : 'border-gray-100 text-gray-500 hover:border-blue-200'
                            }`}
                          >
                            {storage}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Màu sắc:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {colorVariants.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold transition-all ${
                              selectedColor === color.name
                              ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
                              : 'border-gray-100 text-gray-500 hover:border-blue-200'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color.hex }}></div>
                            <span className="text-xs">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-3xl p-6 space-y-2 border border-gray-100">
                    <div className="flex items-baseline flex-wrap gap-3">
                      <span className="text-4xl font-black text-red-600">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          {product.originalPrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                       <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase whitespace-nowrap">TIẾT KIỆM {((product.originalPrice - product.price) || 0).toLocaleString('vi-VN')}₫</span>
                       <span className="text-xs text-green-600 font-bold italic">Có hàng tại 120 siêu thị</span>
                    </div>
                  </div>

                  {/* Promotions */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-500">
                        <path fillRule="evenodd" d="M12.964 2.815a.75.75 0 0 1 .494.314l3.426 5.138a.75.75 0 0 1-.161.944l-4.999 4.074a.75.75 0 0 1-.947 0l-4.999-4.074a.75.75 0 0 1-.161-.944l3.426-5.138a.75.75 0 0 1 .494-.314l1.2-.12a.75.75 0 0 1 .184 0l1.2.12Zm-3.411 9.421 2.22 1.81a.75.75 0 0 0 .954 0l2.22-1.81 2.304 3.456a.75.75 0 0 1-.16.944l-4.75 3.87a.75.75 0 0 1-.954 0l-4.75-3.87a.75.75 0 0 1-.16-.944l2.304-3.456Z" clipRule="evenodd" />
                      </svg>
                      KHUYẾN MÃI
                    </h4>
                    <div className="space-y-3">
                      {promotions.map((promo, idx) => (
                        <div key={idx} className="flex gap-3 items-start group">
                           <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600 mt-0.5 group-hover:bg-orange-500 group-hover:text-white transition-all">
                              {idx + 1}
                           </div>
                           <p className="text-xs text-gray-600 leading-relaxed font-medium">{promo}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-4 pt-4">
                    <button 
                      onClick={handleBuyNow}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-5 rounded-3xl text-2xl uppercase shadow-2xl shadow-red-100 transition-all transform active:scale-95 flex flex-col items-center"
                    >
                      MUA NGAY
                      <span className="text-[11px] font-bold opacity-80 normal-case mt-1">(Giao tận nơi hoặc nhận tại siêu thị)</span>
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black py-4 rounded-3xl text-lg uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                      THÊM VÀO GIỎ HÀNG
                    </button>
                  </div>
               </div>

               {/* Store Info */}
               <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                     </div>
                     <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Hỗ trợ nhanh</p>
                        <p className="text-lg font-black text-gray-800">Tìm siêu thị gần bạn</p>
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
