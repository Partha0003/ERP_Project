export interface InventoryCategoryDto {
  id: number;
  name: string;
  description?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  categoryName: string;
  description?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  unitPrice: number;
  active: boolean;
  lowStock?: boolean;
}

export interface InventoryDashboardDto {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalStockUnits: number;
  lowStockProducts: ProductDto[];
}

export interface StockUpdateRequest {
  quantity: number;
  operation: 'ADD' | 'REMOVE' | 'SET';
}
