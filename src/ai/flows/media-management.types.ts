import { z } from 'zod';

export const UserMediaSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.enum(['ai-generated', 'community-chat', 'ticket-media']),
    mediaUrl: z.string().url(),
    prompt: z.string().optional(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
});

export type UserMedia = z.infer<typeof UserMediaSchema>;
