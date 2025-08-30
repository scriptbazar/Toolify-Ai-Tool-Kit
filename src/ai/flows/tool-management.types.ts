
import { z } from 'zod';

export const ToolCategorySchema = z.enum(['text', 'pdf', 'ai', 'dev', 'image', 'seo']);
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
});
export type Tool = z.infer<typeof ToolSchema>;

export const UpsertToolInputSchema = ToolSchema.omit({ id: true, slug: true });
export type UpsertToolInput = z.infer<typeof UpsertToolInputSchema>;
