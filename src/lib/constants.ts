import {
  Bot,
  BrainCircuit,
  CaseSensitive,
  Code,
  Combine,
  Crop,
  Database,
  FileJson2,
  FileText,
  FlipHorizontal,
  GitBranch,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquareQuote,
  Paintbrush,
  Pilcrow,
  ScanSearch,
  Search,
  Youtube,
  FileUp,
  Type,
  File,
  Cpu,
  MonitorPlay,
  Component,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolCategory = 'text' | 'pdf' | 'ai' | 'dev' | 'image' | 'seo';

export interface ToolCategoryDetails {
  id: ToolCategory;
  name: string;
  description: string;
  Icon: LucideIcon;
}

export interface Tool {
  name: string;
  description: string;
  Icon: LucideIcon;
  slug: string;
  category: ToolCategory;
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

export const tools: Tool[] = [
  // Text Tools
  {
    name: 'Case Converter',
    description: 'Change text to uppercase, lowercase, sentence case, etc.',
    Icon: CaseSensitive,
    slug: 'case-converter',
    category: 'text',
  },
  {
    name: 'Word Counter',
    description: 'Count words, characters, and paragraphs in your text.',
    Icon: Pilcrow,
    slug: 'word-counter',
    category: 'text',
  },
  {
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for your designs.',
    Icon: FileText,
    slug: 'lorem-ipsum-generator',
    category: 'text',
  },
  // PDF Tools
  {
    name: 'PDF Q&A',
    description: 'Ask questions about the content of your PDF file.',
    Icon: MessageSquareQuote,
    slug: 'pdf-q-and-a',
    category: 'pdf',
  },
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document.',
    Icon: Combine,
    slug: 'merge-pdf',
    category: 'pdf',
  },
  // AI Tools
  {
    name: 'AI Writer',
    description: 'Generate articles, blog posts, and more with AI.',
    Icon: Bot,
    slug: 'ai-writer',
    category: 'ai',
  },
  {
    name: 'AI Resume Builder',
    description: 'Create a professional resume with AI assistance.',
    Icon: BrainCircuit,
    slug: 'ai-resume-builder',
    category: 'ai',
  },
  {
    name: 'YouTube Summarizer',
    description: 'Get a concise summary of any YouTube video.',
    Icon: Youtube,
    slug: 'youtube-summarizer',
    category: 'ai',
  },
  {
    name: 'AI Image Generator',
    description: 'Create unique images from text prompts.',
    Icon: Paintbrush,
    slug: 'ai-image-generator',
    category: 'ai',
  },
  // Developer Tools
  {
    name: 'Code Helper',
    description: 'Get help with your code, from snippets to debugging.',
    Icon: Code,
    slug: 'code-helper',
    category: 'dev',
  },
  {
    name: 'JSON Formatter',
    description: 'Format and validate your JSON data.',
    Icon: FileJson2,
    slug: 'json-formatter',
    category: 'dev',
  },
  {
    name: 'SQL Query Builder',
    description: 'Visually build complex SQL queries.',
    Icon: Database,
    slug: 'sql-query-builder',
    category: 'dev',
  },
  // Image Tools
  {
    name: 'Image Converter',
    description: 'Convert images between formats like PNG, JPG, WEBP.',
    Icon: ImageIcon,
    slug: 'image-converter',
    category: 'image',
  },
  {
    name: 'Image Cropper',
    description: 'Crop images to a specific size or aspect ratio.',
    Icon: Crop,
    slug: 'image-cropper',
    category: 'image',
  },
  {
    name: 'Image Flipper',
    description: 'Flip images horizontally or vertically.',
    Icon: FlipHorizontal,
    slug: 'image-flipper',
    category: 'image',
  },
  // SEO Tools
  {
    name: 'Meta Tag Generator',
    description: 'Create SEO-friendly meta tags for your website.',
    Icon: Search,
    slug: 'meta-tag-generator',
    category: 'seo',
  },
  {
    name: 'Keyword Extractor',
    description: 'Extract keywords from a block of text.',
    Icon: ScanSearch,
    slug: 'keyword-extractor',
    category: 'seo',
  },
  {
    name: 'URL Redirect Checker',
    description: 'Check the redirect chain of a URL.',
    Icon: LinkIcon,
    slug: 'url-redirect-checker',
    category: 'seo',
  },
];
