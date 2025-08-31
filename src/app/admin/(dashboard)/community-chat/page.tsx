
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
import { RefreshCw, UserPlus, Users, Vote, Wifi, Send, Paperclip, Bot, User, Copy, PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDesc, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getChatUsers } from '@/ai/flows/user-management';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


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

interface ChatUser {
    id: string;
    initials: string;
    name: string;
    username: string;
    createdAt?: string | null;
    lastActive?: string | null;
}

interface AppUser {
  firstName: string;
  lastName: string;
}

const initialMessages: Message[] = [
    { id: 1, from: 'ToolifyAI', text: 'Welcome to the community chat! Feel free to ask questions and share ideas.', type: 'assistant' },
];

const PollCreationDialog = ({ onAddPoll }: { onAddPoll: (poll: Message['poll']) => void }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [allowCustom, setAllowCustom] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        if (question && options.every(opt => opt.trim())) {
            onAddPoll({ question, options, allowCustomAnswer: allowCustom });
            setIsOpen(false);
            // Reset state
            setQuestion('');
            setOptions(['', '', '', '']);
            setAllowCustom(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Vote className="mr-2 h-4 w-4"/>Create Poll
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Poll</DialogTitle>
                    <DialogDesc>
                        Engage the community by creating a multiple-choice poll.
                    </DialogDesc>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="poll-question">Poll Question</Label>
                        <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What's your favorite feature?" />
                    </div>
                    <div className="space-y-2">
                        <Label>Options</Label>
                        {options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="allow-custom" checked={allowCustom} onCheckedChange={setAllowCustom} />
                        <Label htmlFor="allow-custom">Allow users to add their own option</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Create Poll</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function CommunityChatPage() {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<AppUser | null>(null);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [activeUserFilter, setActiveUserFilter] = useState<'all' | 'live' | 'new'>('live');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

     useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data() as AppUser);
                }
            }
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        async function fetchUsers() {
            setLoadingUsers(true);
            try {
                const usersList = await getChatUsers();
                setAllUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ title: "Error", description: "Could not load community members.", variant: "destructive" });
            } finally {
                setLoadingUsers(false);
            }
        }
        fetchUsers();
    }, [toast]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleAddPoll = (pollData: Message['poll']) => {
        const newPollMessage: Message = {
            id: messages.length + 1,
            from: 'Admin',
            type: 'poll',
            poll: pollData,
        };
        setMessages(prev => [...prev, newPollMessage]);
        toast({ title: "Poll Created!", description: "Your poll has been added to the chat." });
    };

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !userData) return;
        
        const senderName = `${userData.firstName} ${userData.lastName}`.trim() || 'Admin';

        const newMessage: Message = {
            id: messages.length + 1,
            from: senderName,
            text: input,
            type: 'user',
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && userData) {
            const senderName = `${userData.firstName} ${userData.lastName}`.trim() || 'Admin';
            const newMediaMessage: Message = {
                id: messages.length + 1,
                from: senderName,
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
        if (activeUserFilter === 'live') {
           const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
           return allUsers.filter(user => user.lastActive && new Date(user.lastActive) > fiveMinutesAgo);
        }
       if (activeUserFilter === 'new') {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return allUsers.filter(user => user.createdAt && new Date(user.createdAt) > twentyFourHoursAgo);
       }
       return allUsers;
    }, [activeUserFilter, allUsers]);

    const senderDisplayName = userData ? `${userData.firstName} ${userData.lastName}`.trim() : 'Admin';


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Chat</h1>
        <p className="text-muted-foreground">
          Connect with other members of the ToolifyAI community.
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
                          <div key={msg.id} className={cn("flex items-start gap-3", msg.from === senderDisplayName ? 'flex-row-reverse' : '')}>
                              <Avatar>
                                  <AvatarFallback>
                                    {msg.from === 'ToolifyAI' ? <Bot /> : msg.from.substring(0, 2)}
                                  </AvatarFallback>
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
                                  <div className={cn("rounded-lg px-4 py-2 max-w-sm", msg.from === senderDisplayName ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p>{msg.text}</p>
                                  </div>
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
                    <Input
                        placeholder="Type your message..."
                        className="pr-12 h-12"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoComplete="off"
                    />
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
                      <div className="grid w-full grid-cols-2 gap-1 pt-2">
                           <Button variant={activeUserFilter === 'all' ? 'default' : 'outline'} onClick={() => setActiveUserFilter('all')}>
                                <span className="flex items-center"><Users className="mr-2 h-4 w-4" /> All</span>
                           </Button>
                           <Button variant={activeUserFilter === 'live' ? 'default' : 'outline'} onClick={() => setActiveUserFilter('live')}>
                              <span className="flex items-center"><Wifi className="mr-2 h-4 w-4"/>Live</span>
                           </Button>
                           <PollCreationDialog onAddPoll={handleAddPoll} />
                           <Button variant={activeUserFilter === 'new' ? 'default' : 'outline'} onClick={() => setActiveUserFilter('new')}>
                               <span className="flex items-center"><UserPlus className="mr-2 h-4 w-4"/>New Users</span>
                           </Button>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                  <ScrollArea className="h-full max-h-[calc(100vh-26rem)] pr-4">
                      {loadingUsers ? <p>Loading members...</p> : (
                          <div className="space-y-4">
                          {filteredUsers.map(user => (
                              <div key={user.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <Avatar>
                                          <AvatarFallback>{user.initials}</AvatarFallback>
                                      </Avatar>
                                       <div>
                                          <p className="font-medium">{user.name}</p>
                                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <span>@{user.username}</span>
                                          </div>
                                        </div>
                                  </div>
                                  {activeUserFilter === 'live' && <Badge className="bg-green-500 hover:bg-green-600 text-white">online</Badge>}
                              </div>
                          ))}
                           {filteredUsers.length === 0 && (
                                <div className="text-center text-muted-foreground pt-10">
                                    <p>No users found for this filter.</p>
                                </div>
                            )}
                          </div>
                      )}
                   </ScrollArea>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
