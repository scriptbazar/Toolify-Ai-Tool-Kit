
'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                   <Avatar className="h-40 w-40 text-6xl">
                     <AvatarFallback>G</AvatarFallback>
                   </Avatar>
                   <Button variant="outline" className="w-full">
                       <UploadCloud className="mr-2 h-4 w-4" />
                       Upload Profile
                   </Button>
                </CardContent>
             </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue="Ganesh" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue="Kumar" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" defaultValue="GK48605@GMAIL.COM" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="userName">Username</Label>
                            <Input id="userName" defaultValue="Ganesh76" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber">Mobile Number</Label>
                            <Input id="mobileNumber" placeholder="Enter mobile number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="countryCode">Country Code</Label>
                            <Input id="countryCode" placeholder="e.g., +91" />
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
                        <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="Confirm new password" />
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="enable-2fa" className="text-base font-medium">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <Switch id="enable-2fa" checked={enable2FA} onCheckedChange={setEnable2FA} />
                </div>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}
