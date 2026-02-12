
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
    color: { bg: 'bg-indigo-500/20', text: 'text-indigo-600', border: 'border-indigo-500/40' }
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and transform your images.',
    Icon: ImageIcon,
    color: { bg: 'bg-rose-500/20', text: 'text-rose-600', border: 'border-rose-500/40' }
  },
  {
    id: 'video',
    name: 'Video Tools',
    description: 'Process and edit video content.',
    Icon: Video,
    color: { bg: 'bg-red-500/20', text: 'text-red-600', border: 'border-red-500/40' }
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Process and get insights from your PDF documents.',
    Icon: File,
    color: { bg: 'bg-orange-500/20', text: 'text-orange-600', border: 'border-orange-500/40' }
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines.',
    Icon: Search,
    color: { bg: 'bg-amber-500/20', text: 'text-amber-600', border: 'border-amber-500/40' }
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Utilities to help with your coding projects.',
    Icon: Component,
    color: { bg: 'bg-violet-500/20', text: 'text-violet-600', border: 'border-violet-500/40' }
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Tools',
    description: 'Utilities for your online business.',
    Icon: ShoppingCart,
    color: { bg: 'bg-emerald-500/20', text: 'text-emerald-600', border: 'border-emerald-500/40' }
  },
  {
    id: 'ai',
    name: 'AI Tools',
    description: 'Leverage the power of Artificial Intelligence.',
    Icon: Cpu,
    color: { bg: 'bg-blue-500/20', text: 'text-blue-600', border: 'border-blue-500/40' }
  },
  {
    id: 'calculator',
    name: 'Calculators & Converters',
    description: 'Perform calculations and unit conversions.',
    Icon: Calculator,
     color: { bg: 'bg-cyan-500/20', text: 'text-cyan-600', border: 'border-cyan-500/40' }
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous Tools',
    description: 'A collection of various other tools.',
    Icon: GanttChartSquare,
     color: { bg: 'bg-slate-500/20', text: 'text-slate-600', border: 'border-slate-500/40' }
  }
];
