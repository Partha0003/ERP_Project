import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '@/api/leaves.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PaginationControls } from '@/features/admin/components/PaginationControls';
import { LeaveTable } from '@/features/hr/components/LeaveTable';
import {
  leaveRequestSchema,
  type LeaveRequestFormData,
} from '@/features/employee/schemas/employeeSchemas';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { LEAVE_TYPE_OPTIONS } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function LeaveRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const listQuery = useQuery({
    queryKey: ['employee', 'leaves', page, pageSize],
    queryFn: () => leavesApi.getMyLeaves(page, pageSize),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { leaveType: '', startDate: '', endDate: '', reason: '' },
  });

  const createMutation = useMutation({
    mutationFn: leavesApi.requestLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] });
      setAlert({ type: 'success', message: 'Leave request submitted successfully' });
      reset();
      setShowForm(false);
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to submit leave') }),
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    setAlert(null);
    createMutation.mutate({
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    });
  };

  if (listQuery.isLoading) return <PageLoader />;
  if (listQuery.error) return <ErrorAlert message="Failed to load leave requests" />;

  const leaves = (listQuery.data?.content ?? []).filter(
    (l) => !statusFilter || l.status === statusFilter
  );

  return (
    <div>
      <PageHeader
        title="Leave Requests"
        subtitle="Apply for leave and track your requests"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Apply Leave'}
          </button>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">Apply for Leave</div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Leave Type *</label>
                  <select
                    className={`form-select ${errors.leaveType ? 'is-invalid' : ''}`}
                    {...register('leaveType')}
                  >
                    <option value="">Select type</option>
                    {LEAVE_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.leaveType && <div className="invalid-feedback">{errors.leaveType.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Start Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                    {...register('startDate')}
                  />
                  {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">End Date *</label>
                  <input
                    type="date"
                    className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                    {...register('endDate')}
                  />
                  {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Reason *</label>
                  <textarea
                    rows={2}
                    className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                    placeholder="Brief reason for your leave request"
                    {...register('reason')}
                  />
                  {errors.reason && <div className="invalid-feedback">{errors.reason.message}</div>}
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Submitting...' : 'Submit Leave'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-header bg-white fw-semibold">My Leave Requests</div>
        <div className="card-body py-3 border-bottom">
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 200 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="card-body p-0">
          <LeaveTable leaves={leaves} variant="employee" />
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
