import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/api/employees.api';
import { departmentsApi } from '@/api/departments.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { employeeUpdateSchema, type EmployeeUpdateFormData } from '@/features/hr/schemas/hrSchemas';
import { useHrMutations } from '@/features/hr/hooks/useHrMutations';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const navigate = useNavigate();
  const { updateEmployee } = useHrMutations();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const employeeQuery = useQuery({
    queryKey: ['hr', 'employee', employeeId],
    queryFn: () => employeesApi.getById(employeeId),
    enabled: !!employeeId,
  });

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<EmployeeUpdateFormData>({
    resolver: zodResolver(employeeUpdateSchema),
  });

  useEffect(() => {
    if (employeeQuery.data) {
      const e = employeeQuery.data;
      reset({
        name: e.name,
        email: e.email,
        phone: e.phone,
        role: e.role,
        departmentId: e.departmentId ?? 0,
        baseSalary: e.baseSalary ?? 0,
        bonus: e.bonus ?? 0,
        deduction: e.deduction ?? 0,
      });
    }
  }, [employeeQuery.data, reset]);

  const onSubmit = async (data: EmployeeUpdateFormData) => {
    setAlert(null);
    try {
      await updateEmployee.mutateAsync({
        id: employeeId,
        data: {
          ...data,
          departmentId: data.departmentId,
          active: employeeQuery.data?.active,
        },
      });
      setAlert({ type: 'success', message: 'Employee updated successfully' });
      setTimeout(() => navigate('/hr/employees'), 1200);
    } catch (err) {
      setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Failed to update employee') });
    }
  };

  if (employeeQuery.isLoading) return <PageLoader />;
  if (employeeQuery.error || !employeeQuery.data) {
    return (
      <div>
        <ErrorAlert message="Employee not found" />
        <Link to="/hr/employees" className="btn btn-outline-secondary mt-3">Back</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Employee"
        subtitle={`${employeeQuery.data.name} (ID: ${employeeId})`}
        actions={<Link to="/hr/employees" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1" />Back</Link>}
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name *</label>
                <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name')} />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email *</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone *</label>
                <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} {...register('phone')} />
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Role *</label>
                <select className="form-select" {...register('role')}>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Department *</label>
                <select className={`form-select ${errors.departmentId ? 'is-invalid' : ''}`} {...register('departmentId')}>
                  <option value={0}>Select</option>
                  {(departmentsQuery.data ?? []).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Base Salary *</label>
                <input type="number" step="0.01" className="form-control" {...register('baseSalary')} />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Bonus</label>
                <input type="number" step="0.01" className="form-control" {...register('bonus')} />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Deduction</label>
                <input type="number" step="0.01" className="form-control" {...register('deduction')} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={!isDirty || isSubmitting || updateEmployee.isPending}>
                Save Changes
              </button>
              <Link to="/hr/employees" className="btn btn-outline-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
