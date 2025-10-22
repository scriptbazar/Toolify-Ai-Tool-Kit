
import { z } from 'zod';

export const UpdateUserRoleInputSchema = z.object({
  userId: z.string().describe("The ID of the user to update."),
  newRole: z.enum(['user', 'admin']).describe("The new role to assign to the user."),
});
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleInputSchema>;

export const ReferralStatusSchema = z.enum(['not_joined', 'pending', 'approved', 'rejected']);

export const ReferralRequestSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url().or(z.literal('')),
    requestDate: z.string().datetime(),
    status: z.literal('pending'),
});
export type ReferralRequest = z.infer<typeof ReferralRequestSchema>;

export const AffiliateSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url().or(z.literal('')),
    referrals: z.number().default(0),
    earnings: z.number().default(0),
    status: z.enum(['Active', 'Inactive']).default('Active'),
});
export type Affiliate = z.infer<typeof AffiliateSchema>;
