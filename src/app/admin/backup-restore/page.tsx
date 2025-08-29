
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Database,
  Users,
  Settings,
  ShieldCheck,
  UploadCloud,
  Download,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  HardDrive,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BackupItem = {
    id: string;
    date: string;
    type: string;
    size: string;
    status: 'Completed' | 'Failed' | 'In Progress';
};

const initialBackups: BackupItem[] = [
    { id: 'bkp_1', date: '2024-07-30 10:00 AM', type: 'Full Database', size: '25.5 MB', status: 'Completed' },
    { id: 'bkp_2', date: '2024-07-29 02:00 PM', type: 'Users Data', size: '5.2 MB', status: 'Completed' },
    { id: 'bkp_3', date: '2024-07-28 09:30 AM', type: 'Settings', size: '1.1 MB', status: 'Failed' },
    { id: 'bkp_4', date: '2024-07-27 11:00 PM', type: 'Full Database', size: '24.9 MB', status: 'Completed' },
];

const getStatusBadge = (status: BackupItem['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Completed</Badge>;
      case 'In Progress':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3"/>In Progress</Badge>;
      case 'Failed':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Failed</Badge>;
    }
};

export default function BackupRestorePage() {
    const { toast } = useToast();
    const [backups, setBackups] = useState(initialBackups);

    const handleCreateBackup = (type: string) => {
        toast({
            title: 'Backup Initiated',
            description: `A new "${type}" backup is being created. This may take a few moments.`,
        });
        // In a real app, this would trigger a server-side process
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Create, manage, and restore backups of your application data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Database className="h-5 w-5"/>Full Database</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Backup all collections and documents from Firestore.</p>
                <Button className="w-full" onClick={() => handleCreateBackup('Full Database')}>Create Backup</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Users className="h-5 w-5"/>Users Data</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Backup only the 'users' and 'leads' collections.</p>
                 <Button className="w-full" onClick={() => handleCreateBackup('Users Data')}>Create Backup</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Settings className="h-5 w-5"/>Settings Data</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Backup all application settings configurations.</p>
                 <Button className="w-full" onClick={() => handleCreateBackup('Settings')}>Create Backup</Button>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><UploadCloud className="h-5 w-5"/>Restore from File</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Restore data from a previously downloaded backup file.</p>
                 <Button variant="outline" className="w-full" onClick={() => toast({ title: 'Feature coming soon!'})}>Upload Backup</Button>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>A log of all past and current backup operations.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                    <TableRow key={backup.id}>
                        <TableCell className="font-mono text-xs">{backup.id}</TableCell>
                        <TableCell>{backup.date}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {backup.type === 'Full Database' && <Database className="h-4 w-4 text-muted-foreground"/>}
                                {backup.type === 'Users Data' && <Users className="h-4 w-4 text-muted-foreground"/>}
                                {backup.type === 'Settings' && <Settings className="h-4 w-4 text-muted-foreground"/>}
                                <span>{backup.type}</span>
                            </div>
                        </TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>{getStatusBadge(backup.status)}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem disabled={backup.status !== 'Completed'}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                {backups.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No backup history found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
