import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { authService } from '../services/authService';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login({
        username: username,
        password: password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (data.role === 'Admin' || data.role === 'Staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Breadcrumb items={[{ label: isLogin ? 'Đăng nhập' : 'Đăng ký' }]} />
      <div className="flex justify-center items-start pt-6 w-full">
      <div className="bg-white border border-bordercustom p-8 rounded-lg shadow-sm w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form className="flex flex-col space-y-4" onSubmit={isLogin ? handleLogin : undefined}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input type="text" placeholder="Nhập họ và tên" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại hoặc Email</label>
            <input 
              type="text" 
              placeholder="Nhập SĐT hoặc Email" 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu" 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-primary text-white font-bold py-2 rounded mt-4 hover:bg-secondary transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'ĐANG XỬ LÝ...' : (isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ')}
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
