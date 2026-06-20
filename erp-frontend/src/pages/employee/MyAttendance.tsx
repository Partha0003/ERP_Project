import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/api/attendance.api';
import { AttendanceBarChart } from '@/components/charts/HrCharts';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PaginationControls } from '@/features/admin/components/PaginationControls';
import { AttendanceTable } from '@/features/hr/components/AttendanceTable';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function MyAttendance() {
  const { employeeId } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const now = new Date();
  const listQuery = useQuery({
    queryKey: ['employee', 'attendance', employeeId, page, pageSize],
    queryFn: () => attendanceApi.getEmployeePaged(employeeId!, page, pageSize),
    enabled: !!employeeId,
  });

  const summaryQuery = useQuery({
    queryKey: ['employee', 'attendance', 'summary', employeeId, now.getMonth() + 1, now.getFullYear()],
    queryFn: () => attendanceApi.getMonthlySummary(employeeId!, now.getMonth() + 1, now.getFullYear()),
    enabled: !!employeeId,
  });

  const markMutation = useMutation({
    mutationFn: () => attendanceApi.markNow(employeeId!),
    onSuccess: (msg) => {
      setAlert({ type: 'success', message: msg });
      queryClient.invalidateQueries({ queryKey: ['employee', 'attendance'] });
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to mark attendance') }),
  });

  if (!employeeId) {
    return (
      <div>
        <PageHeader title="My Attendance" />
        <div className="alert alert-warning">
          Set your Employee ID in <Link to="/employee/profile">Profile Setup</Link>.
        </div>
      </div>
    );
  }

  if (listQuery.isLoading) return <PageLoader />;
  if (listQuery.error) return <ErrorAlert message="Failed to load attendance" />;

  const summary = summaryQuery.data ?? {};
  const chartData = [
    { name: 'Present', value: summary.present ?? 0 },
    { name: 'Absent', value: summary.absent ?? 0 },
    { name: 'Leave', value: summary.leave ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="My Attendance"
        subtitle="View and manage your attendance records"
        actions={
          <div className="btn-group btn-group-sm">
            <button className="btn btn-success" disabled={markMutation.isPending} onClick={() => markMutation.mutate()}>
              Mark Today
            </button>
            <button className="btn btn-outline-primary" onClick={() => attendanceApi.exportExcel({ employeeId })}>
              Export Excel
            </button>
            <button className="btn btn-outline-danger" onClick={() => attendanceApi.exportPdf({ employeeId })}>
              Export PDF
            </button>
          </div>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <AttendanceBarChart data={chartData} title="Monthly Summary" />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <AttendanceTable records={listQuery.data?.content ?? []} />
        </div>
        <div className="card-footer bg-white">
          <PaginationControls
            currentPage={page}
            totalPages={listQuery.data?.totalPages ?? 1}
            totalItems={listQuery.data?.totalElements ?? 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          />
        </div>
      </div>
    </div>
  );
}
