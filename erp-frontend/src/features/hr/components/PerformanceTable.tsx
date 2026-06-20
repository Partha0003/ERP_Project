import type { PerformanceReviewDto } from '@/types/salary.types';
import { formatDate } from '@/utils/roleUtils';

interface PerformanceTableProps {
  reviews: PerformanceReviewDto[];
}

export function PerformanceTable({ reviews }: PerformanceTableProps) {
  if (reviews.length === 0) {
    return <div className="text-center text-muted py-5">No performance reviews found</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Date</th>
            <th>Rating</th>
            <th>Comments</th>
            <th>Final Salary</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.employeeId}</td>
              <td>{formatDate(r.reviewDate)}</td>
              <td><span className="badge bg-primary">{r.performanceRating}</span></td>
              <td className="text-truncate" style={{ maxWidth: 240 }}>{r.comments}</td>
              <td>{r.finalSalary?.toLocaleString() ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
