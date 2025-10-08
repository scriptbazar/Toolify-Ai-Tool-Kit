
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Lock,
  Loader2,
  MailCheck,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, updatePassword, type User as FirebaseUser } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { Combobox } from '@/components/ui/combobox';
import { sendPasswordChangeEmail } from '@/ai/flows/send-email';
import { updateUserProfile } from '@/ai/flows/user-management';
import { useParams, useRouter } from 'next/navigation';


interface UserProfile {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobileNumber?: string;
  countryCode?: string;
  enable2FA?: boolean;
  twoFactorAuthMethods?: {
    email?: boolean;
    authenticatorApp?: boolean;
    mobileNumber?: boolean;
  };
}

const TwoFactorAuthOptionCard = ({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <div
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 cursor-pointer transition-all',
        checked ? 'border-primary bg-primary/5' : 'border-muted bg-transparent hover:bg-muted/50'
      )}
    >
      <Icon className={cn("h-8 w-8", checked ? 'text-primary' : 'text-muted-foreground')} />
      <span className="font-medium text-center">{label}</span>
      <Checkbox checked={checked} className="sr-only" />
    </div>
  );
};


export default function EditUserDetailPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
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
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prev => prev ? { ...prev, [id]: value } : null);
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setProfile(prev => prev ? { ...prev, [id]: value } : null);
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
     setProfile(prev => prev ? { ...prev, [id]: checked } : null);
  };
  
  const handle2faMethodChange = (method: 'email' | 'authenticatorApp' | 'mobileNumber', checked: boolean) => {
     setProfile(prev => {
        if (!prev) return null;
        return {
            ...prev,
            twoFactorAuthMethods: {
                ...(prev.twoFactorAuthMethods || {}),
                [method]: checked,
            }
        }
     });
  };

  const handleSaveChanges = async () => {
    if (!user || !profile) return;

    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await updateUserProfile(user.uid, profile);
      if (!result.success) {
        throw new Error(result.message);
      }
      
      if (newPassword && user) {
        await updatePassword(user, newPassword);
        await sendPasswordChangeEmail({
          to: profile.email,
          name: profile.firstName,
        });
        setNewPassword('');
        setConfirmPassword('');
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });

    } catch (error: any) {
       toast({
        title: "Update Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading || !profile) {
    return <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
            <div className="lg:col-span-2"><Skeleton className="h-64 w-full" /></div>
        </div>
        <Skeleton className="h-64 w-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back To Dashboard
      </Link>
      
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
                <X className="mr-2 h-4 w-4"/>
                Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
             <Card className="h-full">
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                   <Avatar className="h-40 w-40 text-6xl">
                     <AvatarFallback>{profile.firstName?.[0]?.toUpperCase()}</AvatarFallback>
                   </Avatar>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                   <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                       <UploadCloud className="mr-2 h-4 w-4" />
                       Upload Profile
                   </Button>
                </CardContent>
             </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={profile.firstName || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={profile.lastName || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={profile.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="userName">Username</Label>
                            <Input id="userName" value={profile.userName || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="countryCode">Country Code</Label>
                           <Combobox
                                items={countries.map(country => ({
                                    value: country.dial_code,
                                    label: `${country.flag} ${country.name} (${country.dial_code})`,
                                }))}
                                value={profile.countryCode || ''}
                                onValueChange={(value) => handleSelectChange('countryCode', value)}
                                placeholder="Select country..."
                                searchPlaceholder="Search country..."
                                notFoundMessage="No country found."
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mobileNumber">Mobile Number</Label>
                          <Input id="mobileNumber" value={profile.mobileNumber || ''} onChange={handleInputChange} placeholder="Enter mobile number" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

       <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Manage your password and two-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
             <div>
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                        <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                        <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                         <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="enable2FA" className="text-base font-medium">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <Switch id="enable2FA" checked={profile.enable2FA || false} onCheckedChange={(checked) => handleSwitchChange('enable2FA', checked)} />
                </div>
                
                 {profile.enable2FA && (
                    <Card className="p-4">
                        <Label className="text-base font-medium">Enabled 2FA Methods</Label>
                        <p className="text-sm text-muted-foreground mb-4">Click on a card to enable or disable a method. At least one method must be selected.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <TwoFactorAuthOptionCard 
                                icon={MailCheck}
                                label="Email Authentication"
                                checked={profile.twoFactorAuthMethods?.email || false}
                                onCheckedChange={(checked) => handle2faMethodChange('email', checked)}
                            />
                            <TwoFactorAuthOptionCard 
                                icon={Smartphone}
                                label="Authenticator App"
                                checked={profile.twoFactorAuthMethods?.authenticatorApp || false}
                                onCheckedChange={(checked) => handle2faMethodChange('authenticatorApp', checked)}
                            />
                            <TwoFactorAuthOptionCard 
                                icon={MessageSquare}
                                label="Mobile Number (SMS)"
                                checked={profile.twoFactorAuthMethods?.mobileNumber || false}
                                onCheckedChange={(checked) => handle2faMethodChange('mobileNumber', checked)}
                            />
                        </div>
                        {profile.twoFactorAuthMethods?.mobileNumber && !profile.mobileNumber && (
                          <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4"/>
                            <span>Please add and verify your mobile number in 'Personal Information' to use SMS-based authentication.</span>
                          </div>
                        )}
                    </Card>
                )}
             </div>
          </CardContent>
       </Card>
    </div>
  );
}

    