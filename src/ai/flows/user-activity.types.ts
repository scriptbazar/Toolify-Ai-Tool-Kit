
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


export const UserLoginHistorySchema = z.object({
    id: z.string(),
    timestamp: z.string().datetime(),
    ipAddress: z.string(),
    userAgent: z.string(),
    location: z.string(),
    status: z.enum(['Success', 'Failed']),
});
export type UserLoginHistory = z.infer<typeof UserLoginHistorySchema>;


export const UserMediaSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
    mediaUrl: z.string().url(),
    prompt: z.string().optional(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
});
export type UserMedia = z.infer<typeof UserMediaSchema>;
