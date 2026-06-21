import { useQuery } from '@tanstack/react-query';
import { salaryApi } from '@/api/salary.api';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency, getCurrentMonthParam } from '@/utils/roleUtils';

export function FinanceDashboard() {
  const month = getCurrentMonthParam();

  const dashboardQuery = useQuery({
    queryKey: ['salary', 'dashboard', month],
    queryFn: () => salaryApi.getDashboard(month),
  });

  const summaryQuery = useQuery({
    queryKey: ['salary', 'summary', month],
    queryFn: () => salaryApi.getSummary(month),
  });

  const statusQuery = useQuery({
    queryKey: ['salary', 'status-count', month],
    queryFn: () => salaryApi.getStatusCount(month),
  });

  if (dashboardQuery.isLoading) return <PageLoader />;
  if (dashboardQuery.error) return <ErrorAlert message="Failed to load finance dashboard" />;

  const dash = dashboardQuery.data;
  const summary = summaryQuery.data ?? {};
  const statusCounts = statusQuery.data ?? {};

  return (
    <div>
      <PageHeader title="Finance Dashboard" subtitle="Payroll processing and financial overview" />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Payroll (Paid)"
            value={formatCurrency(dash?.totalPayout ?? 0)}
            icon="cash-stack"
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Pending Approval"
            value={dash?.pendingPayslipsCount ?? 0}
            icon="hourglass-split"
            color="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Forwarded (Unpaid)"
            value={dash?.forwardedPayslipsCount ?? 0}
            icon="arrow-right-circle"
            color="info"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Paid"
            value={dash?.paidCount ?? 0}
            icon="check-circle"
            color="success"
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Monthly Summary</div>
            <ul className="list-group list-group-flush">
              {Object.keys(summary).length === 0 ? (
                <li className="list-group-item text-muted">No payroll data for this month — ask HR to generate salaries.</li>
              ) : (
                Object.entries(summary).map(([key, val]) => (
                  <li key={key} className="list-group-item d-flex justify-content-between">
                    <span className="text-capitalize">{key}</span>
                    <span className="fw-semibold">{val}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Salary Status Counts</div>
            <ul className="list-group list-group-flush">
              {Object.keys(statusCounts).length === 0 ? (
                <li className="list-group-item text-muted">No salary records yet for the selected month.</li>
              ) : (
                Object.entries(statusCounts).map(([key, val]) => (
                  <li key={key} className="list-group-item d-flex justify-content-between">
                    <span>{key}</span>
                    <span className="badge bg-primary">{val}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
