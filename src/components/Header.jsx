import { Link, useNavigate } from 'react-router-dom';
import { BRANDS, OTHER_CATEGORIES } from '../utils/constants';
import { useCart } from '../context/CartContext';

const THEME = {
  primary: '#288ad6', 
  secondary: '#0d5cb6', 
  accent: '#fbd535', 
  textLight: '#ffffff', 
};

export default function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  
  // Lấy thông tin user từ localStorage an toàn hơn
  let user = null;
  try {
    const userJson = localStorage.getItem('user');
    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      user = JSON.parse(userJson);
    }
  } catch (err) {
    console.error("Lỗi parse user từ localStorage:", err);
    localStorage.removeItem('user'); // Xóa nếu hỏng
  }
  
  // Kiểm tra đăng nhập cực kỳ nghiêm ngặt
  const isLoggedIn = !!(user && (user.id || user.Id)); 
  const userRole = user?.role || user?.Role || '';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/'; // Reload để xóa state
  };

  return (
    <header className="w-full text-white" style={{ backgroundColor: THEME.primary, color: THEME.textLight }}>
      {/* Top Bar */}
      <div className="container-box flex items-center justify-between py-3 h-16 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link to="/">
            <h1 className="text-2xl font-bold italic tracking-wider">PhoneShop</h1>
          </Link>
        </div>

        {/* Cụm chức năng (Location, Search, etc) theo style mượt mà */}
        <div 
          className="flex items-center px-3 py-1.5 rounded cursor-pointer ml-4 shrink-0 hover:bg-opacity-80 transition text-sm"
          style={{ backgroundColor: THEME.secondary }}
        >
          <span className="truncate max-w-[120px]">
            Xem giá, tồn kho tại: <br/> 
            <span className="font-bold">Hồ Chí Minh ▾</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 min-w-[200px]">
          <div className="relative flex items-center w-full h-10 rounded bg-white overflow-hidden">
            <input 
              type="text" 
              placeholder="Bạn tìm gì..." 
              className="w-full h-full text-gray-800 px-3 outline-none"
            />
            <button className="h-full px-4 text-gray-600 bg-white hover:bg-gray-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Icons: Orders, Cart, Account */}
        <div className="flex items-center space-x-3 text-xs shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center px-3 py-1 rounded bg-white/10 gap-3">
                 <div className="flex flex-col items-end">
                    <span className="font-bold opacity-80">Chào, {user.username || user.name || 'User'}</span>
                    <button onClick={handleLogout} className="text-[10px] hover:underline text-yellow-300 font-bold uppercase">Đăng xuất</button>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    {(user.username || 'U')[0].toUpperCase()}
                 </div>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center px-3 py-2 rounded transition text-center hover:bg-white/20"
                style={{ color: THEME.textLight }}
              >
                Đăng nhập<br/>Tài khoản
              </Link>
            )}

            {/* KIỂM TRA QUYỀN: Phải ĐĂNG NHẬP và là NHÂN VIÊN/ADMIN mới thấy Thẻ Quản Trị */}
            {isLoggedIn && (userRole === 'Admin' || userRole === 'Staff') && (
              <Link 
                to="/admin" 
                className="flex items-center px-3 py-2 rounded border font-black transition text-center shadow-lg animate-pulse hover:animate-none"
                style={{ backgroundColor: THEME.accent, color: '#000', borderColor: THEME.accent }}
              >
                Trang<br/>Quản trị
              </Link>
            )}
 
            <Link 
              to="/cart" 
              className="flex items-center px-3 py-2 border rounded transition space-x-2 relative group"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = THEME.primary; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = THEME.textLight; }}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:scale-110">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-semibold text-sm">Giỏ hàng</span>
            </Link>
        </div>
      </div>
      
      {/* Main Navigation Row */}
      <div className="w-full" style={{ backgroundColor: THEME.secondary }}>
        <div className="container-box flex items-center justify-center h-12 overflow-x-auto text-sm">
          {BRANDS.map((brand, idx) => (
            <Link 
              key={idx} 
              to={`/danh-muc/${brand.toLowerCase()}`} 
              className="flex-1 text-center h-full flex items-center justify-center px-2 transition font-medium whitespace-nowrap"
              style={{ color: THEME.textLight }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = THEME.primary; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = THEME.textLight; }}
            >
              {brand}
            </Link>
          ))}
          {OTHER_CATEGORIES.map((cat, idx) => (
            <Link 
              key={idx + BRANDS.length} 
              to={`/danh-muc/${cat.toLowerCase().replace(/, /g, '-').replace(/ /g, '-')}`} 
              className="flex-1 text-center h-full flex items-center justify-center px-2 transition font-medium whitespace-nowrap"
              style={{ color: THEME.textLight }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = THEME.primary; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = THEME.textLight; }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
