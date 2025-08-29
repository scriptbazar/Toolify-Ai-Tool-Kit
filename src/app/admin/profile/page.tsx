
'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Mail,
  User as UserIcon,
  Phone,
  CheckCircle,
  ShieldCheck,
  CalendarDays,
  UserCog,
  Settings,
  Edit,
  History,
  Users,
  UserPlus,
  MessageSquare,
  GitCommitVertical,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface UserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobileNumber?: string;
  countryCode?: string;
  role: 'admin' | 'user';
  createdAt: {
      seconds: number;
  }
}

const StatCard = ({ title, value, percentage, icon: Icon, href }: { title: string, value: string, percentage: string, icon: React.ElementType, href: string }) => (
    <Link href={href}>
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{percentage}</p>
            </CardContent>
        </Card>
    </Link>
);

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
             setProfile(userDocSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          toast({
            title: "Error",
            description: "Could not load user profile.",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Copied to clipboard!' });
  };
  
  if (loading || !profile || !user) {
    return (
       <div className="space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                         <Skeleton className="h-24 w-24 rounded-full" />
                         <div className="space-y-2 w-full">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-6 w-3/4" />
                         </div>
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-64 w-full" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back To Dashboard
      </Link>
      
      <Card>
        <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 text-3xl">
                    <AvatarFallback>{profile.firstName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">{profile.firstName} {profile.lastName} <Badge variant="outline" className="p-1 justify-center text-sm"><UserCog className="h-3 w-3 mr-1"/>{profile.role}</Badge></h1>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>@{profile.userName}</span>
                        <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyToClipboard(profile.userName)} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4"/>
                            <span className="text-sm">{profile.email}</span>
                            <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyToClipboard(profile.email)} />
                        </div>
                        {profile.mobileNumber && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4"/>
                                <span className="text-sm">{profile.countryCode} {profile.mobileNumber}</span>
                                <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyToClipboard(`${profile.countryCode || ''} ${profile.mobileNumber}`)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Settings className="mr-2 h-4 w-4"/>Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/users/${user.uid}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <History className="mr-2 h-4 w-4" /> View Activity Log
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="p-2 justify-center bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-4 w-4 mr-2"/>Active</Badge>
            <Badge variant="outline" className="p-2 justify-center"><Briefcase className="h-4 w-4 mr-2"/>Pro Plan</Badge>
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="p-2 justify-center">
                    <CalendarDays className="h-4 w-4 mr-2"/>Joined {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}
                </Badge>
                <Badge variant="outline" className="p-2 justify-center text-xs text-muted-foreground">
                    <span className="mr-1">UID:</span> {user.uid} <Copy className="h-3 w-3 inline cursor-pointer ml-1" onClick={() => copyToClipboard(user.uid)} />
                </Badge>
            </div>
        </div>
        </CardContent>
      </Card>

        <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="wallet">Wallet Management</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard href="/admin/users?filter=all" title="Total Users" value="10,532" percentage="+5.2% from last month" icon={Users}/>
                  <StatCard href="/admin/users?filter=lead" title="Lead Users" value="1,234" percentage="+19% from last month" icon={UserPlus}/>
                  <StatCard href="/admin/users?filter=comment" title="Comment Users" value="2" percentage="+2 from last month" icon={MessageSquare}/>
                  <StatCard href="/admin/referral-management" title="Referral Users" value="573" percentage="+201 since last hour" icon={GitCommitVertical}/>
               </div>
            </TabsContent>
            <TabsContent value="transactions">
                <p className="text-muted-foreground">Transactions data will be displayed here.</p>
            </TabsContent>
             <TabsContent value="withdrawals">
                <p className="text-muted-foreground">Withdrawals data will be displayed here.</p>
            </TabsContent>
             <TabsContent value="wallet">
                <p className="text-muted-foreground">Wallet Management data will be displayed here.</p>
            </TabsContent>
        </Tabs>
    </div>
  );
}
