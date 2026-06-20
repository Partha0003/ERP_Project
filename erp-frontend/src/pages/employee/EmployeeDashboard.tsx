import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { payslipApi, performanceApi } from '@/api/salary.api';
import { AttendancePieChart } from '@/components/charts/HrCharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PageHeader, PageLoader } from '@/components/shared/PageHeader';
import { formatCurrency, formatDate } from '@/utils/roleUtils';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function EmployeeDashboard() {
  const { employeeId } = useAuth();
  const queryClient = useQueryClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const summaryQuery = useQuery({
    queryKey: ['employee', 'attendance', 'summary', employeeId, month, year],
    queryFn: () => attendanceApi.getMonthlySummary(employeeId!, month, year),
    enabled: !!employeeId,
  });

  const leavesQuery = useQuery({
    queryKey: ['employee', 'leaves', 0],
    queryFn: () => leavesApi.getMyLeaves(0, 5),
  });

  const payslipsQuery = useQuery({
    queryKey: ['employee', 'payslips'],
    queryFn: payslipApi.getMyPayslips,
  });

  const reviewsQuery = useQuery({
    queryKey: ['employee', 'performance'],
    queryFn: performanceApi.getMyReviews,
  });

  const markMutation = useMutation({
    mutationFn: () => attendanceApi.markNow(employeeId!),
    onSuccess: (msg) => {
      setAlert({ type: 'success', message: msg });
      queryClient.invalidateQueries({ queryKey: ['employee', 'attendance'] });
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Could not mark attendance') }),
  });

  if (employeeId && summaryQuery.isLoading) return <PageLoader />;

  const summary = summaryQuery.data ?? {};
  const chartData = [
    { name: 'Present', value: summary.present ?? 0 },
    { name: 'Absent', value: summary.absent ?? 0 },
    { name: 'Leave', value: summary.leave ?? 0 },
  ];

  const latestPayslip = payslipsQuery.data?.[0];
  const latestReview = reviewsQuery.data?.[0];
  const pendingLeaves = (leavesQuery.data?.content ?? []).filter((l) => l.status === 'PENDING').length;

  return (
    <div>
      <PageHeader
        title="My Dashboard"
        subtitle="Personal workspace overview"
        actions={
          employeeId ? (
            <button className="btn btn-success btn-sm" disabled={markMutation.isPending} onClick={() => markMutation.mutate()}>
              Mark Attendance Now
            </button>
          ) : undefined
        }
      />

      {!employeeId && (
        <div className="alert alert-warning">
          Link your employee ID in <Link to="/employee/profile">Profile Setup</Link> to unlock attendance features.
        </div>
      )}

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Present" value={summary.present ?? 0} icon="check-circle" color="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Absent" value={summary.absent ?? 0} icon="x-circle" color="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Pending Leaves" value={pendingLeaves} icon="calendar-x" color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Payslips" value={payslipsQuery.data?.length ?? 0} icon="cash" color="primary" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              {employeeId ? (
                <AttendancePieChart data={chartData} title="My Attendance This Month" />
              ) : (
                <div className="text-muted text-center py-5">Attendance chart unavailable</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white fw-semibold d-flex justify-content-between">
                  Recent Leaves
                  <Link to="/employee/leaves" className="btn btn-sm btn-link">View all</Link>
                </div>
                <ul className="list-group list-group-flush">
                  {(leavesQuery.data?.content ?? []).slice(0, 4).map((l) => (
                    <li key={l.id} className="list-group-item d-flex justify-content-between">
                      <span>{l.leaveType}</span>
                      <span className="badge bg-warning text-dark">{l.status}</span>
                    </li>
                  ))}
                  {(leavesQuery.data?.content ?? []).length === 0 && (
                    <li className="list-group-item text-muted">No leave requests</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white fw-semibold">Latest Payslip</div>
                <div className="card-body">
                  {latestPayslip ? (
                    <>
                      <div className="fs-4 fw-bold">{formatCurrency(latestPayslip.netSalary)}</div>
                      <div className="text-muted">{latestPayslip.month} {latestPayslip.year}</div>
                      <span className="badge bg-secondary mt-2">{latestPayslip.status}</span>
                    </>
                  ) : (
                    <div className="text-muted">No payslips yet</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-semibold">Latest Performance Review</div>
                <div className="card-body">
                  {latestReview ? (
                    <>
                      <span className="badge bg-primary me-2">{latestReview.performanceRating}</span>
                      <span className="text-muted small">{formatDate(latestReview.reviewDate)}</span>
                      <p className="mb-0 mt-2">{latestReview.comments}</p>
                    </>
                  ) : (
                    <div className="text-muted">No reviews yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
