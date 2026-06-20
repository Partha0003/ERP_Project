import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leavesApi } from '@/api/leaves.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PaginationControls } from '@/features/admin/components/PaginationControls';
import { LeaveTable } from '@/features/hr/components/LeaveTable';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function LeaveApproval() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const { updateLeaveStatus } = useHrMutations();

  const listQuery = useQuery({
    queryKey: ['hr', 'leaves', page, pageSize, statusFilter, employeeFilter, startDate, endDate],
    queryFn: () =>
      leavesApi.getAll({
        page,
        size: pageSize,
        status: statusFilter || undefined,
        employeeName: employeeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const handleStatus = async (id: number, status: string) => {
    setActionId(id);
    setAlert(null);
    try {
      await updateLeaveStatus.mutateAsync({ id, status });
      setAlert({ type: 'success', message: `Leave ${status.toLowerCase()} successfully` });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to update leave status') });
    } finally {
      setActionId(null);
    }
  };

  if (listQuery.isLoading) return <PageLoader />;
  if (listQuery.error) return <ErrorAlert message="Failed to load leave requests" />;

  const leaves = listQuery.data?.content ?? [];
  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <div>
      <PageHeader
        title="Leave Approval"
        subtitle={`Review and approve employee leave requests · ${pendingCount} pending on this page`}
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Employee Name</label>
              <input
                className="form-control"
                placeholder="Search employee..."
                value={employeeFilter}
                onChange={(e) => { setEmployeeFilter(e.target.value); setPage(0); }}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Start Date</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} />
            </div>
            <div className="col-md-2">
              <label className="form-label small">End Date</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setStatusFilter('');
                  setEmployeeFilter('');
                  setStartDate('');
                  setEndDate('');
                  setPage(0);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <LeaveTable
            leaves={leaves}
            variant="hr"
            showActions
            actionId={actionId}
            onApprove={(id) => handleStatus(id, 'APPROVED')}
            onReject={(id) => handleStatus(id, 'REJECTED')}
          />
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
