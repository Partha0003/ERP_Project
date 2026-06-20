import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salaryApi, payslipApi } from '@/api/salary.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PayrollTable } from '@/features/hr/components/PayrollTable';
import { PayrollBarChart } from '@/components/charts/HrCharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency, getCurrentMonthParam } from '@/utils/roleUtils';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function PayrollDashboard() {
  const [month, setMonth] = useState(getCurrentMonthParam().slice(0, 7));
  const [searchName, setSearchName] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const monthParam = `${month}-01`;
  const { generateSalary, approveSalary, forwardSalary, emailPayslip } = useHrMutations();

  const dashboardQuery = useQuery({
    queryKey: ['hr', 'payroll', 'dashboard'],
    queryFn: salaryApi.getDashboard,
  });

  const payslipsQuery = useQuery({
    queryKey: ['hr', 'payslips', monthParam, searchName],
    queryFn: () => payslipApi.filter(monthParam, undefined, searchName || undefined),
  });

  const statusQuery = useQuery({
    queryKey: ['hr', 'payroll', 'status', monthParam],
    queryFn: () => salaryApi.getStatusCount(monthParam),
  });

  const handleGenerate = async () => {
    setAlert(null);
    try {
      const msg = await generateSalary.mutateAsync(monthParam);
      setAlert({ type: 'success', message: msg });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to generate salary') });
    }
  };

  const runAction = async (fn: () => Promise<string>, success: string) => {
    setAlert(null);
    try {
      const msg = await fn();
      setAlert({ type: 'success', message: msg || success });
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Action failed') });
    } finally {
      setActionId(null);
    }
  };

  if (dashboardQuery.isLoading) return <PageLoader />;
  if (dashboardQuery.error) return <ErrorAlert message="Failed to load payroll dashboard" />;

  const dash = dashboardQuery.data;
  const payslips = payslipsQuery.data ?? [];
  const chartData = Object.entries(statusQuery.data ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader
        title="Payroll Dashboard"
        subtitle="Generate, approve, and forward monthly payroll"
        actions={
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input type="month" className="form-control form-control-sm" style={{ width: 'auto' }} value={month} onChange={(e) => setMonth(e.target.value)} />
            <button className="btn btn-primary btn-sm" disabled={generateSalary.isPending} onClick={handleGenerate}>
              Generate Salary
            </button>
          </div>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="row g-4 mb-4">
        <div className="col-sm-4">
          <StatCard title="Total Payout" value={formatCurrency(dash?.totalPayout ?? 0)} icon="cash-stack" color="primary" />
        </div>
        <div className="col-sm-4">
          <StatCard title="Pending" value={dash?.pendingPayslipsCount ?? 0} icon="hourglass" color="warning" />
        </div>
        <div className="col-sm-4">
          <StatCard title="Forwarded" value={dash?.forwardedPayslipsCount ?? 0} icon="arrow-right" color="info" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <PayrollBarChart data={chartData} title="Salary Status Breakdown" />
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body py-3">
              <input
                className="form-control"
                placeholder="Filter by employee name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <PayrollTable
                payslips={payslips}
                actionId={actionId}
                onApprove={(id) => { setActionId(id); runAction(() => approveSalary.mutateAsync(id), 'Approved'); }}
                onForward={(id) => { setActionId(id); runAction(() => forwardSalary.mutateAsync(id), 'Forwarded'); }}
                onDownload={(p) => payslipApi.download(p.id, `Payslip_${p.employeeName}.pdf`)}
                onEmail={(id) => { setActionId(id); runAction(() => emailPayslip.mutateAsync(id), 'Email sent'); }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
