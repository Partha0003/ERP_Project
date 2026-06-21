import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { employeesApi } from '@/api/employees.api';
import { salaryApi } from '@/api/salary.api';
import {
  AttendanceBarChart,
  AttendancePieChart,
  PayrollBarChart,
  WeeklyTrendChart,
  weeklyToChartData,
} from '@/components/charts/HrCharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader, PageLoader } from '@/components/shared/PageHeader';
import { formatCurrency, getCurrentMonthParam, getAttendanceMonthParam } from '@/utils/roleUtils';

export function HRDashboard() {
  const month = getAttendanceMonthParam();
  const salaryMonth = getCurrentMonthParam();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const startDate = weekStart.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  const attendanceQuery = useQuery({
    queryKey: ['hr', 'attendance', 'monthly', month],
    queryFn: () => attendanceApi.getOrgMonthlySummary(month),
    retry: 1,
  });

  const weeklyQuery = useQuery({
    queryKey: ['hr', 'attendance', 'weekly', startDate, endDate],
    queryFn: () => attendanceApi.getOrgWeeklySummary(startDate, endDate),
  });

  const leavesQuery = useQuery({
    queryKey: ['hr', 'leaves', 0, 50],
    queryFn: () => leavesApi.getAll({ page: 0, size: 50 }),
  });

  const employeesQuery = useQuery({
    queryKey: ['hr', 'employees', 0, 5],
    queryFn: () => employeesApi.getPaged(0, 5),
  });

  const payrollQuery = useQuery({
    queryKey: ['hr', 'payroll', 'dashboard', salaryMonth],
    queryFn: () => salaryApi.getDashboard(salaryMonth),
  });

  const statusQuery = useQuery({
    queryKey: ['hr', 'payroll', 'status', salaryMonth],
    queryFn: () => salaryApi.getStatusCount(salaryMonth),
  });

  const isLoading = payrollQuery.isLoading && attendanceQuery.isLoading;

  if (isLoading) return <PageLoader />;

  const att = attendanceQuery.data ?? { present: 0, absent: 0, leave: 0, notMarked: 0 };
  const pendingLeaves = (leavesQuery.data?.content ?? []).filter((l) => l.status === 'PENDING').length;
  const payroll = payrollQuery.data;
  const statusCounts = statusQuery.data ?? {};

  const attendanceChart = [
    { name: 'Present', value: att?.present ?? 0 },
    { name: 'Absent', value: att?.absent ?? 0 },
    { name: 'Leave', value: att?.leave ?? 0 },
    { name: 'Not Marked', value: att?.notMarked ?? 0 },
  ];

  const payrollChart = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const weeklyData = weeklyToChartData(weeklyQuery.data?.dailyStatus);

  return (
    <div>
      <PageHeader
        title="HR Dashboard"
        subtitle="Workforce, attendance, and payroll overview"
        actions={
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/hr/employees/create" className="btn btn-primary btn-sm">
              <i className="bi bi-person-plus me-1" />Add Employee
            </Link>
            <Link to="/hr/leaves" className="btn btn-outline-warning btn-sm">
              Pending Leaves ({pendingLeaves})
            </Link>
          </div>
        }
      />

      {attendanceQuery.error && (
        <div className="alert alert-warning py-2 mb-3">
          Attendance summary unavailable — showing empty counts for this month.
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Present (Month)" value={att?.present ?? 0} icon="check-circle" color="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Absent (Month)" value={att?.absent ?? 0} icon="x-circle" color="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Pending Leaves" value={pendingLeaves} icon="calendar-x" color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Total Payout" value={formatCurrency(payroll?.totalPayout ?? 0)} icon="cash-stack" color="primary" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <AttendancePieChart data={attendanceChart} title="Monthly Attendance Breakdown" />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <PayrollBarChart data={payrollChart} title="Payroll Status Counts" />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Weekly Attendance Trend</div>
            <div className="card-body">
              <WeeklyTrendChart data={weeklyData} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold d-flex justify-content-between">
              Recent Employees
              <Link to="/hr/employees" className="btn btn-sm btn-link">View all</Link>
            </div>
            <ul className="list-group list-group-flush">
              {(employeesQuery.data?.content ?? []).map((emp) => (
                <li key={emp.id} className="list-group-item d-flex justify-content-between">
                  <span>{emp.name}</span>
                  <span className="text-muted small">{emp.departmentName}</span>
                </li>
              ))}
            </ul>
            <div className="card-footer bg-white small text-muted">
              Pending payslips: {payroll?.pendingPayslipsCount ?? 0} · Forwarded: {payroll?.forwardedPayslipsCount ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <AttendanceBarChart data={attendanceChart} title="Attendance Summary Bar Chart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
