
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
import { Edit, CheckCircle, XCircle, Star, Sparkles, Construction, GitCommitVertical, FlaskConical, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EditToolForm } from '@/app/admin/tools/[id]/EditToolForm';
import { upsertTool, deleteTool } from '@/ai/flows/tool-management';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


interface AdminToolTableProps {
  tools: Tool[];
  onToolUpdate: () => void;
}

export function AdminToolTable({ tools, onToolUpdate }: AdminToolTableProps) {
  const router = useRouter();
  const [editingTool, setEditingTool] = React.useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();

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
    setEditingTool(tool);
    setIsModalOpen(true);
  };
  
  const handleSave = async (data: any) => {
    const toolData = {
      id: editingTool?.id,
      slug: editingTool?.slug,
      ...data,
    };
    const result = await upsertTool(toolData);
    if (result.success) {
      toast({
        title: 'Tool updated successfully!',
        description: `The tool "${data.name}" has been saved.`,
      });
      setIsModalOpen(false);
      onToolUpdate(); // Refresh the list
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    return result.success;
  };
  
  const handleDelete = async (toolId: string) => {
    const result = await deleteTool(toolId);
    if (result.success) {
        toast({ title: 'Tool Deleted', description: result.message });
        setIsModalOpen(false);
        onToolUpdate();
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };


  return (
    <>
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
     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
            <DialogDescription>
              Modify the details for "{editingTool?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
             <EditToolForm tool={editingTool} onSave={handleSave} />
          </div>
           {editingTool && (
              <DialogFooter className="pt-4 border-t">
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Tool
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the tool and its associated data.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(editingTool.id)}>
                                  Yes, delete this tool
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
