// src/page/HomePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import productsData from '../utils/products.json';
import Breadcrumb from '../components/Breadcrumb';
import FilterBar from '../components/FilterBar';

const THEME = {
  primary: '#288ad6', 
  secondary: '#0d5cb6', 
  border: '#e5e7eb', 
};

export default function HomePage() {
  const { brand } = useParams();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState(null);

  useEffect(() => {
    if (brand) {
      // Normalize brand from URL (e.g., 'iphone' -> 'iPhone')
      setSelectedBrand(brand);
    } else {
      setSelectedBrand(null);
    }
  }, [brand]);

  const handleApplyFilter = (filters) => {
    setAdvancedFilters(filters);
    setSelectedBrand(null); // Clear quick brand filter when advanced filter is applied
  };

  const filteredProducts = productsData.filter(product => {
    // Quick brand filter
    if (selectedBrand) {
      const brandLower = selectedBrand.toLowerCase();
      
      // Check brand field first, then name, then category
      const matches = (product.brand && product.brand.toLowerCase() === brandLower) ||
                      product.name.toLowerCase().includes(brandLower) || 
                      (product.category && product.category.toLowerCase().includes(brandLower));
      
      if (!matches) return false;
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
      <h2 
        className="text-2xl font-bold mb-4 pb-2 border-b"
        style={{ color: THEME.primary, borderColor: THEME.border }}
      >
        {selectedBrand || advancedFilters ? 'Kết quả lọc sản phẩm' : 'Chào mừng đến với hệ thống PhoneShop!'}
      </h2>
      {!selectedBrand && !advancedFilters && (
        <div 
          className="p-4 rounded mb-6 border"
          style={{ backgroundColor: 'rgba(40, 138, 214, 0.05)', color: THEME.secondary, borderColor: 'rgba(40, 138, 214, 0.2)' }}
        >
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
             className="mt-4 hover:underline"
             style={{ color: THEME.primary }}
           >
             Xem tất cả sản phẩm
           </button>
        </div>
      )}
    </>
  );
}
