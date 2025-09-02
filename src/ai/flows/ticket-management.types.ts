
import { z } from 'zod';

// Schemas
export const TicketMessageSchema = z.object({
  author: z.enum(['user', 'admin']),
  name: z.string(),
  avatar: z.string().url(),
  text: z.string(),
  timestamp: z.string().datetime({ offset: true }),
  attachments: z.array(z.string().url()).optional(),
});

export const CreateTicketInputSchema = z.object({
  ticketId: z.string(),
  subject: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  message: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  expiresAt: z.string().datetime({ offset: true }),
  attachments: z.array(z.string().url()).optional(),
});

export const TicketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Open', 'In Progress', 'Closed']),
  userId: z.string(),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url(),
  }),
  createdAt: z.string().datetime({ offset: true }),
  lastUpdated: z.string().datetime({ offset: true }),
  expiresAt: z.string().datetime({ offset: true }),
  messages: z.array(TicketMessageSchema),
});

export const AddReplyInputSchema = z.object({
    ticketId: z.string(),
    message: TicketMessageSchema,
});

export const UpdateTicketDetailsInputSchema = z.object({
    ticketId: z.string(),
    status: z.enum(['Open', 'In Progress', 'Closed']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
});


// Types
export type Ticket = z.infer<typeof TicketSchema>;
export type TicketMessage = z.infer<typeof TicketMessageSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;
export type AddReplyInput = z.infer<typeof AddReplyInputSchema>;
export type UpdateTicketDetailsInput = z.infer<typeof UpdateTicketDetailsInputSchema>;
export type TicketStatus = Ticket['status'];
export type TicketPriority = Ticket['priority'];
