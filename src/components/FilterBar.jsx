import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import FilterModal from './FilterModal';

export default function FilterBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const quickBrands = ['SAMSUNG', 'iPhone', 'OPPO', 'XIAOMI', 'vivo', 'realme', 'HONOR', 'NOKIA', 'TECNO'];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-2 rounded-lg shadow-sm border border-bordercustom">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded text-sm hover:border-primary hover:text-primary transition-colors text-gray-700 font-medium bg-white"
        >
          <Filter size={16} /> <span className="hidden sm:inline">Lọc</span>
        </button>
        
        {/* Quick Brands */}
        {quickBrands.map(brand => (
          <button 
            key={brand} 
            className="px-3 py-1.5 border border-gray-200 rounded-[4px] text-[13px] hover:border-primary transition-colors text-gray-700 bg-white"
          >
            {brand}
          </button>
        ))}
      </div>

      {isModalOpen && <FilterModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
