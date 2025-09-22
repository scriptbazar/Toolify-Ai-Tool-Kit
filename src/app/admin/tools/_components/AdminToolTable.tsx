
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Tool } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import * as Icons from 'lucide-react';
import { Edit, CheckCircle, XCircle, Star, Sparkles, Construction, GitCommitVertical, FlaskConical } from 'lucide-react';

interface AdminToolTableProps {
  tools: Tool[];
}

export function AdminToolTable({ tools }: AdminToolTableProps) {
  const router = useRouter();

  const getCategoryName = (categoryId: string) => {
    return toolCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
        case 'Active': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Active</Badge>;
        case 'Disabled': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Disabled</Badge>;
        case 'Maintenance': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Construction className="mr-1 h-3 w-3"/>Maintenance</Badge>;
        case 'Coming Soon': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white"><Sparkles className="mr-1 h-3 w-3"/>Coming Soon</Badge>;
        case 'New Version': return <Badge className="bg-green-500 hover:bg-green-600"><GitCommitVertical className="mr-1 h-3 w-3"/>New Version</Badge>;
        case 'Beta': return <Badge className="bg-orange-500 hover:bg-orange-600"><FlaskConical className="mr-1 h-3 w-3"/>Beta</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }
  
  const handleEditClick = (tool: Tool) => {
    router.push(`/admin/tools/${tool.slug}`);
  };

  return (
    <div className="overflow-x-auto mt-6">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {tools.map(tool => {
                const IconComponent = (Icons as any)[tool.icon] || Icons.HelpCircle;
                return (
                <TableRow key={tool.id}>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <span>{tool.name}</span>
                        {tool.isNew && <Badge variant="outline" className="text-primary border-primary">New</Badge>}
                    </div>
                    </TableCell>
                    <TableCell>{getCategoryName(tool.category)}</TableCell>
                    <TableCell>
                    <Badge variant={tool.plan === 'Pro' ? 'secondary' : 'outline'}>{tool.plan}</Badge>
                    </TableCell>
                    <TableCell>
                    {getStatusBadge(tool.status)}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(tool)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </TableCell>
                </TableRow>
                )
            })}
            {tools.length === 0 && (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No tools found for the current selection.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  );
}
