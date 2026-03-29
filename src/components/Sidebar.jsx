// Sidebar.jsx
export default function Sidebar() {
  return (
    <aside
      style={{
        background: '#F5F5F5',
        borderRight: '1px solid var(--color-border)',
        padding: '2rem 1rem',
        minWidth: 220,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 16 }}>
            <a href="#" style={{ color: '#0097e6', textDecoration: 'none', fontWeight: 500 }}>
              Điện thoại
            </a>
          </li>
          <li style={{ marginBottom: 16 }}>
            <a href="#" style={{ color: '#0097e6', textDecoration: 'none', fontWeight: 500 }}>
              Phụ kiện
            </a>
          </li>
          <li style={{ marginBottom: 16 }}>
            <a href="#" style={{ color: '#0097e6', textDecoration: 'none', fontWeight: 500 }}>
              Khuyến mãi
            </a>
          </li>
          <li>
            <a href="#" style={{ color: '#0097e6', textDecoration: 'none', fontWeight: 500 }}>
              Liên hệ
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
