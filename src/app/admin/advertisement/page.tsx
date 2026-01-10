

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Ban, Bot, Edit, Loader2, SlidersHorizontal, Code, ChevronDown, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { AdvertisementSettings, ManualAdSlot } from '@/ai/flows/settings-management.types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const defaultManualAdSlots: { group: string, slots: ManualAdSlot[] }[] = [
    {
        group: 'Homepage',
        slots: [
            { id: 'homepage-banner-top', name: 'Top Banner', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'homepage-banner-bottom', name: 'Bottom Banner', code: '', showOn: { desktop: true, mobile: true } },
        ]
    },
    {
        group: 'Tool Page',
        slots: [
            { id: 'toolpage-sidebar', name: 'Sidebar Ad', code: '', showOn: { desktop: true, mobile: false } },
            { id: 'toolpage-banner-top', name: 'Top Banner', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'toolpage-in-description', name: 'In-description Ad', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'toolpage-banner-bottom', name: 'Bottom Banner (After Content)', code: '', showOn: { desktop: true, mobile: true } },
        ]
    },
     {
        group: 'Blog Page',
        slots: [
            { id: 'blog-post-sidebar', name: 'Sidebar Ad', code: '', showOn: { desktop: true, mobile: false } },
            { id: 'blog-post-banner-top', name: 'Top Banner', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'blog-post-in-content-start', name: 'In-content Ad (Start)', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'blog-post-in-content-end', name: 'In-content Ad (End)', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'blog-post-banner-bottom', name: 'Bottom Banner', code: '', showOn: { desktop: true, mobile: true } },
        ]
    },
    {
        group: 'Site-wide',
        slots: [
            { id: 'site-header-banner', name: 'Header Banner', code: '', showOn: { desktop: true, mobile: true } },
            { id: 'footer-banner', name: 'Footer Banner', code: '', showOn: { desktop: true, mobile: true } },
        ]
    }
];


