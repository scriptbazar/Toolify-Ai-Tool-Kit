
import { z } from 'zod';

export const UpdateUserRoleInputSchema = z.object({
  userId: z.string().describe("The ID of the user to update."),
  newRole: z.enum(['user', 'admin']).describe("The new role to assign to the user."),
});

export const AddLeadUserInputSchema = z.object({
  name: z.string().describe("The name of the lead."),
  email: z.string().email().describe("The email of the lead."),
  message: z.string().optional().describe("The initial message from the lead."),
});

export const ReferralStatusSchema = z.enum(['not_joined', 'pending', 'approved', 'rejected']);

export const ReferralRequestSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url().or(z.literal('')),
    requestDate: z.string().datetime(),
    status: z.literal('pending'),
});

export const AffiliateSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url().or(z.literal('')),
    referrals: z.number().default(0),
    earnings: z.number().default(0),
    status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const CommentStatusSchema = z.enum(['approved', 'pending', 'rejected']);

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
