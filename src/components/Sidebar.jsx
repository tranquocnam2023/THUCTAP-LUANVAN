// Sidebar.jsx
const THEME = {
  primary: '#288ad6', 
  sidebarBg: '#ffffff', 
  border: '#e5e7eb', 
  textDark: '#333333', 
};

export default function Sidebar() {
  const categories = [
    { name: 'Chương trình khuyến mãi', isHot: true },
    { name: 'Phụ kiện điện thoại', isHot: false },
    { name: 'Máy cũ - giá rẻ', isHot: false },
    { name: 'Thông tin - dịch vụ tiện ích', isHot: false },
  ];

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
          <a
            key={idx}
            href="#"
            className="group flex flex-col justify-center px-4 py-3 hover:bg-gray-50 transition border-b"
            style={{ borderColor: THEME.border }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div 
              className={`font-medium flex items-center transition`}
              style={{ color: THEME.textDark }}
              onMouseOver={(e) => { e.currentTarget.style.color = THEME.primary; }}
              onMouseOut={(e) => { e.currentTarget.style.color = THEME.textDark; }}
            >
              {cat.name}
            </div>
          </a>
        ))}
      </nav>
    </aside>
  );
}
