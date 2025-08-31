
import { z } from 'zod';

export const UserActivityTypeSchema = z.enum([
  'tool_usage',
  'page_view',
  'blog_view',
  'login',
  'logout',
  'account_update'
]);
export type UserActivityType = z.infer<typeof UserActivityTypeSchema>;

export const UserActivityDetailsSchema = z.object({
  name: z.string(),
  path: z.string().optional(),
});
export type UserActivityDetails = z.infer<typeof UserActivityDetailsSchema>;

export const UserActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: UserActivityTypeSchema,
  details: UserActivityDetailsSchema,
  timestamp: z.string().datetime(),
});

export type UserActivity = z.infer<typeof UserActivitySchema>;
