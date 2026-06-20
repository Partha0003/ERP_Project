import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory.api';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency } from '@/utils/roleUtils';

export function InventoryReports() {
  const dashboardQuery = useQuery({
    queryKey: ['inventory', 'dashboard'],
    queryFn: inventoryApi.getDashboard,
  });

  const productsQuery = useQuery({
    queryKey: ['inventory', 'products'],
    queryFn: () => inventoryApi.getProducts(),
  });

  if (dashboardQuery.isLoading || productsQuery.isLoading) return <PageLoader />;
  if (dashboardQuery.error) return <ErrorAlert message="Failed to load inventory reports" />;

  const dash = dashboardQuery.data!;
  const products = productsQuery.data ?? [];
  const inventoryValue = products.reduce((sum, p) => sum + p.stockQuantity * p.unitPrice, 0);

  return (
    <div>
      <PageHeader title="Inventory Reports" subtitle="Stock summary and valuation" />

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard title="Inventory Value" value={formatCurrency(inventoryValue)} icon="currency-rupee" color="primary" />
        </div>
        <div className="col-md-4">
          <StatCard title="Low Stock Items" value={dash.lowStockCount} icon="exclamation-triangle" color="warning" />
        </div>
        <div className="col-md-4">
          <StatCard title="Total Units" value={dash.totalStockUnits} icon="boxes" color="info" />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold">Stock by Category</div>
        <div className="card-body p-0">
          {products.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr><th>Category</th><th>Products</th><th>Total Stock</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {Object.entries(
                    products.reduce<Record<string, { count: number; stock: number; value: number }>>((acc, p) => {
                      const key = p.categoryName;
                      if (!acc[key]) acc[key] = { count: 0, stock: 0, value: 0 };
                      acc[key].count += 1;
                      acc[key].stock += p.stockQuantity;
                      acc[key].value += p.stockQuantity * p.unitPrice;
                      return acc;
                    }, {})
                  ).map(([cat, stats]) => (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td>{stats.count}</td>
                      <td>{stats.stock}</td>
                      <td>{formatCurrency(stats.value)}</td>
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
