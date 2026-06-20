import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory.api';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency } from '@/utils/roleUtils';

export function InventoryDashboard() {
  const query = useQuery({
    queryKey: ['inventory', 'dashboard'],
    queryFn: inventoryApi.getDashboard,
  });

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load inventory dashboard. Please try again." />;

  const data = query.data!;

  return (
    <div>
      <PageHeader
        title="Inventory Dashboard"
        subtitle="Stock overview and low-stock alerts"
        actions={
          <Link to="/inventory/products" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-lg me-1" />Add Product
          </Link>
        }
      />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Total Products" value={data.totalProducts} icon="box-seam" color="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Active Products" value={data.activeProducts} icon="check-circle" color="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Low Stock Items" value={data.lowStockCount} icon="exclamation-triangle" color="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Total Stock Units" value={data.totalStockUnits} icon="boxes" color="info" />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold d-flex justify-content-between">
          Low Stock Alerts
          <Link to="/inventory/stock" className="btn btn-sm btn-link">Manage stock</Link>
        </div>
        <div className="card-body p-0">
          {data.lowStockProducts.length === 0 ? (
            <EmptyState title="All stock levels are healthy" message="No products below their threshold." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.categoryName}</td>
                      <td><span className="badge bg-warning text-dark">{p.stockQuantity}</span></td>
                      <td>{p.lowStockThreshold}</td>
                      <td>{formatCurrency(p.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
