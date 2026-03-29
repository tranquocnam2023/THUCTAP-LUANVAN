import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', background: 'var(--color-bg)' }}>
          {/* Nội dung chính */}
          <h2 style={{ color: 'var(--color-primary)', marginBottom: 24 }}>Chào mừng đến với PhoneShop!</h2>
          <p style={{ color: 'var(--color-text)' }}>Khám phá các sản phẩm điện thoại, phụ kiện và nhiều ưu đãi hấp dẫn.</p>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
