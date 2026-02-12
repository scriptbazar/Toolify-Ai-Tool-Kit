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
    color: { bg: 'bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500' }
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and transform your images.',
    Icon: ImageIcon,
    color: { bg: 'bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500' }
  },
  {
    id: 'video',
    name: 'Video Tools',
    description: 'Process and edit video content.',
    Icon: Video,
    color: { bg: 'bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-500' }
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Process and get insights from your PDF documents.',
    Icon: File,
    color: { bg: 'bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500' }
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines.',
    Icon: Search,
    color: { bg: 'bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500' }
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Utilities to help with your coding projects.',
    Icon: Component,
    color: { bg: 'bg-violet-500/20', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-500' }
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Tools',
    description: 'Utilities for your online business.',
    Icon: ShoppingCart,
    color: { bg: 'bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500' }
  },
  {
    id: 'ai',
    name: 'AI Tools',
    description: 'Leverage the power of Artificial Intelligence.',
    Icon: Cpu,
    color: { bg: 'bg-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-500' }
  },
  {
    id: 'calculator',
    name: 'Calculators & Converters',
    description: 'Perform calculations and unit conversions.',
    Icon: Calculator,
     color: { bg: 'bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-500' }
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous Tools',
    description: 'A collection of various other tools.',
    Icon: GanttChartSquare,
     color: { bg: 'bg-lime-500/20', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-500' }
  }
];
