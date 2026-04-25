// src/page/HomePage.jsx
import { useState } from 'react';
import ProductCard from '../components/product/ProductCard';
import productsData from '../utils/products.json';
import Breadcrumb from '../components/Breadcrumb';
import FilterBar from '../components/FilterBar';

export default function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState(null);

  const handleApplyFilter = (filters) => {
    setAdvancedFilters(filters);
    setSelectedBrand(null); // Clear quick brand filter when advanced filter is applied
  };

  const filteredProducts = productsData.filter(product => {
    // Quick brand filter
    if (selectedBrand && !product.name.toLowerCase().includes(selectedBrand.toLowerCase())) {
      return false;
    }

    // Advanced filters from modal
    if (advancedFilters) {
      // Filter by Brands (Multiple)
      if (advancedFilters['Hãng'] && advancedFilters['Hãng'].length > 0) {
        const matchesBrand = advancedFilters['Hãng'].some(brand => 
          product.name.toLowerCase().includes(brand.toLowerCase())
        );
        if (!matchesBrand) return false;
      }

      // Filter by Price Range
      const [min, max] = advancedFilters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }

      // Filter by RAM (if available in specs)
      if (advancedFilters['RAM'] && advancedFilters['RAM'].length > 0) {
        const matchesRam = advancedFilters['RAM'].some(ram => 
          product.specs.some(spec => spec.includes(ram))
        );
        if (!matchesRam) return false;
      }
    }

    return true;
  });

  return (
    <>
      <Breadcrumb items={[{ label: selectedBrand || advancedFilters ? 'Kết quả tìm kiếm' : 'Tất cả sản phẩm điện thoại' }]} />
      <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-bordercustom">
        {selectedBrand || advancedFilters ? 'Kết quả lọc sản phẩm' : 'Chào mừng đến với hệ thống PhoneShop!'}
      </h2>
      {!selectedBrand && !advancedFilters && (
        <div className="bg-blue-50 text-secondary p-4 rounded mb-6 border border-blue-200">
          Khám phá các sản phẩm điện thoại, phụ kiện và nhiều ưu đãi Mùa hè hấp dẫn.
        </div>
      )}
      
      <FilterBar 
        selectedBrand={selectedBrand} 
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          setAdvancedFilters(null); 
        }} 
        onApplyFilter={handleApplyFilter}
        onClearAll={(selectedBrand || advancedFilters) ? () => {
          setSelectedBrand(null);
          setAdvancedFilters(null);
        } : null}
      />

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {filteredProducts.map((product) => (
            <ProductCard 
               key={product.id}
               id={product.id}
               name={product.name}
               price={product.price}
               originalPrice={product.originalPrice}
               discount={product.discount}
               specs={product.specs}
               image={product.image}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
           <p className="text-lg">Không tìm thấy sản phẩm phù hợp.</p>
           <button 
             onClick={() => setSelectedBrand(null)}
             className="mt-4 text-primary hover:underline"
           >
             Xem tất cả sản phẩm
           </button>
        </div>
      )}
    </>
  );
}
