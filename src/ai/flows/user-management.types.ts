
/**
 * @fileOverview Types and schemas for user management flows.
 */
import { z } from 'zod';

export const UpdateUserRoleInputSchema = z.object({
  userId: z.string().describe("The ID of the user to update."),
  newRole: z.enum(['user', 'admin']).describe("The new role to assign to the user."),
});
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleInputSchema>;

export const AddLeadUserInputSchema = z.object({
  name: z.string().describe("The name of the lead."),
  email: z.string().email().describe("The email of the lead."),
  message: z.string().optional().describe("The initial message from the lead."),
});
export type AddLeadUserInput = z.infer<typeof AddLeadUserInputSchema>;
