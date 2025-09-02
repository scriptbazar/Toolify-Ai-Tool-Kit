

'use client';

import { useState, useMemo, useRef, type FormEvent, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { RefreshCw, UserPlus, Users, Vote, Wifi, Send, Paperclip, Bot, User, Copy, Loader2, X, Image as ImageIcon, MoreHorizontal, Smile, MessageSquareReply, ThumbsUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getChatUsers } from '@/ai/flows/user-management';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/common/Logo';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


type Poll = {
    question: string;
    options: string[];
    votes: { [key: string]: string[] }; // option -> userId[]
    allowCustomOptions: boolean;
};

type Message = {
    id: string;
    fromId: string;
    fromName: string;
    text: string;
    type: 'user' | 'admin';
    imageUrl?: string;
    poll?: Poll;
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
  lastName:string;
}


const PollDisplay = ({ message, currentUser }: { message: Message, currentUser: FirebaseUser | null }) => {
    const { toast } = useToast();

    if (!message.poll) return null;
    
    // Ensure votes object and options exist
    const votes = message.poll.votes || {};
    const options = message.poll.options || [];

    const userHasVoted = currentUser ? Object.values(votes).some(voters => voters && voters.includes(currentUser.uid)) : false;

    const handleVote = async (option: string) => {
        if (!currentUser || userHasVoted) {
            if (userHasVoted) toast({ description: "You have already voted in this poll." });
            return;
        }

        const messageRef = doc(db, 'communityChat', message.id);
        
        // Ensure the option exists in votes before trying to update it
        const currentVotesForOption = votes[option] || [];
        
        await updateDoc(messageRef, {
            [`poll.votes.${option}`]: arrayUnion(currentUser.uid)
        });
        toast({ title: "Vote cast!", description: `You voted for "${option}".` });
    };

    const handleAddOption = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (userHasVoted) {
            toast({ description: "You have already voted in this poll." });
            return;
        }

        const formData = new FormData(e.currentTarget);
        const newOption = formData.get('newOption') as string;
        
        if (!newOption.trim() || !currentUser || !message.poll) return;
        if (message.poll.options.includes(newOption.trim())) {
            toast({ description: "This option already exists.", variant: "destructive" });
            return;
        }

        const messageRef = doc(db, 'communityChat', message.id);
        await updateDoc(messageRef, {
            'poll.options': arrayUnion(newOption.trim()),
            [`poll.votes.${newOption.trim()}`]: arrayUnion(currentUser.uid),
        });
        
        const popoverTrigger = document.getElementById(`add-option-popover-${message.id}`);
        if (popoverTrigger) popoverTrigger.click(); 
    };

    return (
        <div className="mt-2 space-y-2">
            <p className="font-semibold">{message.poll.question}</p>
            <div className="space-y-2">
                {options.map((option, index) => {
                    const voteCount = votes[option]?.length || 0;
                    const hasVotedThisOption = currentUser ? votes[option]?.includes(currentUser.uid) : false;
                    return (
                        <Button
                            key={index}
                            variant={hasVotedThisOption ? "default" : "outline"}
                            className="w-full justify-between"
                            onClick={() => handleVote(option)}
                            disabled={userHasVoted}
                        >
                            <span>{option}</span>
                            <Badge variant={hasVotedThisOption ? "secondary" : "default"}>{voteCount}</Badge>
                        </Button>
                    );
                })}
            </div>
            {message.poll.allowCustomOptions && (
              <Popover>
                <PopoverTrigger asChild id={`add-option-popover-${message.id}`}>
                  <Button variant="link" className="p-0 h-auto text-sm" disabled={userHasVoted}>Add your own option</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <form onSubmit={handleAddOption} className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Add a new option</h4>
                      <p className="text-sm text-muted-foreground">
                        Your vote will be automatically cast for this option.
                      </p>
                    </div>
                    <div className="grid gap-2">
                        <Input name="newOption" placeholder="Type your option..." />
                        <Button type="submit">Submit</Button>
                    </div>
                  </form>
                </PopoverContent>
              </Popover>
            )}
        </div>
    );
};


