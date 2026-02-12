
import {
  Type,
  File,
  Cpu,
  Component,
  ImageIcon,
  Search,
  Video,
  Calculator,
  ShoppingCart,
  GanttChartSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolCategory = 'text' | 'pdf' | 'ai' | 'dev' | 'image' | 'seo' | 'video' | 'ecommerce' | 'calculator' | 'miscellaneous';

export interface ToolCategoryDetails {
  id: ToolCategory;
  name: string;
  description: string;
  Icon: LucideIcon;
  color: {
      bg: string;
      text: string;
      border: string;
  }
}

export const toolCategories: ToolCategoryDetails[] = [
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Manipulate and analyze text with ease.',
    Icon: Type,
    color: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' }
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and transform your images.',
    Icon: ImageIcon,
    color: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' }
  },
  {
    id: 'video',
    name: 'Video Tools',
    description: 'Process and edit video content.',
    Icon: Video,
    color: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' }
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Process and get insights from your PDF documents.',
    Icon: File,
    color: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' }
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines.',
    Icon: Search,
    color: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' }
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Utilities to help with your coding projects.',
    Icon: Component,
    color: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20' }
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Tools',
    description: 'Utilities for your online business.',
    Icon: ShoppingCart,
    color: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' }
  },
  {
    id: 'ai',
    name: 'AI Tools',
    description: 'Leverage the power of Artificial Intelligence.',
    Icon: Cpu,
    color: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' }
  },
  {
    id: 'calculator',
    name: 'Calculators & Converters',
    description: 'Perform calculations and unit conversions.',
    Icon: Calculator,
     color: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' }
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous Tools',
    description: 'A collection of various other tools.',
    Icon: GanttChartSquare,
     color: { bg: 'bg-lime-500/10', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-500/20' }
  }
];
