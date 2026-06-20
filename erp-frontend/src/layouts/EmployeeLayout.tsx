import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/types/common.types';

const employeeNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: 'speedometer2' },
  { label: 'My Attendance', path: '/employee/attendance', icon: 'calendar-check' },
  { label: 'Leave Requests', path: '/employee/leaves', icon: 'calendar-x' },
  { label: 'My Payslips', path: '/employee/payslips', icon: 'cash' },
  { label: 'My Performance', path: '/employee/performance', icon: 'star' },
  { label: 'Profile Setup', path: '/employee/profile', icon: 'gear' },
];

export function EmployeeLayout() {
  return <DashboardLayout navItems={employeeNavItems} brand="Employee Portal" />;
}
