

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
import { getAllEmails } from '@/ai/flows/user-management';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Search, Copy, AlertCircle, Eye, Inbox, Send, Ban, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type EmailData = {
  email: string;
  source: string;
  date: string;
};

// Dummy data structure for the sent email log view
const sentEmails = [
  { subject: 'Your Password Reset', recipient: 'user2@example.com', status: 'sent', date: 'July 28th, 2024 4:30 PM' },
  { subject: 'Welcome to ToolifyAI!', recipient: 'user1@example.com', status: 'opened', date: 'July 28th, 2024 3:30 PM' },
  { subject: 'New Feature Announcement', recipient: 'user3@example.com', status: 'failed', date: 'July 27th, 2024 2:30 PM' },
  { subject: 'Your Weekly Digest', recipient: 'user4@example.com', status: 'opened', date: 'July 26th, 2024 7:30 PM' },
  { subject: 'Security Alert', recipient: 'user5@example.com', status: 'blocked', date: 'July 26th, 2024 12:00 AM' },
];

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
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      try {
        const fetchedEmails = await getAllEmails();
        setEmails(fetchedEmails);
        setError(null);
      } catch (err: any) {
        setError('Failed to load emails. Please try again later.');
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
  
  const filteredEmails = useMemo(() => {
    return emails.filter(email =>
      email.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [emails, searchQuery]);

  const filteredSentEmails = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    let filtered = sentEmails;
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(email => email.status === activeTab);
    }
    
    return filtered.filter(email =>
      email.subject.toLowerCase().includes(lowercasedQuery) ||
      email.recipient.toLowerCase().includes(lowercasedQuery)
    );
  }, [sentEmails, searchQuery, activeTab]);

  const tabs = [
    { id: 'all', label: 'All Emails', icon: Mail, count: sentEmails.length },
    { id: 'opened', label: 'Opened', icon: Inbox, count: sentEmails.filter(e => e.status === 'opened').length },
    { id: 'failed', label: 'Failed', icon: XCircle, count: sentEmails.filter(e => e.status === 'failed').length },
    { id: 'blocked', label: 'Blocked', icon: Ban, count: sentEmails.filter(e => e.status === 'blocked').length },
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
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
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
                {!loading && !error && filteredSentEmails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No sent emails found.
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredSentEmails.map(email => (
                  <TableRow key={email.recipient + email.subject}>
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
                    <TableCell>{email.date}</TableCell>
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
            <DialogDescription>
              A preview of the email sent to {selectedEmail?.recipient}.
            </DialogDescription>
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
