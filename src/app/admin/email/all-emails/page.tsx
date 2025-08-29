

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getEmailLog, type EmailLog } from '@/ai/flows/send-email';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Search, Copy, AlertCircle, Eye, Inbox, Send, Ban, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';

type EmailStatus = 'sent' | 'opened' | 'failed' | 'blocked';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'opened':
      return <Badge variant="default" className="bg-primary hover:bg-primary/90">Opened</Badge>;
    case 'sent':
      return <Badge variant="secondary">Sent</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'blocked':
      return <Badge variant="destructive" className="bg-red-700 text-white">Blocked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AllEmailsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      try {
        const fetchedEmails = await getEmailLog();
        setEmails(fetchedEmails);
        setError(null);
      } catch (err: any) {
        setError('Failed to load email history. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `Copied: ${text}`,
    });
  };
  
  const counts = useMemo(() => ({
    all: emails.length,
    opened: emails.filter(e => e.status === 'opened').length,
    failed: emails.filter(e => e.status === 'failed').length,
    blocked: emails.filter(e => e.status === 'blocked').length,
  }), [emails]);

  const filteredEmails = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    let filtered = emails;
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(email => email.status === activeTab);
    }
    
    return filtered.filter(email =>
      email.subject.toLowerCase().includes(lowercasedQuery) ||
      email.recipient.toLowerCase().includes(lowercasedQuery)
    );
  }, [emails, searchQuery, activeTab]);

  const tabs = [
    { id: 'all', label: 'All Emails', icon: Mail, count: counts.all },
    { id: 'opened', label: 'Opened', icon: Inbox, count: counts.opened },
    { id: 'failed', label: 'Failed', icon: XCircle, count: counts.failed },
    { id: 'blocked', label: 'Blocked', icon: Ban, count: counts.blocked },
  ];

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">All Sent Emails</h1>
        <p className="text-muted-foreground">
          Browse the history of all sent emails from your system.
        </p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>
            A detailed log of all emails sent from your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
             <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <Button 
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="shrink-0"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject or recipient"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell>
                        </TableRow>
                    ))
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredEmails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No sent emails found.
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredEmails.map(email => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">{email.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {email.recipient}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(email.recipient)}>
                          <Copy className="h-3 w-3" />
                           <span className="sr-only">Copy email</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell>{new Date(email.date).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => { setSelectedEmail(email); setIsPreviewOpen(true); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDesc>
              A preview of the email sent to {selectedEmail?.recipient}.
            </DialogDesc>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="font-medium">Subject: {selectedEmail?.subject}</div>
            <div className="p-4 border rounded-lg bg-muted min-h-[200px]">
              <p>Email content preview is not available in this demo.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
