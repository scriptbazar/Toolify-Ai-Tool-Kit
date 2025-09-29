

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, CreditCard, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { PaymentSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const initialSettings: PaymentSettings = {
  stripe: { isEnabled: false, name: 'Stripe', publishableKey: '', secretKey: '' },
  paypal: { isEnabled: false, name: 'PayPal', clientId: '', clientSecret: '', mode: 'sandbox' },
  razorpay: { isEnabled: false, name: 'Razorpay', keyId: '', keySecret: '' },
  payu: { isEnabled: false, name: 'PayU', merchantKey: '', merchantSalt: '', mode: 'test' },
  cashfree: { isEnabled: false, name: 'Cashfree', appId: '', secretKey: '', mode: 'sandbox' },
  phonepe: { isEnabled: false, name: 'PhonePe', merchantId: '', merchantUserId: '', saltKey: '', saltIndex: '', mode: 'uat' },
};

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const appSettings = await getSettings();
        // Deep merge fetched settings with initial structure to ensure all keys exist
        const fetchedPaymentSettings = appSettings.payment || {};
        const mergedSettings = {
          stripe: { ...initialSettings.stripe, ...fetchedPaymentSettings.stripe },
          paypal: { ...initialSettings.paypal, ...fetchedPaymentSettings.paypal },
          razorpay: { ...initialSettings.razorpay, ...fetchedPaymentSettings.razorpay },
          payu: { ...initialSettings.payu, ...fetchedPaymentSettings.payu },
          cashfree: { ...initialSettings.cashfree, ...fetchedPaymentSettings.cashfree },
          phonepe: { ...initialSettings.phonepe, ...fetchedPaymentSettings.phonepe },
        };
        setSettings(mergedSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load payment settings.',
          variant: 'destructive',
        });
        setSettings(initialSettings);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);
  
  const handleInputChange = (gateway: keyof PaymentSettings, field: string, value: string | boolean) => {
    setSettings(prev => {
      if (!prev) return null;
      const newSettings = { ...prev };
      (newSettings[gateway] as any)[field] = value;
      return newSettings;
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings({ payment: settings });
      toast({
        title: 'Success!',
        description: 'Payment settings have been saved.',
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

  const renderGatewayCard = (gatewayKey: keyof PaymentSettings, title: string, fields: {id: string, label: string, type?: string, placeholder?: string}[], modeOptions?: {value: string, label: string}[]) => {
    const gatewaySettings = settings ? settings[gatewayKey] : null;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
             <CreditCard className="w-5 h-5 text-muted-foreground"/>
             <CardTitle className="text-base">{title}</CardTitle>
             {gatewaySettings?.isEnabled ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Live</Badge>
             ) : (
                <Badge variant="outline">Disabled</Badge>
             )}
          </div>
          <Switch
              checked={gatewaySettings?.isEnabled || false}
              onCheckedChange={(checked) => handleInputChange(gatewayKey, 'isEnabled', checked)}
          />
        </CardHeader>
        {gatewaySettings?.isEnabled && (
            <CardContent className="space-y-4 p-4 pt-0">
            {fields.map(field => (
                <div key={field.id} className="space-y-2">
                <Label htmlFor={`${gatewayKey}-${field.id}`}>{field.label}</Label>
                <div className="relative">
                    <Input
                    id={`${gatewayKey}-${field.id}`}
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    value={(gatewaySettings as any)?.[field.id] || ''}
                    onChange={(e) => handleInputChange(gatewayKey, field.id, e.target.value)}
                    />
                </div>
                </div>
            ))}
            {modeOptions && (
                <div className="space-y-2">
                <Label>Mode</Label>
                <Select
                    value={(gatewaySettings as any)?.mode}
                    onValueChange={(value) => handleInputChange(gatewayKey, 'mode', value)}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                    {modeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            )}
            </CardContent>
        )}
      </Card>
    );
  };
  
  if (loading || !settings) {
    return (
       <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-muted-foreground">
          Manage your payment gateway integrations. Enable a gateway to allow users to purchase plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderGatewayCard('stripe', 'Stripe', [
          { id: 'publishableKey', label: 'Publishable Key', placeholder: 'pk_live_...' },
          { id: 'secretKey', label: 'Secret Key', placeholder: 'sk_live_...' },
        ])}
        
        {renderGatewayCard('paypal', 'PayPal', [
          { id: 'clientId', label: 'Client ID' },
          { id: 'clientSecret', label: 'Client Secret' },
        ], [{value: 'sandbox', label: 'Sandbox'}, {value: 'live', label: 'Live'}])}

        {renderGatewayCard('razorpay', 'Razorpay', [
          { id: 'keyId', label: 'Key ID' },
          { id: 'keySecret', label: 'Key Secret' },
        ])}

        {renderGatewayCard('payu', 'PayU', [
          { id: 'merchantKey', label: 'Merchant Key' },
          { id: 'merchantSalt', label: 'Merchant Salt' },
        ], [{value: 'test', label: 'Test'}, {value: 'live', label: 'Live'}])}
        
        {renderGatewayCard('cashfree', 'Cashfree', [
          { id: 'appId', label: 'App ID' },
          { id: 'secretKey', label: 'Secret Key' },
        ], [{value: 'sandbox', label: 'Sandbox'}, {value: 'production', label: 'Production'}])}
        
        {renderGatewayCard('phonepe', 'PhonePe', [
          { id: 'merchantId', label: 'Merchant ID' },
          { id: 'merchantUserId', label: 'Merchant User ID' },
          { id: 'saltKey', label: 'Salt Key' },
          { id: 'saltIndex', label: 'Salt Index' },
        ], [{value: 'uat', label: 'UAT (Test)'}, {value: 'production', label: 'Production'}])}
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
