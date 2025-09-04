
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  Users,
  Settings,
  UploadCloud,
  Download,
  Trash2,
  MoreHorizontal,
  Loader2,
  FileUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BackupType = 'Full Database' | 'Users Only' | 'Settings Only';
type BackupStatus = 'Completed' | 'Processing' | 'Failed';

interface Backup {
  id: string;
  type: BackupType;
  date: Date;
  size: string;
  status: BackupStatus;
}

const initialBackups: Backup[] = [
  { id: 'backup-1', type: 'Full Database', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), size: '15.2 MB', status: 'Completed' },
  { id: 'backup-2', type: 'Settings Only', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), size: '1.1 MB', status: 'Completed' },
];

export default function BackupRestorePage() {
    const [backups, setBackups] = useState<Backup[]>(initialBackups);
    const [selectedBackupType, setSelectedBackupType] = useState<BackupType>('Full Database');
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const handleCreateBackup = () => {
        setIsCreating(true);
        const newBackup: Backup = {
            id: `backup-${Date.now()}`,
            type: selectedBackupType,
            date: new Date(),
            size: '...',
            status: 'Processing',
        };
        setBackups(prev => [newBackup, ...prev]);

        // Simulate backup process
        setTimeout(() => {
            setBackups(prev => prev.map(b => 
                b.id === newBackup.id 
                ? { ...b, status: 'Completed', size: `${(Math.random() * 20).toFixed(1)} MB` } 
                : b
            ));
            setIsCreating(false);
            toast({
                title: 'Backup Created',
                description: `A new "${selectedBackupType}" backup has been successfully created.`,
            });
        }, 2500);
    };

    const handleDeleteBackup = (id: string) => {
        setBackups(prev => prev.filter(b => b.id !== id));
        toast({ title: "Backup Deleted", description: "The backup has been removed."});
    };

    const getBackupIcon = (type: BackupType) => {
        switch(type) {
            case 'Full Database': return <Database className="h-4 w-4" />;
            case 'Users Only': return <Users className="h-4 w-4" />;
            case 'Settings Only': return <Settings className="h-4 w-4" />;
        }
    }
    
    const getStatusBadge = (status: BackupStatus) => {
        switch(status) {
            case 'Completed': return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
            case 'Processing': return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Processing</Badge>;
            case 'Failed': return <Badge variant="destructive">Failed</Badge>;
        }
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Create, manage, and restore backups of your application data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Backup</CardTitle>
                    <CardDescription>Select the data you want to back up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedBackupType} onValueChange={(val) => setSelectedBackupType(val as BackupType)} className="space-y-2">
                        <Label htmlFor="full" className="flex items-center gap-3 p-3 border rounded-lg has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                            <RadioGroupItem value="Full Database" id="full" />
                            {getBackupIcon('Full Database')}
                            <span>Full Database</span>
                        </Label>
                         <Label htmlFor="users" className="flex items-center gap-3 p-3 border rounded-lg has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                            <RadioGroupItem value="Users Only" id="users" />
                             {getBackupIcon('Users Only')}
                            <span>Users Only</span>
                        </Label>
                         <Label htmlFor="settings" className="flex items-center gap-3 p-3 border rounded-lg has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                            <RadioGroupItem value="Settings Only" id="settings" />
                             {getBackupIcon('Settings Only')}
                            <span>Settings Only</span>
                        </Label>
                    </RadioGroup>
                    <Button className="w-full mt-4" onClick={handleCreateBackup} disabled={isCreating}>
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}
                        Create Backup
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Restore from Backup</CardTitle>
                    <CardDescription>Upload a backup file to restore data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                        <FileUp className="h-10 w-10 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground mb-4">Click to select or drag &amp; drop a file.</p>
                        <Button variant="outline" type="button" onClick={() => toast({ title: "Feature not implemented"})}>
                           <UploadCloud className="mr-2 h-4 w-4" />
                           Select File
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>A log of all previously created backups.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map(backup => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {getBackupIcon(backup.type)}
                        {backup.type}
                      </TableCell>
                      <TableCell>{backup.date.toLocaleString()}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" disabled={backup.status === 'Processing'}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                               <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the backup file.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteBackup(backup.id)}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                   {backups.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No backups found.</TableCell>
                        </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

