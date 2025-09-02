
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, GitCommitVertical, Percent, Calendar, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { type ReferralSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';

const initialSettings: ReferralSettings = {
  isReferralEnabled: true,
  commissionRate: 20,
  cookieDuration: 30,
  payoutThreshold: 50,
  isMultiLevel: false,
  referralProgramDescription: 'Earn a commission for every new paying customer you refer. Payments are made monthly via PayPal.',
};

export default function AffiliateSettingsPage() {
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const appSettings = await getSettings();
        setSettings({ ...initialSettings, ...(appSettings.referral || {}) });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load affiliate settings.',
          variant: 'destructive',
        });
        setSettings(initialSettings);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);
  
  const handleInputChange = (field: keyof ReferralSettings, value: string | number | boolean) => {
    setSettings(prev => (prev ? { ...prev, [field]: value } : null));
  };
  
  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const result = await updateSettings({ referral: settings });
      if (result.success) {
        toast({
            title: 'Success!',
            description: 'Affiliate settings have been saved.',
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

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Settings</h1>
        <p className="text-muted-foreground">
          Configure and manage your affiliate marketing program.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitCommitVertical />General Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isReferralEnabled" className="text-base">
                Enable Affiliate Program
              </Label>
              <p className="text-sm text-muted-foreground">
                Globally enable or disable the affiliate system for all users.
              </p>
            </div>
            <Switch
              id="isReferralEnabled"
              checked={settings.isReferralEnabled}
              onCheckedChange={(checked) => handleInputChange('isReferralEnabled', checked)}
            />
          </div>
          
          {settings.isReferralEnabled && (
            <div className="space-y-6 animate-in fade-in-0 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="commissionRate" className="flex items-center gap-2"><Percent className="w-4 h-4" />Commission Rate (%)</Label>
                        <Input
                            id="commissionRate"
                            type="number"
                            value={settings.commissionRate}
                            onChange={(e) => handleInputChange('commissionRate', Number(e.target.value))}
                            placeholder="e.g., 20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cookieDuration" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Cookie Duration (Days)</Label>
                        <Input
                            id="cookieDuration"
                            type="number"
                            value={settings.cookieDuration}
                            onChange={(e) => handleInputChange('cookieDuration', Number(e.target.value))}
                            placeholder="e.g., 30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payoutThreshold" className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Payout Threshold ($)</Label>
                        <Input
                            id="payoutThreshold"
                            type="number"
                            value={settings.payoutThreshold}
                            onChange={(e) => handleInputChange('payoutThreshold', Number(e.target.value))}
                            placeholder="e.g., 50"
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <Label htmlFor="isMultiLevel" className="flex items-center gap-2"><Users className="w-4 h-4" />Enable Multi-level Referrals</Label>
                    <p className="text-sm text-muted-foreground">
                        Allow affiliates to earn commissions from users they refer (Tier 2).
                    </p>
                    </div>
                    <Switch
                    id="isMultiLevel"
                    checked={settings.isMultiLevel}
                    onCheckedChange={(checked) => handleInputChange('isMultiLevel', checked)}
                    disabled
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="referralProgramDescription">Program Description for Users</Label>
                    <Textarea
                        id="referralProgramDescription"
                        value={settings.referralProgramDescription || ''}
                        onChange={(e) => handleInputChange('referralProgramDescription', e.target.value)}
                        placeholder="Describe how your affiliate program works..."
                        className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">This description will be shown to users on their affiliate program page.</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      
       <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
