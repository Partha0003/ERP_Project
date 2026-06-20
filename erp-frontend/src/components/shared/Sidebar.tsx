import { NavLink } from 'react-router-dom';
import type { NavItem } from '@/types/common.types';

interface SidebarProps {
  items: NavItem[];
  brand: string;
}

export function Sidebar({ items, brand }: SidebarProps) {
  return (
    <aside
      className="sidebar bg-dark text-white d-flex flex-column"
      style={{ width: 260, minHeight: '100vh', flexShrink: 0 }}
    >
      <div className="p-4 border-bottom border-secondary">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-building me-2" />
          {brand}
        </h5>
      </div>
      <nav className="flex-grow-1 p-3">
        <ul className="nav flex-column gap-1">
          {items.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link rounded px-3 py-2 d-flex align-items-center ${
                    isActive ? 'bg-primary text-white' : 'text-white-50'
                  }`
                }
              >
                <i className={`bi bi-${item.icon} me-2`} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
