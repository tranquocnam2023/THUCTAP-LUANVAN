// src/page/CartPage.jsx
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

export default function CartPage() {
  // Data giỏ hàng trống mặc định. Sau này anh/chị truyền State/Redux/API data vào đây nhé.
  const cartItems = []; 
  
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col w-full h-full">
      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      
      <div className="bg-white rounded p-4 md:p-6 w-full max-w-4xl mx-auto shadow-sm border border-bordercustom">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn ({cartItems.length} sản phẩm)</h2>
        
        {cartItems.length === 0 ? (
          // --- Giao diện Giỏ hàng Trống ---
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-32 h-32 text-gray-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p className="text-gray-500 mb-8 font-medium">Không có sản phẩm nào trong giỏ hàng của bạn.</p>
            <Link to="/" className="bg-white border text-lg border-primary text-primary px-8 py-2.5 rounded hover:bg-primary font-bold hover:text-white transition">
              VỀ TRANG CHỦ MUA SẮM
            </Link>
          </div>
        ) : (
          // --- Giao diện Giỏ hàng có sản phẩm (Để dành sẵn layout cho anh/chị map data sau này) ---
          <>
            {/* Khung tiêu đề Cột (Chỉ hiện trên desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-bordercustom pb-3 font-semibold text-gray-600 text-sm">
               <div className="col-span-6">Sản phẩm</div>
               <div className="col-span-3 text-center">Số lượng</div>
               <div className="col-span-3 text-right">Thành tiền</div>
            </div>

            {/* Danh sách Sản Phẩm (Cart Items) */}
            <div className="flex flex-col space-y-5 pt-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-gray-100 pb-5 last:border-0 hover:bg-gray-50 transition p-2 rounded">
                  
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex items-start space-x-4">
                    <div className="w-24 h-24 bg-white flex-shrink-0 p-1 border border-bordercustom rounded flex justify-center items-center">
                       <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <Link to="#" className="font-bold text-gray-800 hover:text-primary transition leading-snug">{item.name}</Link>
                      <span className="text-xs text-gray-500 mt-1">Cấu hình: {item.specs ? item.specs.join(' | ') : ''}</span>
                      <button className="text-red-500 hover:text-white hover:bg-red-500 border border-transparent hover:border-red-500 text-xs font-semibold text-left mt-3 flex items-center justify-center p-1 px-2 rounded w-fit space-x-1 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="col-span-1 md:col-span-3 flex md:justify-center items-center">
                     <div className="flex border border-bordercustom rounded overflow-hidden w-24">
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition">-</button>
                        <input type="text" value={item.quantity} readOnly className="w-8 h-8 text-center text-sm font-semibold outline-none border-x border-bordercustom bg-white" />
                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition">+</button>
                     </div>
                  </div>

                  {/* Price Calculation (Quantity x Price) */}
                  <div className="col-span-1 md:col-span-3 flex md:justify-end items-center">
                     <div className="flex flex-col text-left md:text-right">
                        <span className="font-bold text-primary sm:text-lg">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                        {item.originalPrice && (
                           <span className="text-xs text-gray-400 line-through">{(item.originalPrice * item.quantity).toLocaleString('vi-VN')}₫</span>
                        )}
                     </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Cụm thanh toán và tính tổng (Checkout Section) */}
            <div className="mt-8 pt-6 border-t border-bordercustom">
               <div className="flex justify-between items-center mb-4 text-gray-800">
                 <span className="font-medium">Tạm tính ({cartItems.length} sản phẩm):</span>
                 <span className="font-bold text-xl text-primary">{total.toLocaleString('vi-VN')}₫</span>
               </div>
               
               <div className="bg-blue-50 border border-blue-200 p-3 flex rounded text-sm text-blue-800 mb-6 font-medium items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                 <div>
                   Tin vui! Đơn hàng của bạn đã đủ điều kiện được siêu <strong className="font-bold">Freeship toàn quốc!</strong>
                 </div>
               </div>

               <button className="w-full bg-[#fbd535] text-gray-900 border border-[#f3ca22] font-bold py-3.5 rounded-lg text-lg hover:bg-[#f3ca22] transition shadow-sm uppercase group">
                 Tiến hành đặt hàng
                 <span className="block text-xs font-normal mt-0.5 opacity-80 normal-case">Thanh toán tiện lợi, giao hàng nhanh chóng</span>
               </button>
               
               <div className="text-center mt-5">
                 <Link to="/" className="text-primary hover:underline text-sm font-semibold inline-flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                   Tiếp tục chọn thêm sản phẩm khác
                 </Link>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
