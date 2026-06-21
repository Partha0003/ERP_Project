import type { SalaryPayslipDto } from '@/types/salary.types';
import { formatCurrency } from '@/utils/roleUtils';

interface PayrollTableProps {
  payslips: SalaryPayslipDto[];
  onApprove?: (id: number) => void;
  onForward?: (id: number) => void;
  onDownload?: (p: SalaryPayslipDto) => void;
  onEmail?: (id: number) => void;
  actionId?: number | null;
}

export function PayrollTable({
  payslips,
  onApprove,
  onForward,
  onDownload,
  onEmail,
  actionId,
}: PayrollTableProps) {
  if (payslips.length === 0) {
    return <div className="text-center text-muted py-5">No salary records for selected period</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Month</th>
            <th>Net Salary</th>
            <th>HR</th>
            <th>Finance</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((p) => (
            <tr key={p.id}>
              <td className="fw-medium">{p.employeeName}</td>
              <td>{p.department}</td>
              <td>{p.month}</td>
              <td>{formatCurrency(p.netSalary)}</td>
              <td>{p.approvedByHR ? '✓' : '—'}</td>
              <td>{p.forwardedToFinance ? '✓' : '—'}</td>
              <td><span className="badge bg-secondary">{p.status}</span></td>
              <td className="text-end">
                <div className="btn-group btn-group-sm flex-wrap">
                  {!p.approvedByHR && onApprove && (
                    <button className="btn btn-outline-success" disabled={actionId === p.id} onClick={() => onApprove(p.id)}>
                      Approve
                    </button>
                  )}
                  {p.approvedByHR && !p.forwardedToFinance && onForward && (
                    <button className="btn btn-outline-info" disabled={actionId === p.id} onClick={() => onForward(p.id)}>
                      Forward
                    </button>
                  )}
                  {onDownload && (
                    <button className="btn btn-outline-primary" onClick={() => onDownload(p)}>PDF</button>
                  )}
                  {onEmail && (
                    <button className="btn btn-outline-secondary" disabled={actionId === p.id} onClick={() => onEmail(p.id)}>
                      Email
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
