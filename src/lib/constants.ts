

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
}

export const toolCategories: ToolCategoryDetails[] = [
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Manipulate and analyze text with ease.',
    Icon: Type,
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Edit and transform your images.',
    Icon: ImageIcon,
  },
  {
    id: 'video',
    name: 'Video Tools',
    description: 'Process and edit video content.',
    Icon: Video,
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Process and get insights from your PDF documents.',
    Icon: File,
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines.',
    Icon: Search,
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Utilities to help with your coding projects.',
    Icon: Component,
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Tools',
    description: 'Utilities for your online business.',
    Icon: ShoppingCart,
  },
  {
    id: 'calculator',
    name: 'Calculators & Converters',
    description: 'Perform calculations and unit conversions.',
    Icon: Calculator,
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous Tools',
    description: 'A collection of various other tools.',
    Icon: GanttChartSquare,
  }
];
