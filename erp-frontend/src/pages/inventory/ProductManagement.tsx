import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory.api';
import { AlertBanner } from '@/features/admin/components/AlertBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader, PageLoader, ErrorAlert } from '@/components/shared/PageHeader';
import { formatCurrency } from '@/utils/roleUtils';
import { getApiErrorMessage } from '@/utils/apiErrors';
import type { ProductDto } from '@/types/inventory.types';

export function ProductManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [form, setForm] = useState({
    name: '', sku: '', categoryId: '', description: '', stockQuantity: '0',
    lowStockThreshold: '10', unitPrice: '0',
  });

  const productsQuery = useQuery({
    queryKey: ['inventory', 'products', search],
    queryFn: () => inventoryApi.getProducts(search || undefined),
  });

  const categoriesQuery = useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: inventoryApi.getCategories,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        sku: form.sku,
        categoryId: Number(form.categoryId),
        description: form.description,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        unitPrice: Number(form.unitPrice),
        active: true,
      };
      if (editing) return inventoryApi.updateProduct(editing.id, payload);
      return inventoryApi.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setAlert({ type: 'success', message: editing ? 'Product updated' : 'Product created' });
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', sku: '', categoryId: '', description: '', stockQuantity: '0', lowStockThreshold: '10', unitPrice: '0' });
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Save failed') }),
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setAlert({ type: 'success', message: 'Product deleted' });
    },
    onError: (err) => setAlert({ type: 'danger', message: getApiErrorMessage(err, 'Delete failed') }),
  });

  const openEdit = (p: ProductDto) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku, categoryId: String(p.categoryId), description: p.description ?? '',
      stockQuantity: String(p.stockQuantity), lowStockThreshold: String(p.lowStockThreshold), unitPrice: String(p.unitPrice),
    });
    setShowForm(true);
  };

  if (productsQuery.isLoading) return <PageLoader />;
  if (productsQuery.error) return <ErrorAlert message="Failed to load products" />;

  const products = productsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage product catalog"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowForm(true); }}>
            Add Product
          </button>
        }
      />

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white fw-semibold">{editing ? 'Edit Product' : 'New Product'}</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">SKU</label>
                <input className="form-control" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select</option>
                  {(categoriesQuery.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Stock</label>
                <input type="number" className="form-control" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Low Stock Threshold</label>
                <input type="number" className="form-control" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Unit Price</label>
                <input type="number" className="form-control" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
              </div>
              <div className="col-md-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-12">
                <button className="btn btn-success me-2" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <input className="form-control" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {products.length === 0 ? (
            <EmptyState title="No products yet" message="Add your first product to get started." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th><th>SKU</th><th>Category</th><th>Stock</th><th>Price</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.categoryName}</td>
                      <td>
                        <span className={`badge ${p.lowStock ? 'bg-warning text-dark' : 'bg-success'}`}>{p.stockQuantity}</span>
                      </td>
                      <td>{formatCurrency(p.unitPrice)}</td>
                      <td>{p.active ? 'Active' : 'Inactive'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMutation.mutate(p.id)}>Delete</button>
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
