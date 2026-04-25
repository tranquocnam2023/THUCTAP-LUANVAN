import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import FilterModal from './FilterModal';

export default function FilterBar({ selectedBrand, onSelectBrand, onApplyFilter, onClearAll }) {
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
            onClick={() => onSelectBrand(selectedBrand === brand ? null : brand)}
            className={`px-3 py-1.5 border rounded-[4px] text-[13px] transition-all duration-200 ${
              selectedBrand === brand 
              ? 'border-primary text-primary bg-blue-50 font-bold shadow-inner' 
              : 'border-gray-200 text-gray-700 bg-white hover:border-primary hover:bg-gray-50'
            }`}
          >
            {brand}
          </button>
        ))}

        {selectedBrand && (
          <button 
            onClick={() => onSelectBrand(null)}
            className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-red-500 hover:text-red-700 transition-colors font-medium border border-red-100 rounded bg-red-50/30"
          >
            <X size={14} /> Xóa hãng: {selectedBrand}
          </button>
        )}

        {onClearAll && (
          <button 
            onClick={onClearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-500 hover:text-red-600 transition-colors font-medium border border-gray-200 rounded hover:border-red-200 hover:bg-red-50"
          >
            <X size={14} /> Xóa tất cả lọc
          </button>
        )}
      </div>

      {isModalOpen && (
        <FilterModal 
          onClose={() => setIsModalOpen(false)} 
          onApply={(filters) => {
             onApplyFilter(filters);
             setIsModalOpen(false);
          }} 
        />
      )}
    </>
  );
}
