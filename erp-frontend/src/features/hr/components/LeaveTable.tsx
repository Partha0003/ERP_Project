import type { EmployeeLeaveDto } from '@/types/leave.types';
import { formatDate } from '@/utils/roleUtils';
import { statusBadgeClass } from './AttendanceTable';

interface LeaveTableProps {
  leaves: EmployeeLeaveDto[];
  variant?: 'employee' | 'hr';
  showActions?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  actionId?: number | null;
}

export function LeaveTable({
  leaves,
  variant = 'employee',
  showActions = false,
  onApprove,
  onReject,
  actionId,
}: LeaveTableProps) {
  if (leaves.length === 0) {
    return <div className="text-center text-muted py-5">No leave requests found</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            {variant === 'hr' && <th>Employee</th>}
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            {variant === 'employee' && <th>Applied Date</th>}
            {showActions && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id}>
              {variant === 'hr' && <td className="fw-semibold">{leave.employeeName ?? leave.employeeId}</td>}
              <td>{leave.leaveType}</td>
              <td>{formatDate(leave.startDate)}</td>
              <td>{formatDate(leave.endDate)}</td>
              <td className="text-truncate" style={{ maxWidth: 200 }}>{leave.reason}</td>
              <td>
                <span className={`badge ${statusBadgeClass(leave.status ?? '')}`}>{leave.status}</span>
              </td>
              {variant === 'employee' && (
                <td>{leave.appliedDate ? formatDate(leave.appliedDate) : '—'}</td>
              )}
              {showActions && (
                <td className="text-end">
                  {leave.status === 'PENDING' && leave.id && (
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-success"
                        disabled={actionId === leave.id}
                        onClick={() => onApprove?.(leave.id!)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={actionId === leave.id}
                        onClick={() => onReject?.(leave.id!)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
