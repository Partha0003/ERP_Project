import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payslipApi } from '@/api/salary.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency } from '@/utils/roleUtils';
import { getApiErrorMessage } from '@/utils/apiErrors';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function MyPayslips() {
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ['employee', 'payslips'],
    queryFn: payslipApi.getMyPayslips,
  });

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    setAlert(null);
    try {
      await payslipApi.downloadSelf(id);
      setAlert({ type: 'success', message: 'Payslip downloaded successfully' });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to download payslip') });
    } finally {
      setDownloadingId(null);
    }
  };

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load payslips" />;

  const payslips = query.data ?? [];
  const chartData = payslips.map((p) => ({
    name: `${p.month.slice(0, 3)} ${p.year}`,
    salary: p.netSalary,
  }));

  return (
    <div>
      <PageHeader title="My Payslips" subtitle="View salary history and download payslips" />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {chartData.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">Salary History</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="salary" fill="#0d6efd" name="Net Salary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-4">No payslips available</td></tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id}>
                    <td>{p.month}</td>
                    <td>{p.year}</td>
                    <td className="fw-semibold">{formatCurrency(p.netSalary)}</td>
                    <td><span className="badge bg-secondary">{p.status}</span></td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={downloadingId === p.id}
                        onClick={() => handleDownload(p.id)}
                      >
                        {downloadingId === p.id ? 'Downloading...' : 'Download PDF'}
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
