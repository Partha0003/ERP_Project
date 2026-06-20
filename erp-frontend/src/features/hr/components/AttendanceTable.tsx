import type { AttendanceResponseDto } from '@/types/attendance.types';
import { formatDate } from '@/utils/roleUtils';

interface AttendanceRecord {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  date?: string;
  status?: string;
  present?: boolean;
  overtime?: boolean;
  remarks?: string;
  employee?: { name?: string; id?: number };
}

interface AttendanceTableProps {
  records: AttendanceRecord[] | AttendanceResponseDto[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  if (records.length === 0) {
    return <div className="text-center text-muted py-5">No attendance records found</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Status</th>
            <th>Present</th>
            <th>Overtime</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, idx) => {
            const name =
              rec.employeeName ??
              (rec as AttendanceRecord).employee?.name ??
              String(rec.employeeId ?? '—');
            return (
              <tr key={rec.id ?? idx}>
                <td>{name}</td>
                <td>{rec.date ? formatDate(rec.date) : '—'}</td>
                <td><span className="badge bg-secondary">{rec.status ?? '—'}</span></td>
                <td>{rec.present ? 'Yes' : 'No'}</td>
                <td>{rec.overtime ? 'Yes' : 'No'}</td>
                <td>{rec.remarks ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function statusBadgeClass(status?: string): string {
  switch (status) {
    case 'APPROVED':
    case 'PRESENT':
      return 'bg-success';
    case 'REJECTED':
    case 'ABSENT':
      return 'bg-danger';
    case 'PENDING':
      return 'bg-warning text-dark';
    default:
      return 'bg-secondary';
  }
}
