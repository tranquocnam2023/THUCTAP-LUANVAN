// Header.jsx
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full text-white bg-headerbg">
      {/* Top Bar */}
      <div className="container-box flex items-center justify-between py-3 h-16 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link to="/">
            <h1 className="text-2xl font-bold italic tracking-wider">PhoneShop</h1>
          </Link>
        </div>

        {/* Cụm chức năng (Location, Search, etc) theo style mượt mà */}
        <div className="flex items-center bg-secondary px-3 py-1.5 rounded cursor-pointer ml-4 shrink-0 hover:bg-opacity-80 transition text-sm">
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
              {/* Search Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Icons: Orders, Cart, Account */}
        <div className="flex items-center space-x-3 text-xs shrink-0">
            <Link to="/auth" className="flex items-center px-3 py-2 rounded hover:bg-secondary transition text-center hover:text-white">
              Đăng nhập<br/>Tài khoản
            </Link>
            <Link to="/cart" className="flex items-center px-3 py-2 border border-white border-opacity-30 rounded hover:bg-white hover:text-primary transition space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="font-semibold text-sm">Giỏ hàng</span>
            </Link>
        </div>
      </div>
      
      {/* Main Navigation Row */}
      <div className="w-full bg-secondary">
        <div className="container-box flex items-center justify-center h-12 overflow-x-auto text-sm">
          {[
            { name: 'IPhone', icon: '' },
            { name: 'Samsung', icon: '' },
            { name: 'Xiaomi', icon: '' },
            { name: 'OPPO', icon: '' },
            { name: 'Vivo', icon: '' },
            { name: 'Realme', icon: '' },
            { name: 'Nokia', icon: '' },
            { name: 'Phụ kiện', icon: '' },
            { name: 'Máy cũ giá rẻ', icon: '' },
            { name: 'Sim, Thẻ cào', icon: '' },
          ].map((item, idx) => (
            <a key={idx} href="#" className="flex-1 text-center hover:bg-white hover:text-primary h-full flex items-center justify-center px-2 transition font-medium whitespace-nowrap">
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
