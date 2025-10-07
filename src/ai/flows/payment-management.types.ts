
import { z } from 'zod';

export const PaymentStatusSchema = z.enum(['Completed', 'Pending', 'Failed']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  plan: z.string(),
  amount: z.number(),
  date: z.string().datetime(),
  status: PaymentStatusSchema,
  paymentMethod: z.string(),
});
export type Payment = z.infer<typeof PaymentSchema>;
