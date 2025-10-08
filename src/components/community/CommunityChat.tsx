
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
import { RefreshCw, UserPlus, Users, Vote, Wifi, Send, Paperclip, Bot, User, Copy, PlusCircle, Trash2, Loader2, MessageSquare, X, Image as ImageIcon, MoreHorizontal, Smile, MessageSquareReply, ThumbsUp, AtSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDesc, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Logo } from '@/components/common/Logo';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getChatUsers } from '@/ai/flows/user-management';
import { saveUserMedia } from '@/ai/flows/ai-image-generator';


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
    replyTo?: {
      id: string;
      text: string;
      fromName: string;
    };
    reactions?: {
      [key: string]: string[]; // emoji -> userId[]
    };
};


interface ChatUser {
    id: string;
    initials: string;
    name: string;
    username: string;
    createdAt?: string | null;
    lastActive?: string | null;
}

const renderMessageWithTags = (text: string, users: ChatUser[]) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        const userExists = users.some(u => u.username === username);
        return <strong key={i} className={cn("px-1 rounded-sm", userExists ? "text-primary bg-primary/10" : "text-muted-foreground")}>{part}</strong>;
      }
      return part;
    });
};

const ManagePollsDialog = ({ onAddPoll, allMessages }: { onAddPoll: (poll: Omit<Poll, 'votes'>) => void; allMessages: Message[] }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [allowCustomOptions, setAllowCustomOptions] = useState(false);
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const pollMessages = useMemo(() => allMessages.filter(msg => msg.poll), [allMessages]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 4) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        }
    };
    
    const handleCreatePoll = () => {
      if (!question.trim()) {
        toast({ title: "Poll question cannot be empty.", variant: "destructive" });
        return;
      }
      const filledOptions = options.filter(opt => opt.trim() !== '');
      if (filledOptions.length < 2) {
        toast({ title: "Please provide at least 2 options.", variant: "destructive" });
        return;
      }
      onAddPoll({ question, options: filledOptions, allowCustomOptions });
      toast({ title: "Poll created successfully!" });
      setIsOpen(false);
      // Reset state for next poll
      setQuestion('');
      setOptions(['', '']);
      setAllowCustomOptions(false);
    };

    const handlePollClick = (pollId: string) => {
        const element = document.getElementById(`message-${pollId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setIsOpen(false);
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2"><Vote className="h-4 w-4" />Manage Polls</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Manage Polls</DialogTitle>
                <DialogDesc>
                    Create a new poll or view previous polls.
                </DialogDesc>
            </DialogHeader>
            <Tabs defaultValue="create">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create New Poll</TabsTrigger>
                    <TabsTrigger value="view">Created Polls</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="poll-question">Poll Question</Label>
                            <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What's your favorite new feature?"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`}/>
                                    {index >= 2 && (
                                        <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            </div>
                            {options.length < 4 && (
                                <Button variant="outline" size="sm" onClick={addOption}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="allow-custom-options" checked={allowCustomOptions} onCheckedChange={setAllowCustomOptions} />
                            <Label htmlFor="allow-custom-options">Allow users to add their own option</Label>
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={handleCreatePoll}>Save Poll</Button>
                     </DialogFooter>
                </TabsContent>
                <TabsContent value="view">
                    <ScrollArea className="h-72">
                    <div className="space-y-2 py-4">
                        {pollMessages.length > 0 ? pollMessages.map(msg => (
                            <div key={msg.id} className="p-2 border rounded-md hover:bg-muted cursor-pointer" onClick={() => handlePollClick(msg.id)}>
                                <p className="font-medium truncate">{msg.poll?.question}</p>
                                <p className="text-xs text-muted-foreground">{new Date(msg.timestamp?.toDate()).toLocaleString()}</p>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground pt-10">No polls created yet.</p>
                        )}
                    </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </DialogContent>
      </Dialog>
    );
};

const PollDisplayUser = ({ message, currentUser }: { message: Message, currentUser: FirebaseUser | null }) => {
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

const PollDisplayAdmin = ({ message, currentUser }: { message: Message, currentUser: FirebaseUser | null }) => {
    if (!message.poll) return null;

    const votes = message.poll.votes || {};
    const totalVotes = Object.values(votes).reduce((acc, v) => acc + (v?.length || 0), 0);

    return (
        <div className="mt-2 space-y-2">
            <p className="font-semibold">{message.poll.question}</p>
            <div className="space-y-2">
                {message.poll.options.map((option, index) => {
                    const voteCount = votes[option]?.length || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const hasVotedThisOption = currentUser ? votes[option]?.includes(currentUser.uid) : false;
                    
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className={cn(hasVotedThisOption && "font-bold")}>{option}</span>
                                <span>{voteCount} votes</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface CommunityChatProps {
    isAdmin: boolean;
}

export function CommunityChat({ isAdmin }: CommunityChatProps) {
    const { user: currentUser, userData } = useAuth();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [activeUserFilter, setActiveUserFilter] = useState<'all' | 'live' | 'new'>('live');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];


     useEffect(() => {
        const q = query(collection(db, "communityChat"), orderBy("timestamp", "asc"));
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = [];
            querySnapshot.forEach((doc) => {
                fetchedMessages.push({ ...doc.data(), id: doc.id } as Message);
            });
            setMessages(fetchedMessages);
        });

        async function fetchUsers() {
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

        return () => {
            unsubscribeMessages();
        };
    }, [toast]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleAddPoll = async (pollData: Omit<Poll, 'votes'>) => {
        if (!currentUser || !isAdmin) return;
        setIsSending(true);

        const initialVotes: { [key: string]: string[] } = {};
        pollData.options.forEach(option => {
            initialVotes[option] = [];
        });

        try {
            await addDoc(collection(db, "communityChat"), {
                fromId: currentUser.uid,
                fromName: 'Admin Poll',
                text: '',
                type: 'admin',
                poll: {
                    ...pollData,
                    votes: initialVotes,
                },
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            toast({ title: "Error", description: "Could not publish poll.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

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

                await saveUserMedia({
                    userId: currentUser.uid,
                    type: 'community-chat',
                    mediaUrl: imageUrl,
                    prompt: `Community Chat Attachment: ${attachment.name}`,
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
            
            const messagePayload: Partial<Omit<Message, 'id'>> = {
                fromId: currentUser.uid,
                fromName: isAdmin ? 'Admin' : `${userData.firstName} ${userData.lastName}`,
                text: input,
                type: isAdmin ? 'admin' : 'user',
                timestamp: serverTimestamp(),
                reactions: {},
            };
            
            if (imageUrl) {
                messagePayload.imageUrl = imageUrl;
            }

            if (replyingTo) {
                messagePayload.replyTo = {
                    id: replyingTo.id,
                    text: replyingTo.text || (replyingTo.imageUrl ? 'Image' : 'Attachment'),
                    fromName: replyingTo.fromName
                };
            }

            await addDoc(collection(db, "communityChat"), messagePayload);

            setInput('');
            setAttachment(null);
            setReplyingTo(null);
            
            if (!isAdmin && isFirstUserMessage && userData?.firstName) {
                const welcomeMessage: Partial<Message> = {
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
    
    const handleReaction = async (message: Message, emoji: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'communityChat', message.id);
        const currentReactions = message.reactions || {};
        const usersForEmoji = currentReactions[emoji] || [];

        if (usersForEmoji.includes(currentUser.uid)) {
            await updateDoc(messageRef, { [`reactions.${emoji}`]: arrayRemove(currentUser.uid) });
        } else {
            await updateDoc(messageRef, { [`reactions.${emoji}`]: arrayUnion(currentUser.uid) });
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
        if(event.target) event.target.value = '';
    };

    const filteredUsers = useMemo(() => {
        if (activeUserFilter === 'live') {
           const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
           return allUsers.filter(user => user.lastActive && new Date(user.lastActive) > fiveMinutesAgo);
        }
       if (activeUserFilter === 'new') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return allUsers.filter(user => user.createdAt && new Date(user.createdAt) > sevenDaysAgo);
       }
       return allUsers;
    }, [activeUserFilter, allUsers]);
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
        description: `Copied username: @${text}`,
        });
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        const lastWord = value.split(' ').pop();
        if (lastWord && lastWord.startsWith('@')) {
            setShowUserList(true);
            setUserSearch(lastWord.substring(1));
        } else {
            setShowUserList(false);
        }
    };
    
    const handleUserSelect = (username: string) => {
        const words = input.split(' ');
        words.pop();
        words.push(`@${username} `);
        setInput(words.join(' '));
        setShowUserList(false);
    };

    const suggestedUsers = useMemo(() => {
        if (!userSearch) return allUsers.slice(0, 5);
        return allUsers.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase())).slice(0, 5);
    }, [userSearch, allUsers]);

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
      {isAdmin && (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Chat</h1>
        <p className="text-muted-foreground">
          Connect with other members of the ToolifyAI community.
        </p>
      </div>
      )}

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
                          <div key={msg.id} id={`message-${msg.id}`} className={cn("flex items-start gap-3 group", msg.type === (isAdmin ? 'admin' : 'user') ? 'flex-row-reverse' : '')}>
                              <Avatar>
                                  <AvatarFallback>
                                    {msg.fromName === 'ToolifyAI' ? <Bot /> : msg.type === 'admin' ? <Logo className="h-5 w-5" /> : msg.fromName.substring(0, 2)}
                                  </AvatarFallback>
                              </Avatar>
                              <div className={cn("rounded-lg px-4 py-2 max-w-sm", msg.type === (isAdmin ? 'admin' : 'user') ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="font-bold text-xs mb-1">{msg.fromName}</p>
                                {msg.replyTo && (
                                <a href={`#message-${msg.replyTo.id}`} className="block bg-black/10 p-2 rounded-md mb-2 text-xs italic">
                                    <p className="font-bold">{msg.replyTo.fromName}</p>
                                    <p className="truncate">{msg.replyTo.text || (replyingTo?.imageUrl ? 'Image' : 'Attachment')}</p>
                                </a>
                                )}
                                {msg.imageUrl && (
                                    <Image src={msg.imageUrl} alt={msg.text || "chat attachment"} width={200} height={200} className="rounded-md mt-2" />
                                )}
                                {msg.text && <p className="whitespace-pre-wrap">{renderMessageWithTags(msg.text, allUsers)}</p>}
                                {msg.poll && (isAdmin ? <PollDisplayAdmin message={msg} currentUser={currentUser} /> : <PollDisplayUser message={msg} currentUser={currentUser} />) }
                                {msg.reactions && Object.values(msg.reactions).some(users => users && users.length > 0) && (
                                    <div className="flex items-center gap-1 mt-2">
                                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                                            users && users.length > 0 && (
                                                <Button
                                                    key={emoji}
                                                    variant={users.includes(currentUser?.uid ?? '') ? 'default' : 'secondary'}
                                                    size="sm"
                                                    className="h-7 px-2 rounded-full"
                                                    onClick={() => handleReaction(msg, emoji)}
                                                >
                                                    {emoji} <span className="text-xs ml-1.5">{users.length}</span>
                                                </Button>
                                            )
                                        ))}
                                    </div>
                                )}
                              </div>
                               <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", msg.type === (isAdmin ? 'admin' : 'user') ? 'mr-2' : 'ml-2')}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                                            <MessageSquareReply className="mr-2 h-4 w-4" />
                                            Reply
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Smile className="mr-2 h-4 w-4" />
                                                React
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="p-1">
                                                <div className="flex gap-1">
                                                    {reactionEmojis.map(emoji => (
                                                        <Button key={emoji} variant="ghost" size="icon" onClick={() => handleReaction(msg, emoji)}>
                                                            {emoji}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                          </div>
                      ))}
                  </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 border-t flex-col items-start gap-2 relative">
                 {showUserList && (
                    <div className="absolute bottom-full left-0 right-0 p-2">
                       <Card className="shadow-lg">
                        <CardContent className="p-2 max-h-48 overflow-y-auto">
                            {suggestedUsers.length > 0 ? suggestedUsers.map(user => (
                                <div key={user.id} onClick={() => handleUserSelect(user.username)} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                                    <Avatar className="h-6 w-6"><AvatarFallback>{user.initials}</AvatarFallback></Avatar>
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-muted-foreground p-2">No users found.</p>
                            )}
                        </CardContent>
                       </Card>
                    </div>
                )}
                 {replyingTo && (
                  <div className="flex items-center justify-between w-full p-2 bg-muted rounded-md text-sm">
                    <p className="truncate">Replying to <strong>{replyingTo.fromName}</strong></p>
                    <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}><X className="h-4 w-4" /></Button>
                  </div>
                )}
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
                        placeholder={attachment ? "Add a caption..." : "Type your message..."}
                        className="pr-12 h-12"
                        value={input}
                        onChange={handleInputChange}
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
                           {isAdmin && (
                            <>
                                <ManagePollsDialog onAddPoll={handleAddPoll} allMessages={messages} />
                                <Button variant={activeUserFilter === 'new' ? 'default' : 'outline'} onClick={() => setActiveUserFilter('new')}>
                                    <span className="flex items-center"><UserPlus className="mr-2 h-4 w-4"/>New Users</span>
                                </Button>
                            </>
                           )}
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                  <ScrollArea className="h-full max-h-[calc(100vh-26rem)] pr-4">
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
                                <Button variant="ghost" size="icon" onClick={() => setInput(prev => `${prev} @${user.username} `)}>
                                    <AtSign className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                         {filteredUsers.length === 0 && (
                              <div className="text-center text-muted-foreground pt-10">
                                  <p>No users found for this filter.</p>
                              </div>
                          )}
                        </div>
                   </ScrollArea>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
