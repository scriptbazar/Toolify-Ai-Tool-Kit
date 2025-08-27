
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Ban, Edit, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdvertisementPage() {
  const [adType, setAdType] = useState('none');
  const [autoAdsScript, setAutoAdsScript] = useState('');
  const [showAdsForPro, setShowAdsForPro] = useState(false);

  const manualAdSlots = [
    { id: 'homepage-banner-top', name: 'Homepage: Top Banner' },
    { id: 'toolpage-sidebar', name: 'Tool Page: Sidebar' },
    { id: 'homepage-banner-bottom', name: 'Homepage: Bottom Banner' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advertisement Management</h1>
        <p className="text-muted-foreground">
          Manage and place ads across your application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Configuration</CardTitle>
              <CardDescription>
                Choose your ad strategy. Ads are disabled by default.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={adType} onValueChange={setAdType} className="space-y-4">
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
          
          <div className={cn('transition-opacity duration-300', adType !== 'auto' && 'opacity-50 pointer-events-none hidden')}>
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
                    value={autoAdsScript}
                    onChange={(e) => setAutoAdsScript(e.target.value)}
                    className="min-h-[150px] font-mono"
                    disabled={adType !== 'auto'}
                  />
              </CardContent>
            </Card>
          </div>
          
           <div className={cn('transition-opacity duration-300', adType !== 'manual' && 'opacity-50 pointer-events-none hidden')}>
             <Card>
              <CardHeader>
                <CardTitle>Manual Ad Slots</CardTitle>
                <CardDescription>
                  Place specific ads in predefined locations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {manualAdSlots.map((slot) => (
                  <div key={slot.id}>
                    <Label htmlFor={`manual-ad-${slot.id}`}>{slot.name}</Label>
                    <Textarea
                      id={`manual-ad-${slot.id}`}
                      placeholder={`Paste ad code for ${slot.name}`}
                      className="min-h-[100px] font-mono text-xs"
                       disabled={adType !== 'manual'}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
           </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
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
                  checked={showAdsForPro}
                  onCheckedChange={setShowAdsForPro}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Ad Settings
        </Button>
      </div>
    </div>
  );
}
