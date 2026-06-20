export function DemoCredentials() {
  return (
    <div className="card border-0 bg-light mt-3">
      <div className="card-body py-3 px-3">
        <p className="small fw-semibold mb-2 mb-1">Demo accounts (password: <code>Admin@123</code>)</p>
        <ul className="small text-muted mb-0 ps-3">
          <li>Admin — <code>admin@erp.com</code></li>
          <li>HR — <code>hr@erp.com</code></li>
          <li>Finance — <code>finance@erp.com</code></li>
          <li>Inventory — <code>inventory@erp.com</code></li>
          <li>Employee — <code>employee1@erp.com</code> … <code>employee10@erp.com</code></li>
        </ul>
      </div>
    </div>
  );
}
