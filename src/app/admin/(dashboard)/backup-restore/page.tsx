
'use client';

import { useState, useEffect } from 'react';
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
  History,
  HardDrive,
  CalendarClock,
  PlusCircle,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatCard } from '@/components/common/StatCard';
import { createBackup, getBackups, deleteBackup, restoreBackup, type BackupInfo } from '@/ai/flows/backup-restore';

type BackupType = 'all' | 'users' | 'settings';

const BackupTypeSelector = ({ value, onChange }: { value: BackupType, onChange: (value: BackupType) => void }) => {
  const backupOptions = [
    { value: 'all' as BackupType, icon: Database, label: 'Full Database', description: 'Backup all collections and documents.' },
    { value: 'users' as BackupType, icon: Users, label: 'Users Only', description: 'Backup only the users collection.' },
    { value: 'settings' as BackupType, icon: Settings, label: 'Settings Only', description: 'Backup only the application settings.' },
  ];

  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {backupOptions.map(option => (
            <Label key={option.value} htmlFor={option.value} className="flex flex-col items-center justify-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                 <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                 <option.icon className="h-8 w-8 text-primary" />
                 <span className="font-semibold">{option.label}</span>
                 <p className="text-xs text-muted-foreground text-center">{option.description}</p>
            </Label>
        ))}
    </RadioGroup>
  )
}

export default function BackupRestorePage() {
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [selectedBackupType, setSelectedBackupType] = useState<BackupType>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchBackups = async () => {
        setIsLoading(true);
        try {
            const backupList = await getBackups();
            setBackups(backupList);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Could not fetch backup history.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            const result = await createBackup(selectedBackupType);
            if (result.success) {
                toast({
                    title: 'Backup Started',
                    description: 'The database backup process has been initiated. It may take a few minutes to complete.',
                });
                setTimeout(fetchBackups, 3000); // Re-fetch after a short delay
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({ title: 'Error', description: error.message || 'Could not start backup process.', variant: 'destructive'});
        } finally {
            setIsCreating(false);
            setIsCreateModalOpen(false);
        }
    };

    const handleDeleteBackup = async (backupId: string) => {
        setIsDeleting(backupId);
        try {
            const result = await deleteBackup(backupId);
            if (result.success) {
                toast({ title: "Backup Deleted", description: "The backup has been successfully removed."});
                setBackups(prev => prev.filter(b => b.id !== backupId));
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Could not delete the backup.', variant: 'destructive'});
        } finally {
            setIsDeleting(null);
        }
    };

    const handleRestoreBackup = async (backupId: string) => {
        try {
            const result = await restoreBackup(backupId);
            if (result.success) {
                toast({ title: 'Restore Started', description: 'Database restore process initiated. This may take several minutes.' });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({ title: 'Restore Error', description: error.message || 'Could not start restore process.', variant: 'destructive'});
        }
    };

    const getBackupIcon = (type: string) => {
        if (type.includes('users')) return <Users className="h-4 w-4" />;
        if (type.includes('settings')) return <Settings className="h-4 w-4" />;
        return <Database className="h-4 w-4" />;
    }
    
    const lastBackupDate = backups.length > 0 ? new Date(backups[0].updated).toLocaleDateString() : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground">
            Create, manage, and restore backups of your application data.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => setIsRestoreModalOpen(true)}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Restore Backup
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Backup
            </Button>
        </div>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Backups" value={backups.length.toString()} icon={History} />
          <StatCard title="Total Storage Used" value="N/A" icon={HardDrive} />
          <StatCard title="Last Backup" value={lastBackupDate} icon={CalendarClock} />
          <Button variant="outline" className="h-full" onClick={fetchBackups} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh List
          </Button>
        </div>

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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}><div className="h-8 bg-muted animate-pulse rounded-md" /></TableCell>
                  </TableRow>
              ))}
              {!isLoading && backups.map(backup => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getBackupIcon(backup.id)}
                    <span className="capitalize">{backup.id.split('_').slice(0, -1).join(' ')}</span>
                  </TableCell>
                  <TableCell>{new Date(backup.updated).toLocaleString()}</TableCell>
                  <TableCell><Badge>Completed</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" disabled={isDeleting === backup.id}>
                           {isDeleting === backup.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                           <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <UploadCloud className="mr-2 h-4 w-4 text-green-500" /> Restore
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Restore Database?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will overwrite your entire current database with the selected backup. This action cannot be undone. Are you sure you want to proceed?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRestoreBackup(backup.id)}>
                                        Restore
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
               {!isLoading && backups.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No backups found.</TableCell>
                    </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogDescription>
                    Select the type of data you want to back up. The process will run in the background.
                </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <BackupTypeSelector value={selectedBackupType} onChange={setSelectedBackupType} />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreateBackup} disabled={isCreating}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}
                    Start Backup
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Restore from Backup</DialogTitle>
                <DialogDescription>
                   This feature is under development. In a real application, you would upload a backup file here.
                </DialogDescription>
            </DialogHeader>
            <div className="py-6">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <FileUp className="h-12 w-12 text-muted-foreground mb-4"/>
                    <p className="text-lg font-medium mb-1">Feature Coming Soon</p>
                    <p className="text-sm text-muted-foreground">Manual restore from file is not yet implemented.</p>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
