
'use client';

import { useState, useMemo } from 'react';
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
import { type EmailLog } from '@/ai/flows/send-email';
import { Mail, Search, Copy, Eye, Inbox, Send, Ban, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
} from "@/components/ui/dialog";

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

interface AllEmailsClientProps {
    initialEmails: EmailLog[];
}

export function AllEmailsClient({ initialEmails }: AllEmailsClientProps) {
  const [emails, setEmails] = useState<EmailLog[]>(initialEmails);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();
  
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
    <>
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
            {filteredEmails.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No sent emails found.
                </TableCell>
              </TableRow>
            )}
            {filteredEmails.map(email => (
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
    </>
  );
}
