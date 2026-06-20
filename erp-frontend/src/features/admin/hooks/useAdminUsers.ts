import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import type { UserRole, UserStatus } from '@/types/auth.types';
import type { UserResponse } from '@/types/user.types';

export interface UserListFilters {
  page: number;
  size: number;
  role: UserRole | '';
  status: UserStatus | '';
  search: string;
}

export function useAdminUsers(filters: UserListFilters) {
  const fetchSize = filters.search.trim() ? 200 : filters.size;

  const query = useQuery({
    queryKey: ['admin', 'users', filters.page, fetchSize, filters.role, filters.status],
    queryFn: () =>
      adminApi.getAllUsers({
        page: filters.search.trim() ? 0 : filters.page,
        size: fetchSize,
        role: filters.role || undefined,
        status: filters.status || undefined,
      }),
  });

  const users = useMemo(() => {
    const list = query.data?.users ?? [];
    const term = filters.search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.department?.toLowerCase().includes(term) ?? false)
    );
  }, [query.data?.users, filters.search]);

  const paginatedUsers = useMemo(() => {
    if (filters.search.trim()) {
      const start = filters.page * filters.size;
      return users.slice(start, start + filters.size);
    }
    return users;
  }, [users, filters.page, filters.size, filters.search]);

  const totalItems = filters.search.trim() ? users.length : (query.data?.totalItems ?? 0);
  const totalPages = filters.search.trim()
    ? Math.max(1, Math.ceil(users.length / filters.size))
    : (query.data?.totalPages ?? 1);

  return {
    ...query,
    users: paginatedUsers,
    totalItems,
    totalPages,
    currentPage: filters.search.trim() ? filters.page : (query.data?.currentPage ?? 0),
  };
}

export function useAdminUser(userId: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async (): Promise<UserResponse> => {
      const response = await adminApi.getAllUsers({ page: 0, size: 500 });
      const user = response.users.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;
    },
    enabled: !!userId && !Number.isNaN(userId),
  });
}
