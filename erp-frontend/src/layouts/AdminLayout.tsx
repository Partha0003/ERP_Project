import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/types/common.types';

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'speedometer2' },
  { label: 'User Management', path: '/admin/users', icon: 'people' },
  { label: 'Create User', path: '/admin/users/create', icon: 'person-plus' },
  { label: 'Departments', path: '/admin/departments', icon: 'diagram-3' },
];

export function AdminLayout() {
  return <DashboardLayout navItems={adminNavItems} brand="Admin Portal" />;
}
