
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ListChecks,
  Sparkles,
  LayoutGrid,
  Edit,
  CheckCircle,
  XCircle,
  Star,
  Package,
  Loader2,
  Construction,
  GitCommitVertical,
  FlaskConical,
  Search,
} from 'lucide-react';
import { toolCategories } from '@/lib/constants';
import { type Tool, type ToolCategory } from '@/ai/flows/tool-management.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminToolFiltersProps {
  allTools: Tool[];
}

export function AdminToolFilters({ allTools }: AdminToolFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const searchQuery = searchParams.get('q') || '';
  const activeCategory = (searchParams.get('category') as ToolCategory) || 'all';
  const activeFilter = searchParams.get('filter') || 'all';

  const createQueryString = (params: Record<string, string | null>) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || value === 'all') {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    }
    return currentParams.toString();
  };

  const handleFilterChange = (value: string) => {
    router.push(`/admin/tools?${createQueryString({ filter: value, page: null })}`);
  };

  const handleCategoryChange = (value: string) => {
    router.push(`/admin/tools?${createQueryString({ category: value, page: null })}`);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`/admin/tools?${createQueryString({ q: e.target.value, page: null })}`);
  };
  
  const counts = useMemo(() => ({
    all: allTools.length,
    pro: allTools.filter(t => t.plan === 'Pro').length,
    free: allTools.filter(t => t.plan === 'Free').length,
    new: allTools.filter(t => t.isNew).length,
    active: allTools.filter(t => t.status === 'Active').length,
    disabled: allTools.filter(t => t.status === 'Disabled').length,
    maintenance: allTools.filter(t => t.status === 'Maintenance').length,
    comingSoon: allTools.filter(t => t.status === 'Coming Soon').length,
    newVersion: allTools.filter(t => t.status === 'New Version').length,
    beta: allTools.filter(t => t.status === 'Beta').length,
  }), [allTools]);
  
  const tabs: { id: string; label: string; icon: React.ElementType, count: number }[] = [
    { id: 'all', label: 'All', icon: Package, count: counts.all },
    { id: 'pro', label: 'Pro', icon: Star, count: counts.pro },
    { id: 'free', label: 'Free', icon: Package, count: counts.free },
    { id: 'new', label: 'New', icon: Sparkles, count: counts.new },
    { id: 'active', label: 'Active', icon: CheckCircle, count: counts.active },
    { id: 'beta', label: 'Beta', icon: FlaskConical, count: counts.beta },
    { id: 'newVersion', label: 'New Version', icon: GitCommitVertical, count: counts.newVersion },
    { id: 'comingSoon', label: 'Coming Soon', icon: Sparkles, count: counts.comingSoon },
    { id: 'maintenance', label: 'Maintenance', icon: Construction, count: counts.maintenance },
    { id: 'disabled', label: 'Disabled', icon: XCircle, count: counts.disabled },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 flex-grow">
        {tabs.map((tab) => (
            <Button
                key={tab.id}
                variant={activeFilter === tab.id ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 gap-1.5 px-3"
                onClick={() => handleFilterChange(tab.id)}
            >
                <tab.icon className="h-4 w-4" />
                {tab.label} ({tab.count})
            </Button>
            ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    name="q"
                    defaultValue={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search tools..."
                    className="pl-9 w-full sm:max-w-xs h-10"
                />
            </div>
            <Select value={activeCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            All Categories
                        </div>
                    </SelectItem>
                    {toolCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                            <cat.Icon className="h-4 w-4" />
                            {cat.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}
