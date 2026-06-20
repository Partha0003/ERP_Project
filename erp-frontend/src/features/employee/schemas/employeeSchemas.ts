import { z } from 'zod';

const today = new Date().toISOString().split('T')[0];

export const leaveRequestSchema = z
  .object({
    leaveType: z.string().min(1, 'Leave type is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
  })
  .refine((data) => data.startDate >= today, {
    message: 'Start date cannot be in the past',
    path: ['startDate'],
  })
  .refine((data) => data.endDate >= today, {
    message: 'End date cannot be in the past',
    path: ['endDate'],
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export interface LeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}
