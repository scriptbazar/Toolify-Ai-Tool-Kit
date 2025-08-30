
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
  Edit,
  Lock,
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
import { useRouter } from 'next/navigation';


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


export default function UserProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
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
            description: "Could not load your profile.",
            variant: "destructive",
          });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, router]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `Copied: ${text}` });
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
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back To Dashboard
      </Link>
      
      <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 text-3xl">
                    <AvatarFallback>{profile.firstName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">{profile.firstName} {profile.lastName}</h2>
                    
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                 <Button asChild className="flex-1">
                      <Link href={`/admin/users/${user.uid}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </Link>
                    </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/admin/users/${user.uid}`}>
                    <Lock className="mr-2 h-4 w-4" /> Change Password
                  </Link>
                </Button>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="p-2 justify-center bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-4 w-4 mr-2"/>Active</Badge>
            <Badge variant="outline" className="p-2 justify-center"><UserIcon className="h-4 w-4 mr-2"/>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</Badge>
            <Badge variant="outline" className="p-2 justify-center">
                <CalendarDays className="h-4 w-4 mr-2"/>Joined {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}
            </Badge>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
