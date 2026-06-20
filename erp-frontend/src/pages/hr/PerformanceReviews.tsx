import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { performanceApi } from '@/api/salary.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PerformanceTable } from '@/features/hr/components/PerformanceTable';
import { performanceReviewSchema, type PerformanceReviewFormData } from '@/features/hr/schemas/hrSchemas';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';

const RATINGS = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'];

export function PerformanceReviews() {
  const [showForm, setShowForm] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const { createReview } = useHrMutations();

  const listQuery = useQuery({
    queryKey: ['hr', 'performance'],
    queryFn: performanceApi.getAll,
  });

  const employeeQuery = useQuery({
    queryKey: ['hr', 'performance', 'employee', employeeFilter],
    queryFn: () => performanceApi.getByEmployee(Number(employeeFilter)),
    enabled: !!employeeFilter,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PerformanceReviewFormData>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      employeeId: 0,
      reviewDate: new Date().toISOString().split('T')[0],
      performanceRating: 'Good',
      comments: '',
    },
  });

  const onSubmit = async (data: PerformanceReviewFormData) => {
    setAlert(null);
    try {
      await createReview.mutateAsync(data);
      setAlert({ type: 'success', message: 'Performance review created successfully' });
      reset();
      setShowForm(false);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to create review') });
    }
  };

  if (listQuery.isLoading) return <PageLoader />;
  if (listQuery.error) return <ErrorAlert message="Failed to load performance reviews" />;

  const reviews = employeeFilter ? (employeeQuery.data ?? []) : (listQuery.data ?? []);

  return (
    <div>
      <PageHeader
        title="Performance Reviews"
        subtitle="Create and manage employee performance evaluations"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-plus-lg me-1" />New Review
          </button>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">Create Performance Review</div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Employee ID *</label>
                  <input type="number" className={`form-control ${errors.employeeId ? 'is-invalid' : ''}`} {...register('employeeId')} />
                  {errors.employeeId && <div className="invalid-feedback">{errors.employeeId.message}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Review Date *</label>
                  <input type="date" className="form-control" {...register('reviewDate')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Rating *</label>
                  <select className="form-select" {...register('performanceRating')}>
                    {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Comments *</label>
                  <textarea rows={3} className={`form-control ${errors.comments ? 'is-invalid' : ''}`} {...register('comments')} />
                  {errors.comments && <div className="invalid-feedback">{errors.comments.message}</div>}
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success" disabled={createReview.isPending}>Submit Review</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <input
            className="form-control"
            placeholder="Filter by Employee ID..."
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <PerformanceTable reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
