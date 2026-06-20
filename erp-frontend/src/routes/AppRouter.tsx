import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HRLayout } from '@/layouts/HRLayout';
import { FinanceLayout } from '@/layouts/FinanceLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';
import { InventoryLayout } from '@/layouts/InventoryLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { CreateUser } from '@/pages/admin/CreateUser';
import { EditUser } from '@/pages/admin/EditUser';
import { ResetPassword } from '@/pages/admin/ResetPassword';
import { DepartmentManagement } from '@/pages/admin/DepartmentManagement';
import { HRDashboard } from '@/pages/hr/HRDashboard';
import { EmployeeManagement } from '@/pages/hr/EmployeeManagement';
import { CreateEmployee } from '@/pages/hr/CreateEmployee';
import { EditEmployee } from '@/pages/hr/EditEmployee';
import { AttendanceManagement } from '@/pages/hr/AttendanceManagement';
import { LeaveApproval } from '@/pages/hr/LeaveApproval';
import { PayrollDashboard } from '@/pages/hr/PayrollDashboard';
import { PerformanceReviews } from '@/pages/hr/PerformanceReviews';
import { FinanceDashboard } from '@/pages/finance/FinanceDashboard';
import { PayrollProcessingPage } from '@/pages/finance/PayrollProcessingPage';
import { PayslipsPage } from '@/pages/finance/PayslipsPage';
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { MyAttendance } from '@/pages/employee/MyAttendance';
import { LeaveRequests } from '@/pages/employee/LeaveRequests';
import { MyPayslips } from '@/pages/employee/MyPayslips';
import { MyPerformance } from '@/pages/employee/MyPerformance';
import { EmployeeProfile } from '@/pages/employee/EmployeeProfile';
import { InventoryDashboard } from '@/pages/inventory/InventoryDashboard';
import { ProductManagement } from '@/pages/inventory/ProductManagement';
import { StockManagement } from '@/pages/inventory/StockManagement';
import { InventoryReports } from '@/pages/inventory/InventoryReports';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/hooks/useAuth';

function RootRedirect() {
  const { isAuthenticated, defaultRoute } = useAuth();
  return <Navigate to={isAuthenticated ? defaultRoute : '/login'} replace />;
}

function UnauthorizedPage() {
  const { logout, defaultRoute } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-6">403</h1>
        <p className="text-muted">You do not have permission to access this page.</p>
        <div className="d-flex gap-2 justify-content-center">
          <a href={defaultRoute} className="btn btn-primary">Go to My Dashboard</a>
          <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/create" element={<CreateUser />} />
              <Route path="users/:id/edit" element={<EditUser />} />
              <Route path="users/:id/reset-password" element={<ResetPassword />} />
              <Route path="departments" element={<DepartmentManagement />} />
            </Route>
          </Route>

          <Route element={<RoleRoute roles={['HR']} />}>
            <Route path="/hr" element={<HRLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HRDashboard />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="employees/create" element={<CreateEmployee />} />
              <Route path="employees/:id/edit" element={<EditEmployee />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="leaves" element={<LeaveApproval />} />
              <Route path="payroll" element={<PayrollDashboard />} />
              <Route path="performance" element={<PerformanceReviews />} />
            </Route>
          </Route>

          <Route element={<RoleRoute roles={['FINANCE']} />}>
            <Route path="/finance" element={<FinanceLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FinanceDashboard />} />
              <Route path="payroll" element={<PayrollProcessingPage />} />
              <Route path="payslips" element={<PayslipsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute roles={['INVENTORY']} />}>
            <Route path="/inventory" element={<InventoryLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InventoryDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="stock" element={<StockManagement />} />
              <Route path="reports" element={<InventoryReports />} />
            </Route>
          </Route>

          <Route element={<RoleRoute roles={['EMPLOYEE']} />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="leaves" element={<LeaveRequests />} />
              <Route path="payslips" element={<MyPayslips />} />
              <Route path="performance" element={<MyPerformance />} />
              <Route path="profile" element={<EmployeeProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
