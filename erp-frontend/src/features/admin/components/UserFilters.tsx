import type { UserRole, UserStatus } from '@/types/auth.types';
import { ROLE_LABELS, USER_ROLES } from '@/utils/constants';

export interface UserFilterValues {
  search: string;
  role: UserRole | '';
  status: UserStatus | '';
}

interface UserFiltersProps {
  values: UserFilterValues;
  onChange: (values: UserFilterValues) => void;
  onReset: () => void;
}

const STAFF_ROLES = USER_ROLES.filter((r) => r !== 'EMPLOYEE');

export function UserFilters({ values, onChange, onReset }: UserFiltersProps) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label htmlFor="userSearch" className="form-label small fw-semibold">
              Search
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>
              <input
                id="userSearch"
                type="search"
                className="form-control"
                placeholder="Name, email, or department..."
                value={values.search}
                onChange={(e) => onChange({ ...values, search: e.target.value })}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label htmlFor="roleFilter" className="form-label small fw-semibold">
              Role
            </label>
            <select
              id="roleFilter"
              className="form-select"
              value={values.role}
              onChange={(e) => onChange({ ...values, role: e.target.value as UserRole | '' })}
            >
              <option value="">All Roles</option>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="statusFilter" className="form-label small fw-semibold">
              Status
            </label>
            <select
              id="statusFilter"
              className="form-select"
              value={values.status}
              onChange={(e) => onChange({ ...values, status: e.target.value as UserStatus | '' })}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="button" className="btn btn-outline-secondary w-100" onClick={onReset}>
              <i className="bi bi-arrow-counterclockwise me-1" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
