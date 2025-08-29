
'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  MoreVertical,
  Mail,
  Phone,
  Building,
  User,
  ShieldCheck,
  Calendar,
  Copy,
  LayoutGrid,
  CreditCard,
  Landmark,
  Wallet,
  DollarSign,
  BarChart,
  CalendarDays,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';


export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 text-3xl">
            <AvatarFallback>G</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Ganesh Kumar</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span># UVPAYM19117844</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy('UVPAYM19117844')}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
           <Card>
             <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
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
                        <Label htmlFor="userName">Username</Label>
                        <Input id="userName" defaultValue="ganesh" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="pappu@gmail.com" disabled />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="Admin" disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input id="status" defaultValue="Active" disabled />
                    </div>
                </div>
             </CardContent>
           </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
           <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
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
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="enable-2fa" className="text-base font-medium">Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                      </div>
                      <Switch id="enable-2fa" checked={enable2FA} onCheckedChange={setEnable2FA} />
                    </div>
                    {enable2FA && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 pt-4 border-l-2 ml-6">
                           <div className="flex items-center space-x-3">
                                <Checkbox id="2fa-email" checked={true} disabled/>
                                <Label htmlFor="2fa-email" className="flex items-center gap-2 font-normal cursor-pointer"><Mail className="h-4 w-4"/> Email Authentication</Label>
                            </div>
                           <div className="flex items-center space-x-3">
                                <Checkbox id="2fa-app" />
                                <Label htmlFor="2fa-app" className="flex items-center gap-2 font-normal cursor-pointer"><Smartphone className="h-4 w-4"/> Authenticator App</Label>
                            </div>
                           <div className="space-y-2 col-span-1 md:col-span-2">
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="2fa-mobile"/>
                                    <Label htmlFor="2fa-mobile" className="flex items-center gap-2 font-normal cursor-pointer"><Phone className="h-4 w-4"/> Mobile Number (SMS)</Label>
                                </div>
                                <Input placeholder="Enter mobile number for verification" className="mt-2"/>
                           </div>
                        </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
