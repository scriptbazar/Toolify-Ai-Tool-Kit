

import { z } from 'zod';

export const CommentStatusSchema = z.enum(['approved', 'pending', 'rejected']);
export type CommentStatus = z.infer<typeof CommentStatusSchema>;

export const CommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorEmail: z.string().email(),
  authorAvatar: z.string().url(),
  comment: z.string(),
  postId: z.string(),
  postTitle: z.string(),
  submittedOn: z.string().datetime({ offset: true }),
  status: CommentStatusSchema,
});
export type Comment = z.infer<typeof CommentSchema>;


export const PostStatusSchema = z.enum(['Published', 'Draft', 'Scheduled', 'Trash']);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const PostSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  imageHint: z.string().optional(),
  status: PostStatusSchema,
  createdAt: z.string().datetime({ offset: true }),
  publishedAt: z.string().datetime({ offset: true }).optional(),
});
export type Post = z.infer<typeof PostSchema>;