export default function CommunityChatPage() {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<AppUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
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
        const unsubscribeMessages = onSnapshot(q, 
            (querySnapshot) => {
                const fetchedMessages: Message[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedMessages.push({ ...doc.data(), id: doc.id } as Message);
                });
                setMessages(fetchedMessages);
            },
            (error) => {
                console.error("Chat Snapshot Error: ", error);
                if (error.code === 'permission-denied') {
                    toast({
                        title: "Permission Denied",
                        description: "You do not have permission to view the chat. This is likely due to Firestore security rules.",
                        variant: "destructive",
                        duration: 10000,
                    });
                } else {
                    toast({
                        title: "Error Loading Chat",
                        description: "Could not load messages. Please try again later.",
                        variant: "destructive",
                    });
                }
            }
        );

        return () => unsubscribeMessages();
    }, [toast]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !attachment) || !currentUser || !userData) return;

        const isFirstUserMessage = !messages.some(m => m.fromId === currentUser.uid && m.type === 'user');
        
        setIsSending(true);

        try {
            let imageUrl: string | undefined = undefined;
            if (attachment) {
                const storage = getStorage();
                const storageRef = ref(storage, `community-chat/${currentUser.uid}/${Date.now()}_${attachment.name}`);
                const snapshot = await uploadBytes(storageRef, attachment);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, "communityChat"), {
                fromId: currentUser.uid,
                fromName: `${userData.firstName} ${userData.lastName}`,
                text: input,
                type: 'user',
                imageUrl,
                timestamp: serverTimestamp(),
            });
            setInput('');
            setAttachment(null);
            
            if (isFirstUserMessage && userData?.firstName) {
                const welcomeMessage: Message = {
                    id: `welcome-${Date.now()}`,
                    fromId: 'bot',
                    fromName: 'ToolifyAI',
                    type: 'admin',
                    text: `Welcome to the community, ${userData.firstName}! We're glad to have you here.`,
                    timestamp: Timestamp.now(),
                };
                 await addDoc(collection(db, "communityChat"), welcomeMessage);
            }
        } catch (error: any) {
             console.error("Error sending message:", error);
             toast({
                title: "Error Sending Message",
                description: error.code === 'permission-denied'
                    ? "You do not have permission to send messages. Please check your Firestore security rules."
                    : "Could not send message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    title: "File too large",
                    description: `"${file.name}" exceeds the 2MB size limit.`,
                    variant: 'destructive'
                });
                return;
            }
            setAttachment(file);
        }
        event.target.value = ''; // Reset file input
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
               <ScrollArea className="h-full max-h-[calc(100vh-30rem)] px-4" ref={scrollAreaRef}>
                  <div className="space-y-6">
                      {messages.map((msg) => (
                         <div key={msg.id} className={cn("flex items-start gap-3 group", msg.fromId === currentUser?.uid ? 'flex-row-reverse' : '')}>
                            <Avatar>
                                <AvatarFallback>{msg.fromName === 'ToolifyAI' ? <Bot/> : msg.type === 'admin' ? <Logo className="h-5 w-5"/> : msg.fromName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className={cn("rounded-lg px-4 py-2 max-w-sm relative", msg.fromId === currentUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                              <p className="font-bold text-xs mb-1">{msg.fromName}</p>
                              {msg.imageUrl && (
                                  <Image src={msg.imageUrl} alt="chat attachment" width={200} height={200} className="rounded-md my-2" />
                              )}
                              {msg.text && <p>{msg.text}</p>}
                              {msg.poll && <PollDisplay message={msg} currentUser={currentUser} />}
                            </div>
                            <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", msg.fromId === currentUser?.uid ? 'mr-2' : 'ml-2')}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => toast({ title: "Reply coming soon!" })}>
                                            <MessageSquareReply className="mr-2 h-4 w-4" />
                                            Reply
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toast({ title: "Reactions coming soon!" })}>
                                            <Smile className="mr-2 h-4 w-4" />
                                            React
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                      ))}
                  </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 border-t flex-col items-start gap-2">
                 {attachment && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md w-full">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">{attachment.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachment(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="relative w-full flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-5 w-5"/>
                        <span className="sr-only">Attach file</span>
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <Input
                        placeholder="Type your message..."
                        className="pr-12 h-12"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoComplete="off"
                        disabled={isSending}
                    />
                    <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSending || (!input.trim() && !attachment)}>
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
