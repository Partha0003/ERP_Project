import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function StockManagement() {
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const query = useQuery({
    queryKey: ['inventory', 'products'],
    queryFn: () => inventoryApi.getProducts(),
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, operation, quantity }: { id: number; operation: 'ADD' | 'REMOVE' | 'SET'; quantity: number }) =>
      inventoryApi.updateStock(id, { operation, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setAlert({ type: 'success', message: 'Stock updated successfully' });
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Stock update failed') }),
  });

  if (query.isLoading) return <PageLoader />;
  if (query.error) return <ErrorAlert message="Failed to load stock data" />;

  const products = query.data ?? [];

  return (
    <div>
      <PageHeader title="Stock Management" subtitle="Add, remove, or set stock quantities" />
      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {products.length === 0 ? (
            <EmptyState title="No products" message="Create products first to manage stock." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th><th>Current Stock</th><th>Threshold</th><th>Quantity</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.name}
                        {p.lowStock && <span className="badge bg-warning text-dark ms-2">Low</span>}
                      </td>
                      <td>{p.stockQuantity}</td>
                      <td>{p.lowStockThreshold}</td>
                      <td style={{ maxWidth: 120 }}>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min={0}
                          value={quantities[p.id] ?? '1'}
                          onChange={(e) => setQuantities({ ...quantities, [p.id]: e.target.value })}
                        />
                      </td>
                      <td className="text-nowrap">
                        <button className="btn btn-sm btn-success me-1" onClick={() => stockMutation.mutate({ id: p.id, operation: 'ADD', quantity: Number(quantities[p.id] ?? 1) })}>Add</button>
                        <button className="btn btn-sm btn-warning me-1" onClick={() => stockMutation.mutate({ id: p.id, operation: 'REMOVE', quantity: Number(quantities[p.id] ?? 1) })}>Remove</button>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => stockMutation.mutate({ id: p.id, operation: 'SET', quantity: Number(quantities[p.id] ?? 0) })}>Set</button>
                      </td>
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
