import { useParams, Link } from 'react-router-dom';
import productsData from '../utils/products.json';
import Breadcrumb from '../components/Breadcrumb';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = productsData.find((p) => p.id === parseInt(id));
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'info'
  const [selectedStorage, setSelectedStorage] = useState('12GB - 256GB');
  const [selectedColor, setSelectedColor] = useState('Đen');

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm không tồn tại</h2>
        <Link to="/" className="text-primary hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Điện thoại', link: '/' },
    { label: product.name }
  ];

  // Mock data for variants
  const storageVariants = ['12GB - 256GB', '8GB - 128GB', '8GB - 256GB'];
  const colorVariants = [
    { name: 'Đen', hex: '#4b4b4b' },
    { name: 'Xám', hex: '#c0c0c0' },
    { name: 'Xanh lá', hex: '#9db4a1' }
  ];

  // Mock data for promotions
  const promotions = [
    "Thu cũ Đổi mới: Trợ giá 50% - Tối đa 5.000.000₫",
    "NHẬN HOÀN NGAY ĐẾN 800.000₫ khi mở thẻ tín dụng VPBANK MWG",
    "Mỗi số điện thoại chỉ mua 1 sản phẩm",
    "Giao hàng nhanh chóng (tuỳ khu vực)"
  ];

  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Product Title */}
      <div className="border-b border-gray-200 pb-4 mb-6 mt-4">
        <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
      </div>


      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Image and Tabs */}
        <div className="lg:w-[65%]">
          {/* Tabs Navigation (Thế Giới Di Động style) */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 shadow-sm">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-6 sm:px-12 py-2.5 rounded-md text-sm font-bold transition-all duration-300 ${
                  activeTab === 'specs' 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-black ring-opacity-5' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Thông số kỹ thuật
              </button>
              <button 
                onClick={() => setActiveTab('info')}
                className={`px-6 sm:px-12 py-2.5 rounded-md text-sm font-bold transition-all duration-300 ${
                  activeTab === 'info' 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-black ring-opacity-5' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Thông tin sản phẩm
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-8 shadow-sm min-h-[500px]">
            {activeTab === 'specs' ? (
              <div className="animate-fade-in">
                {/* Product Image */}
                <div className="relative w-full aspect-video bg-white flex items-center justify-center mb-10 group">
                   <img src={product.image} alt={product.name} className="max-h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                </div>

                {/* Variants Selection Row (Moved here) */}
                <div className="mb-10 space-y-6">
                  {/* Storage Variants */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Chọn cấu hình:</h4>
                    <div className="flex flex-wrap gap-3">
                      {storageVariants.map((storage) => (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                            selectedStorage === storage
                            ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Variants */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Chọn màu sắc:</h4>
                    <div className="flex flex-wrap gap-3">
                      {colorVariants.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                            selectedColor === color.name
                            ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full shadow-inner border border-black/10" 
                            style={{ backgroundColor: color.hex }}
                          ></span>
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technical Specs Table */}
                <div className="mt-8">
                   <div className="bg-gray-100 px-5 py-3 rounded-t-xl font-bold text-gray-700 flex justify-between items-center">
                      <span className="flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                         </svg>
                         Cấu hình & Bộ nhớ
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                         <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                   </div>
                   <div className="border-x border-b border-gray-100 rounded-b-xl overflow-hidden">
                      <table className="w-full text-sm">
                         <tbody>
                            {[
                               { label: 'Màn hình', value: `${product.specs[0]} (${product.specs[1]})` },
                               { label: 'Hệ điều hành', value: 'Android 15' },
                               { label: 'Chip xử lý (CPU)', value: 'Exynos 1580 8 nhân' },
                               { label: 'RAM', value: product.specs[2] },
                               { label: 'Dung lượng lưu trữ', value: product.specs[3] },
                               { label: 'SIM', value: '2 Nano SIM (SIM 2 chung khe thẻ nhớ)' },
                               { label: 'Pin, Sạc', value: '5000 mAh, 25 W' }
                            ].map((row, idx) => (
                               <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="w-1/3 p-4 text-gray-500 font-medium">{row.label}:</td>
                                  <td className="p-4 text-gray-800 font-semibold">{row.value}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
                
                <button className="w-full mt-6 py-3 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm">
                   Xem thêm cấu hình chi tiết
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                   <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                   Thông tin sản phẩm {product.name}
                </h3>
                <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                   <p className="text-lg leading-relaxed">
                      {product.name} đại diện cho sự kết hợp hoàn hảo giữa thiết kế hiện đại và công nghệ tiên phong. 
                      Với mỗi chi tiết được chăm chút tỉ mỉ, đây không chỉ là một thiết bị liên lạc mà còn là món phụ kiện thời thượng.
                   </p>
                   
                   <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                      <h4 className="text-xl font-bold text-blue-800 mb-3">Hiệu năng vượt trội</h4>
                      <p>
                         Trang bị vi xử lý thế hệ mới nhất, {product.name} xử lý mượt mà mọi tác vụ từ làm việc đến giải trí đỉnh cao. 
                         Khả năng đa nhiệm ấn tượng giúp bạn tối ưu hóa thời gian và hiệu quả công việc.
                      </p>
                   </div>

                   <img src={product.image} alt="Feature highlight" className="w-full h-auto rounded-2xl shadow-lg border border-gray-100" />
                   
                   <p>
                      Màn hình với độ phân giải cực cao mang lại màu sắc sống động, độ tương phản tuyệt vời, 
                      giúp những thước phim và trò chơi trở nên chân thực hơn bao giờ hết.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Buying Box (Thế Giới Di Động style) */}
        <div className="lg:w-[35%]">
           <div className="sticky top-4 space-y-6">
              {/* Main Buying Box */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-100 relative overflow-hidden">
                 {/* Blue accent top */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

                 <div className="flex flex-col mb-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                       <span className="text-2xl sm:text-3xl font-black text-red-600 whitespace-nowrap">
                          {product.price.toLocaleString('vi-VN')}₫
                       </span>
                       {product.originalPrice && (
                          <span className="text-sm sm:text-base text-gray-400 line-through font-medium whitespace-nowrap">
                             {product.originalPrice.toLocaleString('vi-VN')}₫
                          </span>
                       )}
                    </div>
                    {product.discount && (
                       <span className="inline-block bg-red-100 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full w-fit">
                          GIẢM {product.discount}%
                       </span>
                    )}
                 </div>

                 {/* Promotion Section */}
                 <div className="border border-orange-200 rounded-xl overflow-hidden mb-6">
                    <div className="bg-orange-50 px-4 py-2.5 font-bold text-sm text-orange-700 border-b border-orange-200 flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                          <path fillRule="evenodd" d="M12.964 2.815a.75.75 0 0 1 .494.314l3.426 5.138a.75.75 0 0 1-.161.944l-4.999 4.074a.75.75 0 0 1-.947 0l-4.999-4.074a.75.75 0 0 1-.161-.944l3.426-5.138a.75.75 0 0 1 .494-.314l1.2-.12a.75.75 0 0 1 .184 0l1.2.12Zm-3.411 9.421 2.22 1.81a.75.75 0 0 0 .954 0l2.22-1.81 2.304 3.456a.75.75 0 0 1-.16.944l-4.75 3.87a.75.75 0 0 1-.954 0l-4.75-3.87a.75.75 0 0 1-.16-.944l2.304-3.456Z" clipRule="evenodd" />
                       </svg>
                       Khuyến mãi đặc biệt
                    </div>
                    <div className="p-4 bg-white space-y-3">
                       {promotions.map((promo, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                             <div className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600 mt-0.5">
                                {i + 1}
                             </div>
                             <span>{promo}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* CTAs */}
                 <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4 rounded-xl text-xl uppercase transition-all shadow-lg shadow-orange-100 transform active:scale-[0.98]">
                       Mua ngay
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase transition-all shadow-md shadow-blue-50">
                          Mua trả góp 0%
                          <span className="block text-[10px] font-normal lowercase mt-0.5 opacity-90">Qua thẻ hoặc công ty tài chính</span>
                       </button>
                       <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3.5 rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                          Thêm giỏ
                       </button>
                    </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    Gọi tư vấn: <span className="font-bold text-blue-600">1900 232 460</span>
                 </div>
              </div>

              {/* Related/History Box */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Sản phẩm đã xem</h4>
                    <button className="text-[10px] text-blue-600 font-bold hover:underline">XÓA LỊCH SỬ</button>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {productsData.slice(0, 3).map((p) => (
                       <Link key={p.id} to={`/product/${p.id}`} className="group block">
                          <div className="aspect-square bg-gray-50 border border-gray-100 rounded-xl p-2 mb-2 group-hover:border-blue-200 transition-colors">
                             <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="text-[10px] font-bold text-gray-700 line-clamp-1 mb-0.5">{p.name}</div>
                          <div className="text-[10px] font-black text-red-600">{p.price.toLocaleString('vi-VN')}₫</div>
                       </Link>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
