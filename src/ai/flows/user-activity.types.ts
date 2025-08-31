import { z } from 'zod';

export const UserActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  timestamp: z.string().datetime(),
});

export type UserActivity = z.infer<typeof UserActivitySchema>;
