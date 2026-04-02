// src/page/HomePage.jsx
import ProductCard from '../components/product/ProductCard';
import productsData from '../utils/products.json';
import Breadcrumb from '../components/Breadcrumb';

export default function HomePage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Tất cả sản phẩm điện thoại' }]} />
      <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-bordercustom">
        Chào mừng đến với hệ thống PhoneShop!
      </h2>
      <div className="bg-blue-50 text-secondary p-4 rounded mb-6 border border-blue-200">
        🚀 Khám phá các sản phẩm điện thoại, phụ kiện và nhiều ưu đãi Mùa hè hấp dẫn.
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productsData.map((product) => (
          <ProductCard 
             key={product.id}
             name={product.name}
             price={product.price}
             originalPrice={product.originalPrice}
             discount={product.discount}
             specs={product.specs}
             image={product.image}
          />
        ))}
      </div>
    </>
  );
}
