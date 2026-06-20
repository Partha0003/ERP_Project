import axiosInstance from './axiosInstance';
import type {
  InventoryCategoryDto,
  InventoryDashboardDto,
  ProductDto,
  StockUpdateRequest,
} from '@/types/inventory.types';

export const inventoryApi = {
  getDashboard: async (): Promise<InventoryDashboardDto> => {
    const response = await axiosInstance.get<InventoryDashboardDto>('/api/inventory/dashboard');
    return response.data;
  },

  getProducts: async (search?: string): Promise<ProductDto[]> => {
    const response = await axiosInstance.get<ProductDto[]>('/api/inventory/products', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  getProduct: async (id: number): Promise<ProductDto> => {
    const response = await axiosInstance.get<ProductDto>(`/api/inventory/products/${id}`);
    return response.data;
  },

  createProduct: async (data: Partial<ProductDto>): Promise<ProductDto> => {
    const response = await axiosInstance.post<ProductDto>('/api/inventory/products', data);
    return response.data;
  },

  updateProduct: async (id: number, data: Partial<ProductDto>): Promise<ProductDto> => {
    const response = await axiosInstance.put<ProductDto>(`/api/inventory/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/inventory/products/${id}`);
  },

  updateStock: async (id: number, data: StockUpdateRequest): Promise<ProductDto> => {
    const response = await axiosInstance.put<ProductDto>(`/api/inventory/products/${id}/stock`, data);
    return response.data;
  },

  getCategories: async (): Promise<InventoryCategoryDto[]> => {
    const response = await axiosInstance.get<InventoryCategoryDto[]>('/api/inventory/categories');
    return response.data;
  },

  createCategory: async (data: Partial<InventoryCategoryDto>): Promise<InventoryCategoryDto> => {
    const response = await axiosInstance.post<InventoryCategoryDto>('/api/inventory/categories', data);
    return response.data;
  },
};
