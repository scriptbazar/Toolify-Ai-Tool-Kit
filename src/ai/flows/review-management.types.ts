import { z } from 'zod';

export const ReviewStatusSchema = z.enum(['approved', 'pending', 'rejected']);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const ReviewSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().url(),
  comment: z.string(),
  toolId: z.string(),
  rating: z.number().min(1).max(5),
  submittedOn: z.string().datetime({ offset: true }),
  status: ReviewStatusSchema,
});
export type Review = z.infer<typeof ReviewSchema>;
