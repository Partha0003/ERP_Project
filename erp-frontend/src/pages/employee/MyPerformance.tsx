import { useQuery } from '@tanstack/react-query';
import { performanceApi } from '@/api/salary.api';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/roleUtils';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RATING_COLORS: Record<string, string> = {
  Excellent: '#198754',
  Good: '#0d6efd',
  Average: '#ffc107',
  'Below Average': '#fd7e14',
  Poor: '#dc3545',
};

export function MyPerformance() {
  const query = useQuery({
    queryKey: ['employee', 'performance'],
    queryFn: performanceApi.getMyReviews,
  });

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load performance reviews" />;

  const reviews = query.data ?? [];
  const ratingCounts = reviews.reduce<Record<string, number>>((acc, r) => {
    acc[r.performanceRating] = (acc[r.performanceRating] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(ratingCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="My Performance Reviews" subtitle="View your performance evaluation history" />

      {reviews.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">Rating Distribution</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={RATING_COLORS[entry.name] ?? '#6c757d'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="row g-4">
        {reviews.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center text-muted py-5">No performance reviews yet</div>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span
                      className="badge fs-6"
                      style={{ backgroundColor: RATING_COLORS[review.performanceRating] ?? '#6c757d' }}
                    >
                      {review.performanceRating}
                    </span>
                    <small className="text-muted">{formatDate(review.reviewDate)}</small>
                  </div>
                  <p className="mb-3">{review.comments}</p>
                  {review.finalSalary != null && (
                    <div className="small text-muted border-top pt-2">
                      Final Salary: <strong>{review.finalSalary.toLocaleString()}</strong>
                      {review.bonusAmount != null && <> · Bonus: {review.bonusAmount.toLocaleString()}</>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