export default function AdvertisementPage() {
  const [settings, setSettings] = useState<AdvertisementSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const appSettings = await getSettings();
        const adSettings = appSettings.advertisement || {};
        const existingSlots = adSettings.manualAdSlots || [];
        
        const allDefaultSlots = defaultManualAdSlots.flatMap(group => group.slots);

        // Merge existing settings with defaults
        const mergedSlots = allDefaultSlots.map(defaultSlot => {
            const existingSlot = existingSlots.find(s => s.id === defaultSlot.id);
            return existingSlot ? { ...defaultSlot, ...existingSlot, showOn: { ...defaultSlot.showOn, ...existingSlot.showOn } } : defaultSlot;
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
  
  const handleToggle = (id: string) => {
    setOpenCollapsible(prevId => (prevId === id ? null : id));
  };

  const handleManualAdSlotChange = (id: string, field: 'code' | 'showOn.desktop' | 'showOn.mobile', value: string | boolean) => {
    if (!settings) return;
    const updatedSlots = settings.manualAdSlots?.map(slot => {
        if (slot.id === id) {
            const newSlot = { ...slot };
            if (field === 'code') {
                newSlot.code = value as string;
            } else if (field === 'showOn.desktop') {
                newSlot.showOn = { ...(newSlot.showOn || { desktop: true, mobile: true }), desktop: value as boolean };
            } else if (field === 'showOn.mobile') {
                newSlot.showOn = { ...(newSlot.showOn || { desktop: true, mobile: true }), mobile: value as boolean };
            }
            return newSlot;
        }
        return slot;
    });
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
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
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
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Advertisement Management</h1>
            <p className="text-muted-foreground">
            Manage and place ads across your application.
            </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
        </Button>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><SlidersHorizontal/>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
                value={settings.adType}
                onValueChange={(value) => setSettings(prev => prev ? { ...prev, adType: value as any } : null)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Label htmlFor="none" className="flex flex-col items-center justify-center gap-3 p-4 border rounded-lg has-[[data-state=checked]]:bg-muted has-[[data-state=checked]]:border-primary cursor-pointer transition-all">
                <RadioGroupItem value="none" id="none" className="sr-only" />
                <Ban className="h-8 w-8"/>
                <p className="font-semibold">Disable All Ads</p>
              </Label>
              <Label htmlFor="auto" className="flex flex-col items-center justify-center gap-3 p-4 border rounded-lg has-[[data-state=checked]]:bg-muted has-[[data-state=checked]]:border-primary cursor-pointer transition-all">
                <RadioGroupItem value="auto" id="auto" className="sr-only" />
                <Bot className="h-8 w-8"/>
                <p className="font-semibold">Auto Ads (e.g., AdSense)</p>
              </Label>
               <Label htmlFor="manual" className="flex flex-col items-center justify-center gap-3 p-4 border rounded-lg has-[[data-state=checked]]:bg-muted has-[[data-state=checked]]:border-primary cursor-pointer transition-all">
                <RadioGroupItem value="manual" id="manual" className="sr-only" />
                <Edit className="h-8 w-8"/>
                <p className="font-semibold">Manual Ad Slots</p>
              </Label>
            </RadioGroup>
            
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
         <Card className="animate-in fade-in-0 duration-300">
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot/>Auto Ads Script</CardTitle>
            <CardDescription>
                Paste your ad script (e.g., from Google AdSense) here. It will be added to your site's header.
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
      )}

       {settings.adType === 'manual' && (
         <Card className="animate-in fade-in-0 duration-300">
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Edit/>Manual Ad Slots</CardTitle>
            <CardDescription>
                Place specific ads in predefined locations by pasting your ad code. Click on a group to expand and edit.
            </CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultManualAdSlots.map(group => (
                <Collapsible
                  key={group.group}
                  open={openCollapsible === group.group}
                  onOpenChange={() => handleToggle(group.group)}
                  className={cn(
                    "space-y-2 transition-all duration-300",
                    openCollapsible === group.group && "md:col-span-2"
                  )}
                >
                  <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 font-semibold hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                      <span>{group.group} Slots</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 p-4 pt-2 -mt-2 border-x border-b rounded-b-lg">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {group.slots.map(slot => {
                          const currentSlot = settings.manualAdSlots?.find(s => s.id === slot.id);
                          return (
                          <div key={slot.id} className="space-y-4 p-4 border rounded-lg">
                            <Label htmlFor={`manual-ad-${slot.id}`}>{slot.name}</Label>
                            <Textarea
                                id={`manual-ad-${slot.id}`}
                                placeholder={`Paste ad code for ${slot.name}`}
                                value={currentSlot?.code || ''}
                                onChange={(e) => handleManualAdSlotChange(slot.id, 'code', e.target.value)}
                                className="min-h-[100px] font-mono text-xs"
                            />
                            <div className="flex justify-between items-center pt-2 border-t">
                               <div className="flex items-center space-x-2">
                                  <Switch id={`desktop-${slot.id}`} checked={currentSlot?.showOn?.desktop ?? true} onCheckedChange={(checked) => handleManualAdSlotChange(slot.id, 'showOn.desktop', checked)} />
                                  <Label htmlFor={`desktop-${slot.id}`} className="flex items-center gap-1 text-xs"><Monitor className="h-3 w-3"/> Desktop</Label>
                               </div>
                                <div className="flex items-center space-x-2">
                                  <Switch id={`mobile-${slot.id}`} checked={currentSlot?.showOn?.mobile ?? true} onCheckedChange={(checked) => handleManualAdSlotChange(slot.id, 'showOn.mobile', checked)} />
                                  <Label htmlFor={`mobile-${slot.id}`} className="flex items-center gap-1 text-xs"><Smartphone className="h-3 w-3"/> Mobile</Label>
                               </div>
                            </div>
                          </div>  
                        )})}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
         </Card>
       )}

    </div>
  );
}
