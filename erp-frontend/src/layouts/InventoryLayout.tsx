import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/types/common.types';

const inventoryNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/inventory/dashboard', icon: 'speedometer2' },
  { label: 'Products', path: '/inventory/products', icon: 'box-seam' },
  { label: 'Stock Management', path: '/inventory/stock', icon: 'boxes' },
  { label: 'Reports', path: '/inventory/reports', icon: 'bar-chart' },
];

export function InventoryLayout() {
  return <DashboardLayout navItems={inventoryNavItems} brand="Inventory Portal" />;
}
