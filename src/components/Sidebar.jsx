import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/categoryService';

// Sidebar.jsx
const THEME = {
  primary: '#288ad6', 
  sidebarBg: '#ffffff', 
  border: '#e5e7eb', 
  textDark: '#333333', 
};

export default function Sidebar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll()
      .then(data => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(err => console.error("Lỗi Sidebar API:", err));
  }, []);

  return (
    <aside 
      className="w-64 flex-shrink-0 rounded shadow-sm border h-fit overflow-hidden"
      style={{ backgroundColor: THEME.sidebarBg, borderColor: THEME.border }}
    >
      <div 
        className="p-3 border-b font-bold text-lg flex items-center space-x-2"
        style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: THEME.border, color: THEME.textDark }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" style={{ color: THEME.primary }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
        <span>Danh Mục</span>
      </div>
      <nav className="flex flex-col py-1">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={`/danh-muc/${cat.name}`}
            className="group flex flex-col justify-center px-4 py-3 hover:bg-gray-50 transition border-b"
            style={{ borderColor: THEME.border }}
          >
            <div 
              className={`font-medium flex items-center transition group-hover:text-blue-500`}
              style={{ color: THEME.textDark }}
            >
              {cat.name}
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
