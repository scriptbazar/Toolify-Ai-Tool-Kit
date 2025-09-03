
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, PanelLeft, Newspaper, Package, Megaphone, Tv, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { type SidebarSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';

const initialSettings: SidebarSettings = {
  toolSidebar: {
    showPopularTools: true,
    showRecentPosts: true,
    showAdvertisement: true,
  },
  blogSidebar: {
    showPopularTools: true,
    showRecentPosts: true,
    showCategories: true,
    showAdvertisement: true,
  }
};

export default function SidebarManagementPage() {
  const [settings, setSettings] = useState<SidebarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const appSettings = await getSettings();
        const sidebarSettings = appSettings.sidebar || {};
        setSettings({
            toolSidebar: { ...initialSettings.toolSidebar, ...sidebarSettings.toolSidebar },
            blogSidebar: { ...initialSettings.blogSidebar, ...sidebarSettings.blogSidebar },
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load sidebar settings.',
          variant: 'destructive',
        });
        setSettings(initialSettings);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);
  
  const handleSwitchChange = (sidebar: 'toolSidebar' | 'blogSidebar', field: string, value: boolean) => {
    setSettings(prev => {
        if (!prev) return null;
        const newSettings = { ...prev };
        (newSettings[sidebar] as any)[field] = value;
        return newSettings;
    });
  };
  
  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const result = await updateSettings({ sidebar: settings });
      if (result.success) {
        toast({
            title: 'Success!',
            description: 'Sidebar settings have been saved.',
        });
      } else {
        throw new Error(result.message);
      }
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

  const WidgetToggle = ({ id, label, description, checked, onCheckedChange, icon: Icon }: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    icon: React.ElementType;
  }) => (
     <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-4">
            <Icon className="h-5 w-5 text-muted-foreground"/>
            <div className="space-y-0.5">
                <Label htmlFor={id} className="text-base">
                    {label}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
        <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
        />
    </div>
  );

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Sidebar Management</h1>
            <p className="text-muted-foreground">
                Control the widgets displayed on your Tool and Blog page sidebars.
            </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package/>Tool Page Sidebar</CardTitle>
                <CardDescription>Manage widgets on individual tool pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <WidgetToggle 
                    id="tool-popular-tools"
                    label="Show Popular Tools"
                    description="Display a list of the most used tools."
                    checked={settings.toolSidebar?.showPopularTools || false}
                    onCheckedChange={(checked) => handleSwitchChange('toolSidebar', 'showPopularTools', checked)}
                    icon={Tv}
                />
                 <WidgetToggle 
                    id="tool-recent-posts"
                    label="Show Recent Posts"
                    description="Display a list of recent blog posts."
                    checked={settings.toolSidebar?.showRecentPosts || false}
                    onCheckedChange={(checked) => handleSwitchChange('toolSidebar', 'showRecentPosts', checked)}
                    icon={Newspaper}
                />
                 <WidgetToggle 
                    id="tool-advertisement"
                    label="Show Advertisement"
                    description="Display an ad slot in the sidebar."
                    checked={settings.toolSidebar?.showAdvertisement || false}
                    onCheckedChange={(checked) => handleSwitchChange('toolSidebar', 'showAdvertisement', checked)}
                    icon={Megaphone}
                />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Newspaper/>Blog Page Sidebar</CardTitle>
                <CardDescription>Manage widgets on individual blog post pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <WidgetToggle 
                    id="blog-popular-tools"
                    label="Show Popular Tools"
                    description="Display a list of the most used tools."
                    checked={settings.blogSidebar?.showPopularTools || false}
                    onCheckedChange={(checked) => handleSwitchChange('blogSidebar', 'showPopularTools', checked)}
                    icon={Tv}
                />
                 <WidgetToggle 
                    id="blog-recent-posts"
                    label="Show Recent Posts"
                    description="Display a list of recent blog posts."
                    checked={settings.blogSidebar?.showRecentPosts || false}
                    onCheckedChange={(checked) => handleSwitchChange('blogSidebar', 'showRecentPosts', checked)}
                    icon={Newspaper}
                />
                 <WidgetToggle 
                    id="blog-categories"
                    label="Show Categories"
                    description="Display a list of blog post categories."
                    checked={settings.blogSidebar?.showCategories || false}
                    onCheckedChange={(checked) => handleSwitchChange('blogSidebar', 'showCategories', checked)}
                    icon={List}
                />
                 <WidgetToggle 
                    id="blog-advertisement"
                    label="Show Advertisement"
                    description="Display an ad slot in the sidebar."
                    checked={settings.blogSidebar?.showAdvertisement || false}
                    onCheckedChange={(checked) => handleSwitchChange('blogSidebar', 'showAdvertisement', checked)}
                    icon={Megaphone}
                />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
