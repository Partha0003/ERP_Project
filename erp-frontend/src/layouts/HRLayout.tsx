import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/types/common.types';

const hrNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/hr/dashboard', icon: 'speedometer2' },
  { label: 'Employees', path: '/hr/employees', icon: 'person-badge' },
  { label: 'Add Employee', path: '/hr/employees/create', icon: 'person-plus' },
  { label: 'Attendance', path: '/hr/attendance', icon: 'calendar-check' },
  { label: 'Leave Approval', path: '/hr/leaves', icon: 'calendar-x' },
  { label: 'Payroll', path: '/hr/payroll', icon: 'cash-stack' },
  { label: 'Performance', path: '/hr/performance', icon: 'graph-up' },
];

export function HRLayout() {
  return <DashboardLayout navItems={hrNavItems} brand="HR Portal" />;
}
