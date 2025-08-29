
'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Inbox,
  CircleDotDashed,
  RefreshCw,
  CheckCircle,
  Search,
  Paperclip,
  Send,
  Loader2,
  Save,
  User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTickets, addTicketReply, updateTicketDetails, type Ticket, type TicketMessage, TicketPriority, TicketStatus } from '@/ai/flows/ticket-management';
import { Skeleton } from '@/components/ui/skeleton';


const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return <Badge variant="destructive">Open</Badge>;
      case 'In Progress':
        return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">In Progress</Badge>;
      case 'Closed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Closed</Badge>;
    }
};

const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
    }
};


export default function TicketManagementPage() {
  const [activeFilter, setActiveFilter] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    try {
        const fetchedTickets = await getTickets();
        setTickets(fetchedTickets);
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
        toast({ title: 'Error', description: 'Could not load tickets.', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  const tabs: { id: TicketStatus | 'all'; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'Open', label: 'Open', icon: CircleDotDashed },
    { id: 'In Progress', label: 'In Progress', icon: RefreshCw },
    { id: 'Closed', label: 'Closed', icon: CheckCircle },
  ];
  
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
        const filterMatch = activeFilter === 'all' || ticket.status === activeFilter;
        const searchMatch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return filterMatch && searchMatch;
    });
  }, [tickets, activeFilter, searchQuery]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsReplying(true);
    try {
        const newReply: TicketMessage = {
            author: 'admin',
            name: 'Admin',
            avatar: 'https://i.pravatar.cc/150?u=admin',
            text: replyText,
            timestamp: new Date().toISOString(),
        };

        await addTicketReply({ ticketId: selectedTicket.id, message: newReply });
        
        const updatedTicket = { ...selectedTicket, messages: [...selectedTicket.messages, newReply] };

        // If ticket is open, move it to in-progress
        if (updatedTicket.status === 'Open') {
          updatedTicket.status = 'In Progress';
          await handleTicketUpdate(updatedTicket.id, 'status', 'In Progress');
        }

        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setReplyText('');
        toast({ title: 'Reply Sent!', description: 'Your reply has been added to the ticket.' });
    } catch (error: any) {
         toast({ title: 'Error Sending Reply', description: error.message, variant: 'destructive' });
    } finally {
        setIsReplying(false);
    }
  };
  
  const handleTicketUpdate = async (ticketId: string, field: 'status' | 'priority', value: TicketStatus | TicketPriority) => {
    const originalTickets = [...tickets];
    const updatedTickets = tickets.map(t => t.id === ticketId ? {...t, [field]: value} : t);
    setTickets(updatedTickets);

    if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? {...prev, [field]: value} : null);
    }

    try {
        await updateTicketDetails({ ticketId, [field]: value });
        toast({ title: 'Ticket Updated', description: 'Changes have been saved.' });
    } catch (error: any) {
        setTickets(originalTickets); // Revert on error
        toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
        <p className="text-muted-foreground">
          View, manage, and respond to all user support tickets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            Here are all the support tickets from your users. Tickets are automatically deleted after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeFilter === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(tab.id)}
                  className="shrink-0"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label} ({tickets.filter(t => tab.id === 'all' || t.status === tab.id).length})
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                  </TableRow>
                ))}
                {!loading && filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                            <TableCell>
                                <div>{ticket.user.name}</div>
                                <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>{new Date(ticket.lastUpdated).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                               <Dialog onOpenChange={(open) => !open && setSelectedTicket(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" onClick={() => setSelectedTicket(ticket)}>View/Reply</Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                                    {selectedTicket && (
                                       <>
                                        <DialogHeader className="p-6 pb-0">
                                            <DialogTitle className="flex items-center gap-2">
                                                <span className="text-muted-foreground">[{selectedTicket.id}]</span> 
                                                {selectedTicket.subject}
                                            </DialogTitle>
                                            <DialogDescription>
                                                Opened by {selectedTicket.user.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-4 overflow-y-hidden">
                                            <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
                                              <Card className="flex-1 flex flex-col">
                                                  <CardHeader>
                                                      <CardTitle>Conversation</CardTitle>
                                                  </CardHeader>
                                                  <ScrollArea className="flex-grow px-6">
                                                      <CardContent className="space-y-6">
                                                          {selectedTicket.messages.map((message, index) => (
                                                          <div key={index} className={cn("flex items-start gap-4", message.author === 'admin' && 'flex-row-reverse')}>
                                                              <Avatar>
                                                                  <AvatarImage src={message.avatar} alt={message.name} />
                                                                  <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
                                                              </Avatar>
                                                              <div className={cn("rounded-lg p-4 max-w-xl", message.author === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                                                  <p className="text-xs text-right mt-2 opacity-70">{new Date(message.timestamp).toLocaleString()}</p>
                                                              </div>
                                                          </div>
                                                          ))}
                                                      </CardContent>
                                                  </ScrollArea>
                                              </Card>
                                            </div>
                                            <div className="lg:col-span-1 flex flex-col space-y-6 h-full overflow-y-hidden">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Ticket Details</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground">Status</span>
                                                            <Select value={selectedTicket.status} onValueChange={(value: TicketStatus) => handleTicketUpdate(selectedTicket.id, 'status', value)}>
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue placeholder="Set status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Open"><div className="flex items-center"><CircleDotDashed className="mr-2 h-4 w-4"/> Open</div></SelectItem>
                                                                    <SelectItem value="In Progress"><div className="flex items-center"><RefreshCw className="mr-2 h-4 w-4"/> In Progress</div></SelectItem>
                                                                    <SelectItem value="Closed"><div className="flex items-center"><CheckCircle className="mr-2 h-4 w-4"/> Closed</div></SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground">Priority</span>
                                                            <Select value={selectedTicket.priority} onValueChange={(value: TicketPriority) => handleTicketUpdate(selectedTicket.id, 'priority', value)}>
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue placeholder="Set priority" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="High">High</SelectItem>
                                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                                    <SelectItem value="Low">Low</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>User Information</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={selectedTicket.user.avatar} />
                                                            <AvatarFallback>{selectedTicket.user.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{selectedTicket.user.name}</p>
                                                            <p className="text-sm text-muted-foreground">{selectedTicket.user.email}</p>
                                                        </div>
                                                    </div>
                                                        <Button variant="outline" className="w-full mt-2" asChild>
                                                            <Link href={`/admin/users/${selectedTicket.userId}`}>
                                                                <User className="mr-2 h-4 w-4"/>View User Profile
                                                            </Link>
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                                <Card className="flex flex-col">
                                                    <CardHeader>
                                                        <CardTitle>Add a Reply</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex-grow">
                                                        <form onSubmit={handleReply} className="h-full flex flex-col">
                                                            <Textarea 
                                                                placeholder="Type your reply here..." 
                                                                className="flex-grow min-h-[100px]"
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                            />
                                                            <div className="flex justify-between items-center gap-2 mt-2">
                                                                <Button type="button" variant="outline"><Paperclip className="mr-2 h-4 w-4"/>Attach</Button>
                                                                <Button type="submit" disabled={isReplying || !replyText.trim()}>
                                                                    {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                                                    Reply
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                       </>
                                    )}
                                  </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                            No tickets found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
