// Footer.jsx
export default function Footer() {
  return (
    <footer className="w-full mt-auto text-sm border-t border-bordercustom pt-6 bg-footerbg">
      <div className="container-box grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 px-4 text-text">
        {/* Col 1 */}
        <div className="flex flex-col space-y-3">
          <h3 className="font-bold text-gray-800 uppercase mb-2">Tổng đài hỗ trợ (Miễn phí gọi)</h3>
          <p>Gọi mua: <span className="font-bold text-primary text-base">1800.1060</span> (7:30 - 22:00)</p>
          <p>Kỹ thuật: <span className="font-bold text-primary text-base">1800.1763</span> (7:30 - 22:00)</p>
          <p>Khiếu nại: <span className="font-bold text-primary text-base">1800.1062</span> (8:00 - 21:30)</p>
          <p>Bảo hành: <span className="font-bold text-primary text-base">1800.1064</span> (8:00 - 21:00)</p>
        </div>
        
        {/* Col 2 */}
        <div className="flex flex-col space-y-3">
          <h3 className="font-bold text-gray-800 uppercase mb-2">Thông tin công ty</h3>
          <a href="#" className="hover:text-primary transition">Giới thiệu công ty (MWG)</a>
          <a href="#" className="hover:text-primary transition">Tuyển dụng</a>
          <a href="#" className="hover:text-primary transition">Gửi góp ý, khiếu nại</a>
          <a href="#" className="hover:text-primary transition">Tìm siêu thị (3.300+ shop)</a>
          <a href="#" className="hover:text-primary transition">Xem bản mobile</a>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col space-y-3">
          <h3 className="font-bold text-gray-800 uppercase mb-2">Chính sách chung</h3>
          <a href="#" className="hover:text-primary transition">Chính sách bảo hành</a>
          <a href="#" className="hover:text-primary transition">Chính sách đổi trả</a>
          <a href="#" className="hover:text-primary transition">Chính sách trả góp</a>
          <a href="#" className="hover:text-primary transition">Giao hàng & Thanh toán</a>
          <a href="#" className="hover:text-primary transition">Hướng dẫn mua online</a>
        </div>

        {/* Col 4 */}
        <div className="flex flex-col space-y-3">
          <h3 className="font-bold text-gray-800 uppercase mb-2">Website cùng tập đoàn</h3>
          <div className="flex flex-col space-y-2 text-xs font-bold font-sans">
             <a href="#" className="flex p-2 bg-primary rounded w-fit text-white">Điện Máy Xanh</a>
             <a href="#" className="flex p-2 bg-green-600 rounded w-fit text-white">Bách Hóa Xanh</a>
             <a href="#" className="flex p-2 bg-purple-600 rounded w-fit text-white">Nhà Thuốc An Khang</a>
          </div>
          <div className="mt-4 flex space-x-2">
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">FB</a>
            <a href="#" className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">YT</a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white">TT</a>
          </div>
        </div>
      </div>
      
      {/* Copyright row */}
      <div className="mt-4 py-4 text-xs bg-gray-100 text-gray-600 border-t border-bordercustom text-center">
        <p>© 2026. Công ty điện thoại PhoneShop (Giao diện Lấy cảm hứng). Địa chỉ: LuanVan, TP.HCM.</p>
        <p className="mt-1 text-gray-400">Giao diện này được xây dựng lại dựa trên cấu trúc Thế giới di động với tone xanh dương.</p>
      </div>
    </footer>
  );
}
