
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
import { RefreshCw, UserPlus, Users, Vote, Wifi, Send, Paperclip, Bot, User, Copy, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getChatUsers } from '@/ai/flows/user-management';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/common/Logo';


type Message = {
    id: string;
    fromId: string;
    fromName: string;
    text: string;
    type: 'user' | 'admin';
    timestamp: any;
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


export default function CommunityChatPage() {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<AppUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [activeUserFilter, setActiveUserFilter] = useState<'all' | 'live'>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Fetch users and auth state
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
              setCurrentUser(user);
              const userDocRef = doc(db, 'users', user.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                  setUserData(userDocSnap.data() as AppUser);
              }
            } else {
              router.push('/login');
            }
        });
        
        async function fetchUsers() {
            setLoading(true);
            try {
                const usersList = await getChatUsers();
                setAllUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ title: "Error", description: "Could not load community members.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        
        fetchUsers();

        return () => unsubscribeAuth();
    }, [router, toast]);

    // Listen for new messages
    useEffect(() => {
        const q = query(collection(db, "communityChat"), orderBy("timestamp", "asc"));
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = [];
            querySnapshot.forEach((doc) => {
                fetchedMessages.push({ ...doc.data(), id: doc.id } as Message);
            });
            setMessages(fetchedMessages);
        });

        return () => unsubscribeMessages();
    }, []);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentUser || !userData) return;

        const isFirstUserMessage = !messages.some(m => m.fromId === currentUser.uid && m.type === 'user');
        
        setIsSending(true);

        try {
            await addDoc(collection(db, "communityChat"), {
                fromId: currentUser.uid,
                fromName: `${userData.firstName} ${userData.lastName}`,
                text: input,
                type: 'user',
                timestamp: serverTimestamp(),
            });

            if (isFirstUserMessage) {
                // Simulate a welcome message locally, not saving to DB
                 const welcomeMessage: Message = {
                    id: `welcome-${Date.now()}`,
                    fromId: 'bot',
                    fromName: 'ToolifyAI',
                    type: 'admin',
                    text: `Welcome to the community, ${userData.firstName}! We're glad to have you here.`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, welcomeMessage]);
            }

            setInput('');
        } catch (error) {
             toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // ... (file handling logic as before)
    };

    const filteredUsers = useMemo(() => {
        if (activeUserFilter === 'live') {
           const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
           return allUsers.filter(user => user.lastActive && new Date(user.lastActive) > fiveMinutesAgo);
        }
       return allUsers;
    }, [activeUserFilter, allUsers]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
        description: `Copied username: @${text}`,
        });
    };
    
    const senderDisplayName = userData ? `${userData.firstName} ${userData.lastName}`.trim() : 'User';


  if (loading) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-transparent">
          <Logo className="h-16 w-16 animate-pulse" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-lg">Loading Chat...</p>
          </div>
        </div>
      );
  }


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
                          <div key={msg.id} className={cn("flex items-start gap-3", msg.fromId === currentUser?.uid ? 'flex-row-reverse' : '')}>
                              <Avatar>
                                  <AvatarFallback>{msg.fromName === 'ToolifyAI' ? <Bot/> : msg.type === 'admin' ? <Logo className="h-5 w-5"/> : msg.fromName.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className={cn("rounded-lg px-4 py-2 max-w-sm", msg.fromId === currentUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="font-bold text-xs mb-1">{msg.fromName}</p>
                                <p>{msg.text}</p>
                              </div>
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
                        disabled={isSending}
                    />
                    <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSending || !input.trim()}>
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5"/>}
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
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                  <ScrollArea className="h-full max-h-[calc(100vh-26rem)] pr-4">
                      {loading ? <p>Loading members...</p> : (
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
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(user.username)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
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
