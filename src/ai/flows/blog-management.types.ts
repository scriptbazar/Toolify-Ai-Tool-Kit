
import { z } from 'zod';

export const CommentStatusSchema = z.enum(['approved', 'pending', 'rejected']);
export type CommentStatus = z.infer<typeof CommentStatusSchema>;

export const CommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().url(),
  comment: z.string(),
  postId: z.string(),
  postTitle: z.string(),
  submittedOn: z.string().datetime({ offset: true }),
  status: CommentStatusSchema,
});
export type Comment = z.infer<typeof CommentSchema>;
