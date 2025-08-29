
'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  User,
  Clock,
  CircleDotDashed,
  RefreshCw,
  CheckCircle,
  Paperclip,
  Send,
  Loader2,
  Trash2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';


type TicketStatus = 'Open' | 'In Progress' | 'Closed';
type TicketPriority = 'High' | 'Medium' | 'Low';
type Message = {
    author: 'user' | 'admin';
    name: string;
    avatar: string;
    text: string;
    timestamp: string;
};

// Dummy data for a single ticket - in a real app, this would be fetched based on the [id] param
const initialTicketData = {
  id: 'TKT-001',
  subject: 'Cannot login to my account',
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?u=john.doe',
  },
  priority: 'High' as TicketPriority,
  status: 'Open' as TicketStatus,
  createdAt: '2024-07-31 09:45 AM',
  messages: [
    {
        author: 'user' as const,
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?u=john.doe',
        text: 'Hi, I seem to have forgotten my password and the reset link is not working. Can you please help me regain access to my account? I have tried clearing my cache and using a different browser, but nothing seems to work. I need to access my files urgently.',
        timestamp: '2024-07-31 09:45 AM',
    }
  ]
};

const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
        case 'Open': return <CircleDotDashed className="h-4 w-4 mr-2" />;
        case 'In Progress': return <RefreshCw className="h-4 w-4 mr-2" />;
        case 'Closed': return <CheckCircle className="h-4 w-4 mr-2" />;
    }
}

const getPriorityIcon = (priority: TicketPriority) => {
    return <Badge variant={priority === 'High' ? 'destructive' : priority === 'Medium' ? 'secondary' : 'outline'}>{priority}</Badge>;
}

export default function ViewTicketPage() {
    const { toast } = useToast();
    const [ticket, setTicket] = useState(initialTicketData);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsReplying(true);
        // Simulate API call
        setTimeout(() => {
            const newReply: Message = {
                author: 'admin',
                name: 'Admin', // In a real app, get current admin's name
                avatar: 'https://i.pravatar.cc/150?u=admin',
                text: replyText,
                timestamp: new Date().toLocaleString(),
            };
            setTicket(prev => ({
                ...prev,
                messages: [...prev.messages, newReply],
                status: 'In Progress' // Automatically change status on reply
            }));
            setReplyText('');
            setIsReplying(false);
            toast({ title: 'Reply Sent!', description: 'Your reply has been added to the ticket.' });
        }, 1000);
    }

  return (
    <div className="space-y-6">
      <Link href="/admin/ticket-management" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back To All Tickets
      </Link>
      
      <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="text-muted-foreground">[{ticket.id}]</span> 
                {ticket.subject}
            </h1>
             <p className="text-muted-foreground">
                Opened by {ticket.user.name} on {ticket.createdAt}
             </p>
          </div>
          <Button disabled>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Ticket
          </Button>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.map((message, index) => (
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
           </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Add a Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleReply}>
                       <div className="grid w-full gap-2">
                          <Textarea 
                            placeholder="Type your reply here..." 
                            className="min-h-[150px]"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex justify-between items-center">
                             <Button type="button" variant="outline"><Paperclip className="mr-2 h-4 w-4"/>Attach File</Button>
                             <Button type="submit" disabled={isReplying || !replyText.trim()}>
                                {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                Send Reply
                             </Button>
                          </div>
                       </div>
                    </form>
                </CardContent>
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
                         <Select value={ticket.status} onValueChange={(value: TicketStatus) => setTicket(prev => ({...prev, status: value}))}>
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
                         <Select value={ticket.priority} onValueChange={(value: TicketPriority) => setTicket(prev => ({...prev, priority: value}))}>
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
                     <Button className="w-full"><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                   <div className="flex items-center gap-3">
                       <Avatar>
                           <AvatarImage src={ticket.user.avatar} />
                           <AvatarFallback>{ticket.user.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-semibold">{ticket.user.name}</p>
                         <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                       </div>
                   </div>
                    <Button variant="outline" className="w-full mt-2">
                        <Link href={`/admin/users/placeholder-id`} className="flex items-center">
                            <User className="mr-2 h-4 w-4"/>View User Profile
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
       </div>
    </div>
  );
}
