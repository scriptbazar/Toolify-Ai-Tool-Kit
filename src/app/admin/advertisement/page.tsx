
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

export default function AdvertisementPage() {
  const [autoAdsEnabled, setAutoAdsEnabled] = useState(false);
  const [autoAdsScript, setAutoAdsScript] = useState('');

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
              <CardTitle>Auto Ads (e.g., Google AdSense)</CardTitle>
              <CardDescription>
                Enable Auto Ads to let Google place ads for you. Simply paste your ad script below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-ads-toggle" 
                  checked={autoAdsEnabled} 
                  onCheckedChange={setAutoAdsEnabled} 
                />
                <Label htmlFor="auto-ads-toggle">Enable Auto Ads</Label>
              </div>
              <div>
                <Label htmlFor="auto-ads-script">Ad Script Code</Label>
                <Textarea
                  id="auto-ads-script"
                  placeholder='<script async src="..."></script>'
                  value={autoAdsScript}
                  onChange={(e) => setAutoAdsScript(e.target.value)}
                  className="min-h-[150px] font-mono"
                  disabled={!autoAdsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
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
                  />
                </div>
              ))}
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
