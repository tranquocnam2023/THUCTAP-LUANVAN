import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './page/HomePage';
import AuthPage from './page/AuthPage';
import CartPage from './page/CartPage';

function App() {
  return (
    <div 
      className="w-full flex justify-center font-sans min-h-screen" 
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
       <div className="w-full h-full flex flex-col">
          {/* Header full width */}
          <Header />
          
          {/* Main Container - Giới hạn 1200px, chứa Sidebar và Routes */}
          <div className="container-box flex flex-1 w-full my-6 flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 px-4">
            
            {/* Sidebar danh mục (Giữ nguyên khi chuyển trang) */}
            <div className="hidden md:block">
               <Sidebar />
               
            </div>

            {/* Nội dung chính linh hoạt theo Route */}
            <main className="flex-1 bg-white p-6 rounded shadow-sm border border-bordercustom min-h-[50vh]">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/danh-muc/:brand" element={<HomePage />} />
              </Routes>
            </main>
          </div>

          {/* Footer full width */}
          <Footer />
       </div>
    </div>
  );
}

export default App;
