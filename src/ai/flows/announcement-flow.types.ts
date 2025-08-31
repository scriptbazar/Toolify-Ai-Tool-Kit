
import { z } from 'zod';

export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  featureSlug: z.string().optional(),
  isNew: z.boolean(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;
