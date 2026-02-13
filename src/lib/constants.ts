
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
      glow: string;
      gradient: string;
  }
}

export const toolCategories: ToolCategoryDetails[] = [
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Manipulate and analyze text with ease.',
    Icon: Type,
    color: { 
      bg: 'bg-blue-500/15', 
      text: 'text-blue-600', 
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/40',
      gradient: 'from-blue-500 to-cyan-400'
    }
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and transform your images.',
    Icon: ImageIcon,
    color: { 
      bg: 'bg-rose-500/15', 
      text: 'text-rose-600', 
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/40',
      gradient: 'from-rose-500 to-pink-400'
    }
  },
  {
    id: 'video',
    name: 'Video Tools',
    description: 'Process and edit video content.',
    Icon: Video,
    color: { 
      bg: 'bg-red-500/15', 
      text: 'text-red-600', 
      border: 'border-red-500/30',
      glow: 'shadow-red-500/40',
      gradient: 'from-red-600 to-orange-500'
    }
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Process and get insights from your PDF documents.',
    Icon: File,
    color: { 
      bg: 'bg-orange-500/15', 
      text: 'text-orange-600', 
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/40',
      gradient: 'from-orange-500 to-yellow-400'
    }
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines.',
    Icon: Search,
    color: { 
      bg: 'bg-amber-500/15', 
      text: 'text-amber-600', 
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/40',
      gradient: 'from-amber-500 to-yellow-500'
    }
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Utilities to help with your coding projects.',
    Icon: Component,
    color: { 
      bg: 'bg-violet-500/15', 
      text: 'text-violet-600', 
      border: 'border-violet-500/30',
      glow: 'shadow-violet-500/40',
      gradient: 'from-violet-600 to-indigo-500'
    }
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Tools',
    description: 'Utilities for your online business.',
    Icon: ShoppingCart,
    color: { 
      bg: 'bg-emerald-500/15', 
      text: 'text-emerald-600', 
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/40',
      gradient: 'from-emerald-500 to-teal-400'
    }
  },
  {
    id: 'ai',
    name: 'AI Tools',
    description: 'Leverage the power of Artificial Intelligence.',
    Icon: Cpu,
    color: { 
      bg: 'bg-cyan-500/15', 
      text: 'text-cyan-600', 
      border: 'border-cyan-500/30',
      glow: 'shadow-cyan-500/40',
      gradient: 'from-cyan-500 to-blue-400'
    }
  },
  {
    id: 'calculator',
    name: 'Calculators',
    description: 'Perform complex calculations instantly.',
    Icon: Calculator,
     color: { 
       bg: 'bg-indigo-500/15', 
       text: 'text-indigo-600', 
       border: 'border-indigo-500/30',
       glow: 'shadow-indigo-500/40',
       gradient: 'from-indigo-600 to-purple-500'
     }
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    description: 'A collection of various other tools.',
    Icon: GanttChartSquare,
     color: { 
       bg: 'bg-lime-500/15', 
       text: 'text-lime-600', 
       border: 'border-lime-500/30',
       glow: 'shadow-lime-500/40',
       gradient: 'from-lime-500 to-green-400'
     }
  }
];
