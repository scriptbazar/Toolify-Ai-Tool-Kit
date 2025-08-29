
'use client';

import { useState } from 'react';
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
  MoreHorizontal,
  Paperclip,
  Send,
  Loader2,
  Trash2,
  Save,
  User,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type FilterType = 'all' | 'open' | 'in-progress' | 'closed';
type TicketStatus = 'Open' | 'In Progress' | 'Closed';
type TicketPriority = 'High' | 'Medium' | 'Low';
type Message = {
    author: 'user' | 'admin';
    name: string;
    avatar: string;
    text: string;
    timestamp: string;
};

type Ticket = {
  id: string;
  subject: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  priority: TicketPriority;
  status: TicketStatus;
  lastUpdated: string;
  messages: Message[];
};

const initialTickets: Ticket[] = [
    {
        id: 'TKT-001',
        subject: 'Cannot login to my account',
        user: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: 'https://i.pravatar.cc/150?u=john.doe',
        },
        priority: 'High',
        status: 'Open',
        lastUpdated: '2024-07-31 10:00 AM',
        messages: [
            {
                author: 'user' as const,
                name: 'John Doe',
                avatar: 'https://i.pravatar.cc/150?u=john.doe',
                text: 'Hi, I seem to have forgotten my password and the reset link is not working. Can you please help me regain access to my account? I have tried clearing my cache and using a different browser, but nothing seems to work. I need to access my files urgently.',
                timestamp: '2024-07-31 09:45 AM',
            }
        ]
    },
];

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
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const tabs: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'open', label: 'Open', icon: CircleDotDashed },
    { id: 'in-progress', label: 'In Progress', icon: RefreshCw },
    { id: 'closed', label: 'Closed', icon: CheckCircle },
  ];

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsReplying(true);
    setTimeout(() => {
        const newReply: Message = {
            author: 'admin',
            name: 'Admin',
            avatar: 'https://i.pravatar.cc/150?u=admin',
            text: replyText,
            timestamp: new Date().toLocaleString(),
        };

        const updatedTicket = {
            ...selectedTicket,
            messages: [...selectedTicket.messages, newReply],
            status: 'In Progress' as TicketStatus,
            lastUpdated: new Date().toLocaleString()
        };

        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setReplyText('');
        setIsReplying(false);
        toast({ title: 'Reply Sent!', description: 'Your reply has been added to the ticket.' });
    }, 1000);
  };
  
  const handleTicketUpdate = () => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? selectedTicket : t));
    toast({ title: 'Ticket Updated', description: 'Changes have been saved.' });
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
            Here are all the support tickets from your users.
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
                  {tab.label} ({tickets.filter(t => tab.id === 'all' || t.status.toLowerCase().replace(' ','-') === tab.id).length})
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
                {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                            <TableCell>
                                <div>{ticket.user.name}</div>
                                <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>{ticket.lastUpdated}</TableCell>
                            <TableCell className="text-right">
                               <Dialog onOpenChange={(open) => !open && setSelectedTicket(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" onClick={() => setSelectedTicket(ticket)}>View/Reply</Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                                    {selectedTicket && (
                                       <>
                                        <DialogHeader className="p-6">
                                            <DialogTitle className="flex items-center gap-2">
                                                <span className="text-muted-foreground">[{selectedTicket.id}]</span> 
                                                {selectedTicket.subject}
                                            </DialogTitle>
                                            <DialogDescription>
                                                Opened by {selectedTicket.user.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 flex-1 overflow-y-auto">
                                            <div className="lg:col-span-2 flex flex-col space-y-4">
                                                <Card className="flex-1 overflow-hidden flex flex-col">
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
                                                                    <p className="text-sm">{message.text}</p>
                                                                    <p className="text-xs text-right mt-2 opacity-70">{message.timestamp}</p>
                                                                </div>
                                                            </div>
                                                            ))}
                                                        </CardContent>
                                                    </ScrollArea>
                                                </Card>
                                            </div>
                                            <div className="lg:col-span-1 space-y-6">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Ticket Details</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground">Status</span>
                                                            <Select value={selectedTicket.status} onValueChange={(value: TicketStatus) => setSelectedTicket(prev => prev ? {...prev, status: value} : null)}>
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
                                                            <Select value={selectedTicket.priority} onValueChange={(value: TicketPriority) => setSelectedTicket(prev => prev ? {...prev, priority: value} : null)}>
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
                                                        <Separator />
                                                        <DialogClose asChild>
                                                            <Button className="w-full" onClick={handleTicketUpdate}><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
                                                        </DialogClose>
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
                                                            <Link href={`/admin/users/placeholder-id`} className="flex items-center">
                                                                <User className="mr-2 h-4 w-4"/>View User Profile
                                                            </Link>
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t bg-background">
                                            <form onSubmit={handleReply}>
                                                <div className="grid w-full gap-2">
                                                    <Textarea 
                                                        placeholder="Type your reply here..." 
                                                        className="min-h-[100px]"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                    <div className="flex justify-end items-center gap-2">
                                                        <Button type="button" variant="outline"><Paperclip className="mr-2 h-4 w-4"/>Attach File</Button>
                                                        <Button type="submit" disabled={isReplying || !replyText.trim()}>
                                                            {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                                            Send Reply
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
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
