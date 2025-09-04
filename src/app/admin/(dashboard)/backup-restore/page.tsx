
'use client';

import { useState } from 'react';
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
  DialogTrigger,
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatCard } from '@/components/common/StatCard';

type BackupType = 'Full Database' | 'Users Only' | 'Settings Only';
type BackupStatus = 'Completed' | 'Processing' | 'Failed';

interface Backup {
  id: string;
  type: BackupType;
  date: Date;
  size: string;
  status: BackupStatus;
}

const BackupTypeSelector = ({ value, onChange }: { value: BackupType, onChange: (value: BackupType) => void }) => {
  const backupOptions = [
    { value: 'Full Database' as BackupType, icon: Database, label: 'Full Database', description: 'Backup all collections and documents.' },
    { value: 'Users Only' as BackupType, icon: Users, label: 'Users Only', description: 'Backup only the users collection.' },
    { value: 'Settings Only' as BackupType, icon: Settings, label: 'Settings Only', description: 'Backup only the application settings.' },
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
    const [backups, setBackups] = useState<Backup[]>([]);
    const [selectedBackupType, setSelectedBackupType] = useState<BackupType>('Full Database');
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
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
        
        let updatedBackups = [newBackup, ...backups];
        
        // Auto-delete the oldest backup if the count exceeds 5
        if (updatedBackups.length > 5) {
          updatedBackups.pop();
        }

        setBackups(updatedBackups);
        setIsCreateModalOpen(false);

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
    
    const totalStorage = backups.reduce((acc, b) => acc + (parseFloat(b.size) || 0), 0).toFixed(1);
    const lastBackupDate = backups.length > 0 ? backups[0].date.toLocaleDateString() : "N/A";

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
          <StatCard title="Total Storage Used" value={`${totalStorage} MB`} icon={HardDrive} />
          <StatCard title="Last Backup" value={lastBackupDate} icon={CalendarClock} />
          <StatCard title="Next Scheduled Backup" value="Tomorrow" icon={CalendarClock} />
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
                   Upload a backup file to restore your application data. This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <div className="py-6">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <FileUp className="h-12 w-12 text-muted-foreground mb-4"/>
                    <p className="text-lg font-medium mb-1">Click to select or drag & drop a file</p>
                    <p className="text-sm text-muted-foreground">Supported file: .json, .zip</p>
                    <Button variant="outline" type="button" className="mt-4" onClick={() => toast({ title: "Feature not implemented"})}>
                       <UploadCloud className="mr-2 h-4 w-4" />
                       Select File
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
