import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import type { NavItem } from '@/types/common.types';

interface DashboardLayoutProps {
  navItems: NavItem[];
  brand: string;
}

export function DashboardLayout({ navItems, brand }: DashboardLayoutProps) {
  return (
    <div className="d-flex min-vh-100">
      <Sidebar items={navItems} brand={brand} />
      <div className="flex-grow-1 d-flex flex-column bg-light">
        <Navbar />
        <main className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
