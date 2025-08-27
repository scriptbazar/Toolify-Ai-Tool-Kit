
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, UploadCloud, Image as ImageIcon, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { GeneralSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const appSettings = await getSettings();
        setSettings(appSettings.general || {
            siteTitle: '',
            slogan: '',
            siteDescription: '',
            metaKeywords: '',
            copyrightText: '',
            logoUrl: '',
            faviconUrl: '',
            contactEmail: ''
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load site settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings({ general: settings });
      toast({
        title: 'Success!',
        description: 'Site settings have been saved.',
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your application's general settings and appearance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your site's title, description, and other general information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input 
                id="siteTitle" 
                name="siteTitle"
                value={settings.siteTitle} 
                onChange={handleInputChange}
                placeholder="e.g., ToolifyAI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan</Label>
              <Input 
                id="slogan"
                name="slogan" 
                value={settings.slogan}
                onChange={handleInputChange}
                placeholder="e.g., Your All-in-One Smart Toolkit"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea 
                id="siteDescription" 
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                placeholder="A brief description of your site." 
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Textarea 
                id="metaKeywords" 
                name="metaKeywords"
                value={settings.metaKeywords}
                onChange={handleInputChange}
                placeholder="e.g., ai tools, productivity, seo" 
                className="min-h-[100px]"
              />
               <p className="text-sm text-muted-foreground">Separate keywords with commas.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input 
                id="copyrightText" 
                name="copyrightText"
                value={settings.copyrightText} 
                onChange={handleInputChange}
                placeholder="e.g., © 2024 Your Company. All rights reserved."
              />
              <p className="text-sm text-muted-foreground">Use {'{year}'} to automatically insert the current year.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding &amp; Contact</CardTitle>
          <CardDescription>
            Customize your site's appearance and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-lg border bg-muted">
                    {settings.logoUrl ? <Image src={settings.logoUrl} alt="Logo Preview" width={64} height={64} className="object-contain" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                </div>
                <Button variant="outline" type="button">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Logo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Recommended size: 256x256 pixels.</p>
            </div>
             <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-lg border bg-muted">
                    {settings.faviconUrl ? <Image src={settings.faviconUrl} alt="Favicon Preview" width={64} height={64} className="object-contain" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                </div>
                <Button variant="outline" type="button">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Favicon
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Must be a .ico or .png file. Recommended size: 32x32 pixels.</p>
            </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
               <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="contactEmail" 
                    name="contactEmail"
                    type="email"
                    value={settings.contactEmail || ''} 
                    onChange={handleInputChange}
                    placeholder="e.g., contact@toolifyai.com"
                    className="pl-10"
                />
               </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
