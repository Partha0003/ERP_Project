import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryApi, payslipApi } from '@/api/salary.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency, getCurrentMonthParam } from '@/utils/roleUtils';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function PayrollProcessingPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(getCurrentMonthParam().slice(0, 7));
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const monthParam = `${month}-01`;

  const payslipsQuery = useQuery({
    queryKey: ['payslips', 'filter', monthParam],
    queryFn: () => payslipApi.filter(monthParam),
  });

  const markPaidMutation = useMutation({
    mutationFn: salaryApi.markPaid,
    onSuccess: (msg) => {
      setAlert({ type: 'success', message: msg || 'Salary marked as paid' });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to mark as paid') }),
  });

  if (payslipsQuery.isLoading) return <PageLoader />;
  if (payslipsQuery.error) return <ErrorAlert message="Failed to load payroll records. Ensure HR has forwarded salaries." />;

  const payslips = (payslipsQuery.data ?? []).filter((p) => p.forwardedToFinance);

  return (
    <div>
      <PageHeader
        title="Payroll Processing"
        subtitle="Mark forwarded salaries as paid"
        actions={
          <input
            type="month"
            className="form-control form-control-sm"
            style={{ width: 'auto' }}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Net Salary</th>
                <th>HR Approved</th>
                <th>Forwarded</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No forwarded salaries for this month. HR must generate → approve → forward first.
                  </td>
                </tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id}>
                    <td>{p.employeeName}</td>
                    <td>{p.department}</td>
                    <td>{formatCurrency(p.netSalary)}</td>
                    <td>{p.approvedByHR ? 'Yes' : 'No'}</td>
                    <td>{p.forwardedToFinance ? 'Yes' : 'No'}</td>
                    <td>
                      <span className={`badge ${p.paid ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {p.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>
                      {!p.paid && (
                        <button
                          className="btn btn-sm btn-success"
                          disabled={markPaidMutation.isPending}
                          onClick={() => markPaidMutation.mutate(p.id)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
