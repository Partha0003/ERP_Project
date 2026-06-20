import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/api/attendance.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { PageHeader } from '@/components/shared/PageHeader';

export function EmployeeProfile() {
  const { employeeId, email, setEmployeeId } = useAuth();
  const [inputId, setInputId] = useState(employeeId?.toString() ?? '');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [validating, setValidating] = useState(false);

  const handleSave = async () => {
    const id = Number(inputId);
    if (!id || id <= 0) {
      setAlert({ type: 'danger', message: 'Enter a valid employee ID' });
      return;
    }
    setValidating(true);
    setAlert(null);
    try {
      await attendanceApi.getMonthlySummary(id, new Date().getMonth() + 1, new Date().getFullYear());
      setEmployeeId(id);
      setAlert({ type: 'success', message: `Employee ID ${id} linked successfully` });
    } catch {
      setAlert({ type: 'danger', message: 'Could not verify employee ID. Contact HR for your correct ID.' });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile Setup" subtitle="Link your employee record for attendance and leave features" />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 480 }}>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label text-muted small">Logged in as</label>
            <div className="fw-semibold">{email}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="employeeId" className="form-label fw-semibold">Employee ID</label>
            <input
              id="employeeId"
              type="number"
              className="form-control"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Provided by HR when your account was created"
            />
          </div>
          <button className="btn btn-primary" disabled={validating} onClick={handleSave}>
            {validating ? 'Validating...' : 'Save Employee ID'}
          </button>
          {employeeId && (
            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted">Linked ID:</small>
              <div className="fw-bold">{employeeId}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
