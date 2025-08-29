
'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Mail,
  Smartphone,
  User as UserIcon,
  Phone,
  CheckCircle,
  ShieldCheck,
  CalendarDays,
  UserCog,
  DollarSign,
  CheckCheck,
  Settings,
  MoreVertical,
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

const StatCard = ({ title, value, percentage, icon: Icon }: { title: string, value: string, percentage: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{percentage}</p>
        </CardContent>
    </Card>
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
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to All Users
      </Link>
      
      <Card>
        <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 text-3xl">
                    <AvatarFallback>{profile.firstName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-sm text-muted-foreground"># {user.uid.slice(0, 15)}... <Copy className="h-3 w-3 inline cursor-pointer" onClick={() => copyToClipboard(user.uid)} /></p>

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
                                <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyToClipboard(`${profile.countryCode} ${profile.mobileNumber}`)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Settings className="mr-2 h-4 w-4"/>Actions</Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="p-2 justify-center bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-4 w-4 mr-2"/>Active</Badge>
            <Badge variant="outline" className="p-2 justify-center"><UserCog className="h-4 w-4 mr-2"/>{profile.role}</Badge>
            <Badge variant="outline" className="p-2 justify-center bg-red-100 text-red-800 border-red-200"><ShieldCheck className="h-4 w-4 mr-2"/>KYC: Not Started</Badge>
            <Badge variant="outline" className="p-2 justify-center"><CalendarDays className="h-4 w-4 mr-2"/>Joined {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}</Badge>
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
                  <StatCard title="Total Volume" value="$4,523.89" percentage="+20.1% from last month" icon={DollarSign}/>
                  <StatCard title="Successful Transactions" value="+235" percentage="+18.1% from last month" icon={CheckCheck}/>
                  <StatCard title="Success Rate" value="98.5%" percentage="+1.2% from last month" icon={CheckCircle}/>
                  <StatCard title="Last Transaction" value="2d ago" percentage="on 8/3/2025" icon={CalendarDays}/>
               </div>
            </TabsContent>
            <TabsContent value="transactions">
                <p className="text-muted-foreground">Transactions data will be displayed here.</p>
            </TabsContent>
        </Tabs>
    </div>
  );
}
