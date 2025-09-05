
import { z } from 'zod';

export const ToolCategorySchema = z.enum(['text', 'pdf', 'ai', 'dev', 'image', 'seo', 'video', 'ecommerce', 'calculator']);
export type ToolCategory = z.infer<typeof ToolCategorySchema>;

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tool name is required.'),
  description: z.string().min(1, 'Description is required.'),
  icon: z.string().min(1, 'Icon name is required.'), // Storing Lucide icon name as a string
  slug: z.string().min(1, 'Slug is required.'),
  category: ToolCategorySchema,
  plan: z.enum(['Free', 'Pro']).default('Free'),
  isNew: z.boolean().default(false),
  status: z.enum(['Active', 'Disabled']).default('Active'),
  createdAt: z.string().datetime({ offset: true }),
});
export type Tool = z.infer<typeof ToolSchema>;

export const UpsertToolInputSchema = ToolSchema.omit({ id: true, slug: true, createdAt: true });
export type UpsertToolInput = z.infer<typeof UpsertToolInputSchema>;

export const ToolRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  toolName: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  requestedAt: z.string().datetime(),
});
export type ToolRequest = z.infer<typeof ToolRequestSchema>;

    