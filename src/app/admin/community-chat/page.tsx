
'use client';

import { useState, useMemo, useRef, type FormEvent, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { RefreshCw, UserPlus, Users, Vote, Wifi, Send, Paperclip, Bot, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';


type Message = {
    id: number;
    from: string;
    text?: string;
    type: 'user' | 'assistant' | 'poll' | 'media';
    error?: boolean;
    poll?: {
      question: string;
      options: string[];
      allowCustomAnswer: boolean;
    };
    media?: {
        fileName: string;
        fileType: string;
    }
};

const initialMessages: Message[] = [
    { id: 1, from: 'AA', text: 'Welcome to the community chat admin view! You can monitor conversations here.', type: 'assistant' },
    { id: 2, from: 'SB', text: 'hello', type: 'user' },
];

const allUsers = [
    { initials: 'GK', name: 'Ganesh Kumar', username: 'ganesh', status: 'live' },
    { initials: 'SB', name: 'Script Bazar', username: 'scriptbazar', status: 'live' },
    { initials: 'JD', name: 'John Doe', username: 'johndoe', status: 'new' },
    { initials: 'EM', name: 'Elon Musk', username: 'elon', status: 'live' },
    { initials: 'TJ', name: 'Thomas Jefferson', username: 'thomasj', status: 'new' },
];

export default function CommunityChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [activeUserFilter, setActiveUserFilter] = useState<'all' | 'live' | 'new'>('live');
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage: Message = {
            id: messages.length + 1,
            from: 'Admin',
            text: input,
            type: 'user',
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
    };

    const handleCreatePoll = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const question = formData.get('question') as string;
        const allowCustomAnswer = formData.get('allowCustomAnswer') === 'on';
        const options = [
            formData.get('option1') as string,
            formData.get('option2') as string,
            formData.get('option3') as string,
            formData.get('option4') as string,
        ].filter(Boolean);

        if (!question || options.length < 2) {
            return;
        }

        const newPollMessage: Message = {
            id: messages.length + 1,
            from: 'Admin',
            type: 'poll',
            poll: { question, options, allowCustomAnswer }
        };

        setMessages(prev => [...prev, newPollMessage]);
        setIsPollModalOpen(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newMediaMessage: Message = {
                id: messages.length + 1,
                from: 'Admin',
                type: 'media',
                media: {
                    fileName: file.name,
                    fileType: file.type,
                },
            };
            setMessages(prev => [...prev, newMediaMessage]);
        }
    };

    const filteredUsers = useMemo(() => {
        if (activeUserFilter === 'all') return allUsers;
        return allUsers.filter(user => user.status === activeUserFilter);
    }, [activeUserFilter]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Chat</h1>
        <p className="text-muted-foreground">
          Monitor and participate in the live community chat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
        <div className="lg:col-span-2 flex flex-col h-full">
           <Card className="flex-grow flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle>Live Chat Feed</CardTitle>
              <p className="text-muted-foreground text-sm pb-4">
                  All messages from users and the AI assistant.
              </p>
            </CardHeader>
            <CardContent className="flex-grow p-0">
               <ScrollArea className="h-full max-h-[calc(100vh-27rem)] px-4" ref={scrollAreaRef}>
                  <div className="space-y-6">
                      {messages.map((msg) => (
                          <div key={msg.id} className={cn("flex items-start gap-3", msg.from === 'Admin' ? 'flex-row-reverse' : '')}>
                              <Avatar>
                                  <AvatarFallback>{msg.from.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                               {msg.type === 'poll' && msg.poll ? (
                                   <Card className="w-full max-w-md">
                                       <CardHeader>
                                           <CardTitle className="text-base">{msg.poll.question}</CardTitle>
                                       </CardHeader>
                                       <CardContent>
                                           <RadioGroup>
                                              {msg.poll.options.map((opt, i) => (
                                                  <div key={i} className="flex items-center space-x-2">
                                                      <RadioGroupItem value={opt} id={`opt-${msg.id}-${i}`} />
                                                      <Label htmlFor={`opt-${msg.id}-${i}`}>{opt}</Label>
                                                  </div>
                                              ))}
                                              {msg.poll.allowCustomAnswer && (
                                                  <div className="flex items-center space-x-2 pt-2">
                                                      <RadioGroupItem value="other" id={`opt-other-${msg.id}`} />
                                                      <Label htmlFor={`opt-other-${msg.id}`} className="flex-1">
                                                          <Input placeholder="Other (please specify)" className="h-8"/>
                                                      </Label>
                                                  </div>
                                              )}
                                           </RadioGroup>
                                       </CardContent>
                                       <CardFooter>
                                           <Button size="sm" className="w-full">
                                              <Vote className="mr-2 h-4 w-4"/> Submit Vote
                                           </Button>
                                       </CardFooter>
                                   </Card>
                               ) : msg.type === 'media' && msg.media ? (
                                   <div className="rounded-lg px-4 py-2 bg-muted text-sm">
                                      <p>Shared a file: <span className="font-medium">{msg.media.fileName}</span></p>
                                   </div>
                               ) : (
                                  <div className={cn("rounded-lg px-4 py-2 max-w-sm", msg.from === 'Admin' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p>{msg.text}</p>
                                  </div>
                               )}
                              {msg.error && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <RefreshCw className="h-4 w-4"/>
                                  </Button>
                              )}
                          </div>
                      ))}
                  </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 border-t">
              <form onSubmit={handleSendMessage} className="relative w-full flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-5 w-5"/>
                      <span className="sr-only">Attach file</span>
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Input placeholder="Type your message..." className="pr-12 h-12" value={input} onChange={(e) => setInput(e.target.value)} />
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Send className="h-5 w-5"/>
                  </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-1 h-full">
           <Card className="h-full flex flex-col">
              <CardHeader>
                  <div>
                      <CardTitle>Community Members</CardTitle>
                      <p className="text-muted-foreground text-sm">
                          See which members are active.
                      </p>
                  </div>
                  <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-1">
                          <Button variant="outline" onClick={() => setActiveUserFilter('all')}>
                              <span className="flex items-center"><Users className="mr-2 h-4 w-4" /> All Members</span>
                          </Button>
                          <Dialog open={isPollModalOpen} onOpenChange={setIsPollModalOpen}>
                              <DialogTrigger asChild>
                                  <Button variant="outline">
                                      <span className="flex items-center"><Vote className="mr-2 h-4 w-4" /> Create Poll</span>
                                  </Button>
                              </DialogTrigger>
                              <DialogContent>
                                  <DialogHeader>
                                      <DialogTitle>Create a New Poll</DialogTitle>
                                      <DialogDescription>
                                          Engage the community by creating a poll.
                                      </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleCreatePoll}>
                                  <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="question">Poll Question</Label>
                                          <Input id="question" name="question" placeholder="e.g., What's your favorite new feature?" required/>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Poll Options</Label>
                                          <div className="grid grid-cols-2 gap-2">
                                              <Input name="option1" placeholder="Option 1" required />
                                              <Input name="option2" placeholder="Option 2" required />
                                              <Input name="option3" placeholder="Option 3" />
                                              <Input name="option4" placeholder="Option 4" />
                                          </div>
                                      </div>
                                      <div className="flex items-center space-x-2 pt-2">
                                          <Switch id="allowCustomAnswer" name="allowCustomAnswer" />
                                          <Label htmlFor="allowCustomAnswer">Allow custom answers</Label>
                                      </div>
                                  </div>
                                  <DialogFooter>
                                      <Button type="submit">
                                          <Send className="mr-2 h-4 w-4" /> Post Poll
                                      </Button>
                                  </DialogFooter>
                                  </form>
                              </DialogContent>
                          </Dialog>
                      </div>
                      <div className="grid w-full grid-cols-2 gap-1">
                          <Button variant={activeUserFilter === 'live' ? 'default' : 'outline'} onClick={() => setActiveUserFilter('live')}>
                             <span className="flex items-center"><Wifi className="mr-2 h-4 w-4"/>Live Users</span>
                          </Button>
                          <Button variant={activeUserFilter === 'new' ? 'default' : 'outline'} onClick={() => setActiveUserFilter('new')}>
                             <span className="flex items-center"><UserPlus className="mr-2 h-4 w-4"/>New Users</span>
                          </Button>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                  <ScrollArea className="h-full max-h-[calc(100vh-26rem)] pr-4">
                      <div className="space-y-4">
                      {filteredUsers.map(user => (
                          <div key={user.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <Avatar>
                                      <AvatarFallback>{user.initials}</AvatarFallback>
                                  </Avatar>
                                   <div>
                                      <p className="font-medium">{user.name}</p>
                                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                                    </div>
                              </div>
                              {user.status === 'live' && <Badge className="bg-green-500 hover:bg-green-600 text-white">online</Badge>}
                          </div>
                      ))}
                      </div>
                   </ScrollArea>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
