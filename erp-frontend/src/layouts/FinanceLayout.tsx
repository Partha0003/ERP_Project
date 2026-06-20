import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/types/common.types';

const financeNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/finance/dashboard', icon: 'speedometer2' },
  { label: 'Payroll Processing', path: '/finance/payroll', icon: 'credit-card' },
  { label: 'Payslips', path: '/finance/payslips', icon: 'file-earmark-text' },
];

export function FinanceLayout() {
  return <DashboardLayout navItems={financeNavItems} brand="Finance Portal" />;
}
