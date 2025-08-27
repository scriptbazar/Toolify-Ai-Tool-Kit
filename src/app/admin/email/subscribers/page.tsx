
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
import { Users, UserPlus, User, Download, Search, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type EmailData = {
  email: string;
  source: string;
  date: string;
};

type FilterType = 'all' | 'Signup' | 'Lead';

export default function SubscribersPage() {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      try {
        const fetchedEmails = await getAllEmails();
        setEmails(fetchedEmails);
        setError(null);
      } catch (err: any) {
        setError('Failed to load subscribers. Please try again later.');
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
      title: 'Copied!',
      description: 'Email address copied to clipboard.',
    });
  };

  const filteredEmails = useMemo(() => {
    return emails
      .filter(email => {
        if (activeFilter === 'all') return true;
        return email.source === activeFilter;
      })
      .filter(email =>
        email.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [emails, searchQuery, activeFilter]);

  const counts = useMemo(() => ({
    all: emails.length,
    direct: emails.filter(e => e.source === 'Signup').length,
    lead: emails.filter(e => e.source === 'Lead').length,
  }), [emails]);

  const handleExport = () => {
    toast({
      title: "Coming Soon!",
      description: "CSV export functionality will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
          <CardDescription>
            A complete list of all registered users and leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button 
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
                >
                <Users className="mr-2 h-4 w-4" />
                All Subscribers ({counts.all})
              </Button>
               <Button 
                variant={activeFilter === 'Signup' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('Signup')}
                >
                <UserPlus className="mr-2 h-4 w-4" />
                Direct Subscribers ({counts.direct})
              </Button>
               <Button 
                variant={activeFilter === 'Lead' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('Lead')}
                >
                <User className="mr-2 h-4 w-4" />
                Lead Subscribers ({counts.lead})
              </Button>
            </div>
             <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Loading subscribers...
                    </TableCell>
                  </TableRow>
                )}
                {error && (
                   <TableRow>
                    <TableCell colSpan={3}>
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
                    <TableCell colSpan={3} className="text-center">
                      No subscribers found for the current filter.
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredEmails.map(email => (
                  <TableRow key={email.email}>
                    <TableCell className="font-medium">
                       <div className="flex items-center gap-2">
                        {email.email}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(email.email)}>
                          <Copy className="h-3 w-3" />
                           <span className="sr-only">Copy email</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={email.source === 'Signup' ? 'default' : 'secondary'}>
                        {email.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(email.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
