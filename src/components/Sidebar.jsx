import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categoryService } from '../services/categoryService';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    categoryService.getAll()
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error("Lỗi tải danh mục sidebar:", err));
  }, []);

  return (
    <aside 
      className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200/80 shadow-sm p-1.5 space-y-1 h-fit"
    >
      <nav className="flex flex-col">
        {categories.map((cat, idx) => {
          const path = `/danh-muc/${encodeURIComponent(cat.name.toLowerCase())}`;
          const isActive = decodeURIComponent(location.pathname).toLowerCase() === `/danh-muc/${cat.name.toLowerCase()}`;
          
          return (
            <Link
              key={idx}
              to={path}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 font-semibold text-sm ${
                isActive 
                  ? 'bg-[rgba(40,138,214,0.08)] text-[#288ad6]' 
                  : 'text-gray-700 hover:bg-[rgba(40,138,214,0.05)] hover:text-[#288ad6]'
              }`}
            >
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">{cat.name}</span>
              <ChevronRight 
                className={`w-4 h-4 transition-all duration-200 ${
                  isActive 
                    ? 'text-[#288ad6] translate-x-0.5' 
                    : 'text-gray-300 group-hover:text-[#288ad6] group-hover:translate-x-0.5'
                }`} 
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
