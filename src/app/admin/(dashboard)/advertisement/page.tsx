

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Ban, Edit, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { AdvertisementSettings, ManualAdSlot } from '@/ai/flows/settings-management.types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const defaultManualAdSlots: ManualAdSlot[] = [
    { id: 'site-header-banner', name: 'Site-wide: Header Banner', code: '' },
    { id: 'homepage-banner-top', name: 'Homepage: Top Banner', code: '' },
    { id: 'homepage-banner-bottom', name: 'Homepage: Bottom Banner', code: '' },
    { id: 'toolpage-sidebar', name: 'Tool Page: Sidebar', code: '' },
    { id: 'toolpage-banner-top', name: 'Tool Page: Top Banner', code: '' },
    { id: 'toolpage-banner-bottom', name: 'Tool Page: Bottom Banner', code: '' },
    { id: 'toolpage-in-description', name: 'Tool Page: In-description Ad', code: '' },
    { id: 'blog-post-sidebar', name: 'Blog Post: Sidebar', code: '' },
    { id: 'blog-post-in-content', name: 'Blog Post: In-content Ad', code: '' },
];


export default function AdvertisementPage() {
  const [settings, setSettings] = useState<AdvertisementSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const appSettings = await getSettings();
        // Ensure manualAdSlots are populated even if they don't exist in Firestore
        const adSettings = appSettings.advertisement || {};
        const existingSlots = adSettings.manualAdSlots || [];
        const mergedSlots = defaultManualAdSlots.map(defaultSlot => {
          const existing = existingSlots.find(s => s.id === defaultSlot.id);
          return existing ? { ...defaultSlot, ...existing } : defaultSlot;
        });

        setSettings({
            ...adSettings,
            manualAdSlots: mergedSlots,
        });

      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load advertisement settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleManualAdSlotChange = (id: string, code: string) => {
    if (!settings) return;
    const updatedSlots = settings.manualAdSlots?.map(slot => 
        slot.id === id ? { ...slot, code } : slot
    );
    setSettings(prev => prev ? { ...prev, manualAdSlots: updatedSlots } : null);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings({ advertisement: settings });
      toast({
        title: 'Success!',
        description: 'Advertisement settings have been saved.',
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advertisement Management</h1>
        <p className="text-muted-foreground">
          Manage and place ads across your application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ad Configuration</CardTitle>
            <CardDescription>
              Choose your ad strategy. Ads are disabled by default.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
                value={settings.adType} 
                onValueChange={(value) => setSettings(prev => prev ? { ...prev, adType: value as any } : null)} 
                className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:bg-muted">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="flex items-center gap-3 w-full cursor-pointer">
                   <Ban className="h-5 w-5"/>
                   <div>
                      <p className="font-semibold">Disable All Ads</p>
                      <p className="text-sm text-muted-foreground">No ads will be shown anywhere on the site.</p>
                   </div>
                </Label>
              </div>
               <div className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:bg-muted">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="flex items-center gap-3 w-full cursor-pointer">
                  <Bot className="h-5 w-5"/>
                   <div>
                      <p className="font-semibold">Auto Ads (e.g., AdSense)</p>
                      <p className="text-sm text-muted-foreground">Let the ad provider place ads automatically.</p>
                   </div>
                </Label>
              </div>
               <div className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:bg-muted">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex items-center gap-3 w-full cursor-pointer">
                  <Edit className="h-5 w-5"/>
                   <div>
                      <p className="font-semibold">Manual Ad Slots</p>
                      <p className="text-sm text-muted-foreground">Place ad code in specific, predefined locations.</p>
                   </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Audience Settings</CardTitle>
            <CardDescription>
              Customize ad visibility for different user groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="pro-user-ads" className="text-base">
                  Show Ads to Pro Users
                </Label>
                <p className="text-sm text-muted-foreground">
                  By default, Pro users do not see ads. Enable this to show ads to them.
                </p>
              </div>
              <Switch 
                id="pro-user-ads" 
                checked={settings.showAdsForPro}
                onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, showAdsForPro: checked } : null)}
              />
            </div>
          </CardContent>
        </Card>

        {settings.adType === 'auto' && (
           <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Auto Ads Script</CardTitle>
                <CardDescription>
                  Paste your ad script here. It will be added to your site's header.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                    id="auto-ads-script"
                    placeholder='<script async src="..."></script>'
                    value={settings.autoAdsScript || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, autoAdsScript: e.target.value } : null)}
                    className="min-h-[150px] font-mono"
                  />
              </CardContent>
            </Card>
          </div>
        )}
        
        {settings.adType === 'manual' && (
           <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>Manual Ad Slots</CardTitle>
                <CardDescription>
                  Place specific ads in predefined locations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settings.manualAdSlots?.map((slot) => (
                    <div key={slot.id} className="space-y-2">
                      <Label htmlFor={`manual-ad-${slot.id}`}>{slot.name}</Label>
                      <Textarea
                        id={`manual-ad-${slot.id}`}
                        placeholder={`Paste ad code for ${slot.name}`}
                        value={slot.code || ''}
                        onChange={(e) => handleManualAdSlotChange(slot.id, e.target.value)}
                        className="min-h-[100px] font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
           </div>
        )}
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Ad Settings
        </Button>
      </div>
    </div>
  );
}
