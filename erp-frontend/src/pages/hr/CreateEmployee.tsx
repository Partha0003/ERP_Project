import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '@/api/departments.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { employeeSchema, type EmployeeFormData } from '@/features/hr/schemas/hrSchemas';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { PageHeader, PageLoader } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function CreateEmployee() {
  const navigate = useNavigate();
  const { createEmployee } = useHrMutations();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '', email: '', phone: '', role: 'EMPLOYEE',
      departmentId: 0, baseSalary: 0, bonus: 0, deduction: 0, password: '',
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setAlert(null);
    try {
      await createEmployee.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        departmentId: data.departmentId,
        baseSalary: data.baseSalary,
        bonus: data.bonus ?? 0,
        deduction: data.deduction ?? 0,
        password: data.password,
      });
      setAlert({ type: 'success', message: 'Employee created successfully' });
      setTimeout(() => navigate('/hr/employees'), 1200);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to create employee') });
    }
  };

  if (departmentsQuery.isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Create Employee"
        subtitle="Add a new employee to the workforce"
        actions={<Link to="/hr/employees" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1" />Back</Link>}
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoDismiss={alert.type === 'success' ? 3000 : 0} />}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              {([
                ['name', 'Full Name', 'text'],
                ['email', 'Email', 'email'],
                ['phone', 'Phone', 'tel'],
                ['password', 'Password', 'password'],
              ] as const).map(([field, label, type]) => (
                <div key={field} className="col-md-6">
                  <label className="form-label fw-semibold">{label} *</label>
                  <input type={type} className={`form-control ${errors[field] ? 'is-invalid' : ''}`} {...register(field)} />
                  {errors[field] && <div className="invalid-feedback">{errors[field]?.message}</div>}
                </div>
              ))}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Department *</label>
                <select className={`form-select ${errors.departmentId ? 'is-invalid' : ''}`} {...register('departmentId')}>
                  <option value={0}>Select department</option>
                  {(departmentsQuery.data ?? []).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.departmentId && <div className="invalid-feedback">{errors.departmentId.message}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Role *</label>
                <select className="form-select" {...register('role')}>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Base Salary *</label>
                <input type="number" step="0.01" className={`form-control ${errors.baseSalary ? 'is-invalid' : ''}`} {...register('baseSalary')} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Bonus</label>
                <input type="number" step="0.01" className="form-control" {...register('bonus')} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Deduction</label>
                <input type="number" step="0.01" className="form-control" {...register('deduction')} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || createEmployee.isPending}>
                {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
              </button>
              <Link to="/hr/employees" className="btn btn-outline-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
