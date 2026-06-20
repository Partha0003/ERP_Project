import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import type {
  CreateUserRequest,
  ResetPasswordRequest,
  UpdateUserRequest,
} from '@/types/user.types';

import { getApiErrorMessage } from '@/utils/apiErrors';

export { getApiErrorMessage };

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
  };

  const createUser = useMutation({
    mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
    onSuccess: invalidateUsers,
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateUserRequest }) =>
      adminApi.updateUser(userId, data),
    onSuccess: invalidateUsers,
  });

  const resetPassword = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: ResetPasswordRequest }) =>
      adminApi.resetPassword(userId, data),
  });

  const toggleStatus = useMutation({
    mutationFn: (userId: number) => adminApi.toggleUserStatus(userId),
    onSuccess: invalidateUsers,
  });

  const deleteUser = useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: invalidateUsers,
  });

  return { createUser, updateUser, resetPassword, toggleStatus, deleteUser };
}
