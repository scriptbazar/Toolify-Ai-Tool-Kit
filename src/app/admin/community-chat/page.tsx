
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Diamond, RefreshCw, UserPlus, Users, Vote, Wifi } from 'lucide-react';

const messages = [
    { from: 'AA', text: 'Welcome to the community chat! What can I help you with today?', type: 'assistant' as const },
    { from: 'SB', text: 'hello', type: 'user' as const },
    { from: 'A', text: 'Sorry, I encountered an error. Please try again.', type: 'assistant' as const, error: true },
    { from: 'SB', text: 'Sorry, I encountered an error. Please try again.', type: 'user' as const },
    { from: 'A', text: 'Sorry, I encountered an error. Please try again.', type: 'assistant' as const, error: true },
    { from: 'SB', text: 'haal', type: 'user' as const },
];

const liveUsers = [
    { initials: 'GK', name: 'Ganesh Kumar', online: true },
    { initials: 'SB', name: 'Script Bazar', online: true },
];

const newUsers = [
    { initials: 'JD', name: 'John Doe', online: false },
]

export default function CommunityChatPage() {
    const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="lg:col-span-2 flex flex-col h-full">
         <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>Community Chat</CardTitle>
            <p className="text-muted-foreground text-sm">
                Chat with other members and our AI assistant.
            </p>
          </CardHeader>
          <CardContent className="flex-grow p-0">
             <ScrollArea className="h-full max-h-[calc(100vh-22rem)] p-6">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-3", msg.type === 'user' ? 'flex-row-reverse' : '')}>
                            <Avatar>
                                <AvatarFallback>{msg.from}</AvatarFallback>
                            </Avatar>
                             <div className={cn("rounded-lg px-4 py-2 max-w-sm", msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                               <p>{msg.text}</p>
                            </div>
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
          <CardFooter className="p-4 border-t">
            <div className="relative w-full">
                <Input placeholder="Type your message..." className="pr-12 h-12"/>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Diamond className="h-5 w-5"/>
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="lg:col-span-1 h-full">
         <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Community Members</CardTitle>
                 <p className="text-muted-foreground text-sm">
                    See which members are active.
                </p>
                 <div className="grid grid-cols-2 gap-1">
                    <Button variant="outline">
                        <Users className="mr-2 h-4 w-4" /> All Members
                    </Button>
                    <Button variant="outline">
                        <Vote className="mr-2 h-4 w-4" /> Create Poll
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="w-full">
                    <div className="grid w-full grid-cols-2 gap-1 mb-4">
                        <Button variant={activeTab === 'live' ? 'default' : 'outline'} onClick={() => setActiveTab('live')}>
                            <Wifi className="mr-2 h-4 w-4"/>Live Users
                        </Button>
                        <Button variant={activeTab === 'new' ? 'default' : 'outline'} onClick={() => setActiveTab('new')}>
                            <UserPlus className="mr-2 h-4 w-4"/>New Users
                        </Button>
                    </div>
                    {activeTab === 'live' && (
                        <div className="space-y-4">
                        {liveUsers.map(user => (
                            <div key={user.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{user.initials}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                {user.online && <Badge className="bg-green-500 hover:bg-green-600 text-white">online</Badge>}
                            </div>
                        ))}
                        </div>
                    )}
                    {activeTab === 'new' && (
                         <div className="space-y-4">
                        {newUsers.map(user => (
                            <div key={user.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{user.initials}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                 </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
