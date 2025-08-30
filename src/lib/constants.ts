
import {
  Type,
  File,
  Cpu,
  Component,
  ImageIcon,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolCategory = 'text' | 'pdf' | 'ai' | 'dev' | 'image' | 'seo';

export interface ToolCategoryDetails {
  id: ToolCategory;
  name: string;
  description: string;
  Icon: LucideIcon;
}

export const toolCategories: ToolCategoryDetails[] = [
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Manipulate and analyze text with ease.',
    Icon: Type,
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Process and get insights from your PDF documents.',
    Icon: File,
  },
  {
    id: 'ai',
    name: 'AI Tools',
    description: 'Leverage the power of AI for creative and analytical tasks.',
    Icon: Cpu,
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Utilities to help with your coding projects.',
    Icon: Component,
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and transform your images.',
    Icon: ImageIcon,
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines.',
    Icon: Search,
  },
];
