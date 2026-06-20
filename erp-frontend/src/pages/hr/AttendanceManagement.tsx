import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PaginationControls } from '@/features/admin/components/PaginationControls';
import { AttendanceTable } from '@/features/hr/components/AttendanceTable';
import { markAttendanceSchema, type MarkAttendanceFormData } from '@/features/hr/schemas/hrSchemas';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { AttendancePieChart } from '@/components/charts/HrCharts';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';
import type { AttendanceStatus, AttendanceResponseDto } from '@/types/attendance.types';
import { ATTENDANCE_STATUS_OPTIONS, MANUAL_ATTENDANCE_STATUS_OPTIONS } from '@/utils/constants';

export function AttendanceManagement() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const { markAttendance, markNow } = useHrMutations();

  const listQuery = useQuery({
    queryKey: ['hr', 'attendance', 'list', page, pageSize, statusFilter, employeeFilter],
    queryFn: () =>
      employeeFilter || statusFilter
        ? attendanceApi.getFiltered({
            page,
            size: pageSize,
            employeeId: employeeFilter ? Number(employeeFilter) : undefined,
            status: statusFilter || undefined,
          })
        : attendanceApi.getAllPaged(page, pageSize),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MarkAttendanceFormData>({
    resolver: zodResolver(markAttendanceSchema),
    defaultValues: {
      employeeId: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      remarks: '',
      overtime: false,
    },
  });

  const records: AttendanceResponseDto[] = listQuery.data?.content ?? [];
  const statusSummary = ATTENDANCE_STATUS_OPTIONS.map((s) => ({
    name: s,
    value: records.filter((r: AttendanceResponseDto) => r.status === s).length,
  }));

  const onSubmit = async (data: MarkAttendanceFormData) => {
    setAlert(null);
    try {
      await markAttendance.mutateAsync({
        employeeId: data.employeeId,
        date: data.date,
        status: data.status as AttendanceStatus,
        present: data.status === 'PRESENT' || data.status === 'HALF_DAY',
        overtime: data.overtime ?? false,
        remarks: data.remarks,
      });
      setAlert({ type: 'success', message: 'Attendance marked successfully' });
      reset({ ...data, remarks: '' });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to mark attendance') });
    }
  };

  const handleMarkNow = async () => {
    const id = Number(employeeFilter);
    if (!id) {
      setAlert({ type: 'danger', message: 'Enter an Employee ID in the filter to mark now' });
      return;
    }
    setAlert(null);
    try {
      const msg = await markNow.mutateAsync(id);
      setAlert({ type: 'success', message: msg });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to mark attendance') });
    }
  };

  if (listQuery.isLoading) return <PageLoader />;
  if (listQuery.error) return <ErrorAlert message="Failed to load attendance records" />;

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle="Mark and monitor employee attendance"
        actions={
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => attendanceApi.exportExcel()}>Export Excel</button>
            <button className="btn btn-outline-danger" onClick={() => attendanceApi.exportPdf()}>Export PDF</button>
          </div>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Mark Attendance</div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-2 align-items-end">
                  <div className="col-md-2">
                    <label className="form-label small">Employee ID</label>
                    <input type="number" className={`form-control ${errors.employeeId ? 'is-invalid' : ''}`} {...register('employeeId')} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Date</label>
                    <input type="date" className="form-control" {...register('date')} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Status</label>
                    <select className="form-select" {...register('status')}>
                      {MANUAL_ATTENDANCE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">Remarks</label>
                    <input className="form-control" {...register('remarks')} />
                  </div>
                  <div className="col-md-1">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="ot" {...register('overtime')} />
                      <label className="form-check-label small" htmlFor="ot">OT</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100" disabled={markAttendance.isPending}>Mark</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <AttendancePieChart data={statusSummary} title="Current Page Status Mix" />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="Employee ID filter" value={employeeFilter} onChange={(e) => { setEmployeeFilter(e.target.value); setPage(0); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                <option value="">All Statuses</option>
                {ATTENDANCE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-success" onClick={handleMarkNow} disabled={markNow.isPending}>
                Mark Now (filtered ID)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <AttendanceTable records={records} />
        </div>
        <div className="card-footer bg-white">
          <PaginationControls
            currentPage={page}
            totalPages={listQuery.data?.totalPages ?? 1}
            totalItems={listQuery.data?.totalElements ?? records.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          />
        </div>
      </div>
    </div>
  );
}
