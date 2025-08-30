

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Database,
  Users,
  Settings,
  UploadCloud,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function BackupRestorePage() {
    const { toast } = useToast();

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
    </div>
  );
}
