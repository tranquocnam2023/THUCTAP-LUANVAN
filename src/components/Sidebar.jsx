import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SIDEBAR_ITEMS = [
  {
    name: 'Điện thoại',
    path: '/danh-muc/điện thoại'
  },
  {
    name: 'Tablet',
    path: '/danh-muc/tablet'
  },
  {
    name: 'Phụ kiện',
    path: '/danh-muc/phụ kiện'
  },
  {
    name: 'Đồng hồ',
    path: '/danh-muc/đồng hồ'
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside 
      className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200/80 shadow-sm p-1.5 space-y-1 h-fit"
    >
      <nav className="flex flex-col">
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = decodeURIComponent(location.pathname) === item.path;
          
          return (
            <Link
              key={idx}
              to={item.path}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 font-semibold text-sm ${
                isActive 
                  ? 'bg-[rgba(40,138,214,0.08)] text-[#288ad6]' 
                  : 'text-gray-700 hover:bg-[rgba(40,138,214,0.05)] hover:text-[#288ad6]'
              }`}
            >
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.name}</span>
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
