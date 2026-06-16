import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import FilterModal from './FilterModal';
import { brandService } from '../services/brandService';

const THEME = {
  primary: '#288ad6', 
  border: '#e5e7eb', 
};

export default function FilterBar({ selectedBrand, onSelectBrand, onApplyFilter, onClearAll }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickBrands, setQuickBrands] = useState([]);

  useEffect(() => {
    brandService.getAll()
      .then(data => {
        if (Array.isArray(data)) {
          setQuickBrands(data.map(b => b.name));
        }
      })
      .catch(err => console.error("Lỗi tải thương hiệu cho FilterBar:", err));
  }, []);

  return (
    <>
      <div 
        className="flex flex-wrap items-center gap-2 mb-4 p-2 rounded-lg shadow-sm border"
        style={{ backgroundColor: '#ffffff', borderColor: THEME.border }}
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 border rounded text-sm transition-colors font-medium"
          style={{ borderColor: '#d1d5db', color: '#374151', backgroundColor: '#ffffff' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.color = THEME.primary; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}
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
              ? 'font-bold shadow-inner' 
              : 'hover:bg-gray-50'
            }`}
            style={{ 
              borderColor: selectedBrand === brand ? THEME.primary : '#e5e7eb',
              color: selectedBrand === brand ? THEME.primary : '#374151',
              backgroundColor: selectedBrand === brand ? 'rgba(40, 138, 214, 0.05)' : '#ffffff'
            }}
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
