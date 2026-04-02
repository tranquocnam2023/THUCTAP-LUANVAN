// src/page/AuthPage.jsx
import { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col h-full w-full">
      <Breadcrumb items={[{ label: isLogin ? 'Đăng nhập' : 'Đăng ký' }]} />
      <div className="flex justify-center items-start pt-6 w-full">
      <div className="bg-white border border-bordercustom p-8 rounded-lg shadow-sm w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
        </h2>
        
        <form className="flex flex-col space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input type="text" placeholder="Nhập họ và tên" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại hoặc Email</label>
            <input type="text" placeholder="Nhập SĐT hoặc Email" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input type="password" placeholder="Nhập mật khẩu" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" />
          </div>

          <button type="button" className="w-full bg-primary text-white font-bold py-2 rounded mt-4 hover:bg-secondary transition">
            {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <p>Chưa có tài khoản? <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => setIsLogin(false)}>Đăng ký ngay</span></p>
          ) : (
            <p>Đã có tài khoản? <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => setIsLogin(true)}>Đăng nhập</span></p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
