
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminToolFilters } from './AdminToolFilters';
import { AdminToolTable } from '@/components/tools/AdminToolTable';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  category: string;
  plan: 'Free' | 'Pro';
  isNew: boolean;
  status: 'Active' | 'Disabled' | 'Maintenance' | 'Coming Soon' | 'New Version' | 'Beta';
}

interface AdminToolTableClientProps {
  allTools: Tool[];
  onToolUpdate: () => void;
}

export function AdminToolTableClient({ allTools, onToolUpdate }: AdminToolTableClientProps) {
  const [filteredTools, setFilteredTools] = React.useState(allTools);
  const [currentPage, setCurrentPage] = React.useState(1);
  const router = useRouter();

  const totalPages = Math.ceil(filteredTools.length / 10);
  
  // This effect ensures that if the filtered list shrinks,
  // we don't stay on a page that no longer exists.
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [filteredTools, totalPages, currentPage]);


  const handleRefresh = () => {
    // This is a simple way to trigger a re-fetch of server data in App Router
    router.refresh();
  };

  return (
    <>
      <AdminToolFilters allTools={allTools} setFilteredTools={setFilteredTools} />
      <AdminToolTable
        allTools={allTools}
        filteredTools={filteredTools}
        setFilteredTools={setFilteredTools}
        onToolUpdate={handleRefresh}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </>
  );
}
