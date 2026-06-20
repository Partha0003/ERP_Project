import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payslipApi } from '@/api/salary.api';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency, getCurrentMonthParam } from '@/utils/roleUtils';

export function PayslipsPage() {
  const [month, setMonth] = useState(getCurrentMonthParam().slice(0, 7));
  const [search, setSearch] = useState('');
  const monthParam = `${month}-01`;

  const query = useQuery({
    queryKey: ['payslips', 'finance', monthParam, search],
    queryFn: () => payslipApi.filter(monthParam, undefined, search || undefined),
  });

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load payslips" />;

  const payslips = query.data ?? [];

  return (
    <div>
      <PageHeader
        title="Payslips"
        subtitle="View and download employee payslips"
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

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <input
            className="form-control"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Month</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No payslips for this month. Generate payroll from the HR portal first.
                  </td>
                </tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id}>
                    <td>{p.employeeName}</td>
                    <td>{p.department}</td>
                    <td>{p.month}</td>
                    <td>{formatCurrency(p.netSalary)}</td>
                    <td><span className="badge bg-secondary">{p.status}</span></td>
                    <td>{p.paid ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => payslipApi.download(p.id, `Payslip_${p.employeeName}.pdf`)}
                      >
                        Download PDF
                      </button>
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
