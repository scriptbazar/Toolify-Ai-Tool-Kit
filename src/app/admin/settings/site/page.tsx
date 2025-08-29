

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, UploadCloud, Image as ImageIcon, Mail, Facebook, Instagram, Twitter, Youtube, Code, Search, ChevronDown, ChevronUp, ShieldCheck, KeyRound, Eraser, FileCode, FileText, Smartphone, MailCheck, Power, Construction, MessageSquare, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { GeneralSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

type CollapsibleSectionProps = {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  isFullWidth: boolean;
};

const CollapsibleSection = ({ id, title, description, children, isOpen, onToggle, isFullWidth }: CollapsibleSectionProps) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle(id)}
      className={cn(
        "space-y-2 transition-all duration-300",
        isFullWidth ? "col-span-1 md:col-span-2" : "col-span-1"
      )}
    >
      <Card>
        <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    <span className="sr-only">Toggle</span>
                </Button>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <CardContent>
                {children}
            </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}


export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('general');
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
            contactEmail: '',
            socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '' },
            webmaster: { googleSearchConsole: '', googleAnalytics: '', googleAdsense: '', yandexWebmaster: '', bingWebmaster: '', pinterest: '', baidu: '', yahooSearchConsole: '' },
            security: { enableTwoFactorAuth: false, twoFactorAuthMethods: {email: true, authenticatorApp: false, mobileNumber: false}, enableRecaptcha: false, recaptchaSiteKey: '', recaptchaSecretKey: '', maintenanceMode: false, enableAccountDeletion: true },
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
  
  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => (prev ? { 
        ...prev, 
        socialLinks: {
            ...(prev.socialLinks || {}),
            [name]: value
        }
    } : null));
  };

  const handleWebmasterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => (prev ? {
      ...prev,
      webmaster: {
        ...(prev.webmaster || {}),
        [name]: value
      }
    } : null));
  };

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSettings(prev => {
        if (!prev) return null;
        const newSettings = { ...prev };
        (newSettings.security as any)[field] = value;
        return newSettings;
    });
  };
  
  const handle2faMethodChange = (method: 'email' | 'authenticatorApp' | 'mobileNumber', checked: boolean) => {
     setSettings(prev => {
        if (!prev) return null;
        return {
            ...prev,
            security: {
                ...(prev.security || {}),
                twoFactorAuthMethods: {
                    ...(prev.security?.twoFactorAuthMethods || {}),
                    [method]: checked,
                }
            }
        }
     });
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

  const handleToggle = (id: string) => {
    setOpenSection(prev => (prev === id ? null : id));
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

  const sections = [
    { id: 'general', title: 'General Settings', description: "Update your site's title, description, etc." },
    { id: 'branding', title: 'Branding & Contact', description: "Customize your site's appearance and contact info." },
    { id: 'social', title: 'Social Media Links', description: 'Provide links to your social media profiles.' },
    { id: 'webmaster', title: 'Webmaster Tools', description: 'Add verification codes for webmaster tools.' },
    { id: 'security', title: 'Security Settings', description: 'Manage site security features like 2FA and reCAPTCHA.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your application's general settings and appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <CollapsibleSection id="general" title="General Settings" description="Update your site's title, description, etc." isOpen={openSection === 'general'} onToggle={handleToggle} isFullWidth={openSection === 'general'}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteTitle">Site Title</Label>
                    <Input id="siteTitle" name="siteTitle" value={settings.siteTitle} onChange={handleInputChange} placeholder="e.g., ToolifyAI" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input id="slogan" name="slogan" value={settings.slogan} onChange={handleInputChange} placeholder="e.g., Your All-in-One Smart Toolkit" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea id="siteDescription" name="siteDescription" value={settings.siteDescription} onChange={handleInputChange} placeholder="A brief description of your site." className="min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Textarea id="metaKeywords" name="metaKeywords" value={settings.metaKeywords} onChange={handleInputChange} placeholder="e.g., ai tools, productivity, seo" className="min-h-[100px]" />
                    <p className="text-sm text-muted-foreground">Separate keywords with commas.</p>
                  </div>
                </div>
              </div>
         </CollapsibleSection>

        <CollapsibleSection id="branding" title="Branding & Contact" description="Customize your site's appearance and contact info." isOpen={openSection === 'branding'} onToggle={handleToggle} isFullWidth={openSection === 'branding'}>
            <div className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail || ''} onChange={handleInputChange} placeholder="e.g., contact@toolifyai.com" className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="copyrightText">Copyright Text</Label>
                    <Input id="copyrightText" name="copyrightText" value={settings.copyrightText} onChange={handleInputChange} placeholder="e.g., © 2024 Your Company. All rights reserved." />
                    <p className="text-sm text-muted-foreground">Use {'{year}'} to automatically insert the current year.</p>
                </div>
              </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection id="social" title="Social Media Links" description="Provide links to your social media profiles." isOpen={openSection === 'social'} onToggle={handleToggle} isFullWidth={openSection === 'social'}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="facebook" name="facebook" value={settings.socialLinks?.facebook || ''} onChange={handleSocialLinkChange} placeholder="https://facebook.com/your-page" className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter (X)</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="twitter" name="twitter" value={settings.socialLinks?.twitter || ''} onChange={handleSocialLinkChange} placeholder="https://x.com/your-profile" className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="instagram" name="instagram" value={settings.socialLinks?.instagram || ''} onChange={handleSocialLinkChange} placeholder="https://instagram.com/your-profile" className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="youtube" name="youtube" value={settings.socialLinks?.youtube || ''} onChange={handleSocialLinkChange} placeholder="https://youtube.com/your-channel" className="pl-10" />
                    </div>
                </div>
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection id="webmaster" title="Webmaster Tools" description="Add verification codes for webmaster tools." isOpen={openSection === 'webmaster'} onToggle={handleToggle} isFullWidth={openSection === 'webmaster'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="googleSearchConsole">Google Search Console</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="googleSearchConsole" name="googleSearchConsole" value={settings.webmaster?.googleSearchConsole || ''} onChange={handleWebmasterInputChange} placeholder="Verification code" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="googleAnalytics">Google Analytics</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="googleAnalytics" name="googleAnalytics" value={settings.webmaster?.googleAnalytics || ''} onChange={handleWebmasterInputChange} placeholder="Tracking ID (e.g., G-XXXXXXXXXX)" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="googleAdsense">Google AdSense</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="googleAdsense" name="googleAdsense" value={settings.webmaster?.googleAdsense || ''} onChange={handleWebmasterInputChange} placeholder="Publisher ID (e.g., pub-xxxxxxxxxxxxxxxx)" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="bingWebmaster">Bing Webmaster Tools</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="bingWebmaster" name="bingWebmaster" value={settings.webmaster?.bingWebmaster || ''} onChange={handleWebmasterInputChange} placeholder="Verification code" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="yandexWebmaster">Yandex Webmaster Tools</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="yandexWebmaster" name="yandexWebmaster" value={settings.webmaster?.yandexWebmaster || ''} onChange={handleWebmasterInputChange} placeholder="Verification code" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="baidu">Baidu Webmaster Tools</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="baidu" name="baidu" value={settings.webmaster?.baidu || ''} onChange={handleWebmasterInputChange} placeholder="Verification code" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="pinterest">Pinterest</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="pinterest" name="pinterest" value={settings.webmaster?.pinterest || ''} onChange={handleWebmasterInputChange} placeholder="Verification code" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="yahooSearchConsole">Yahoo Search Console</Label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="yahooSearchConsole" name="yahooSearchConsole" value={settings.webmaster?.yahooSearchConsole || ''} onChange={handleWebmasterInputChange} placeholder="Verification code" className="pl-10" />
                  </div>
              </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection id="security" title="Security Settings" description="Manage site security features like 2FA and reCAPTCHA." isOpen={openSection === 'security'} onToggle={handleToggle} isFullWidth={openSection === 'security'}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="enableTwoFactorAuth" className="font-medium">Enable Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">Enhance account security for all users.</p>
                        </div>
                        <Switch
                            id="enableTwoFactorAuth"
                            checked={settings.security?.enableTwoFactorAuth || false}
                            onCheckedChange={(checked) => handleSecurityChange('enableTwoFactorAuth', checked)}
                        />
                    </div>
                    <div className="flex items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="enableRecaptcha" className="font-medium">Enable Google reCAPTCHA</Label>
                            <p className="text-sm text-muted-foreground">Protect your forms from spam and abuse.</p>
                        </div>
                        <Switch
                            id="enableRecaptcha"
                            checked={settings.security?.enableRecaptcha || false}
                            onCheckedChange={(checked) => handleSecurityChange('enableRecaptcha', checked)}
                        />
                    </div>
                </div>

                 {settings.security?.enableTwoFactorAuth && (
                    <Card className="p-4">
                        <Label className="text-base font-medium">Enabled 2FA Methods</Label>
                        <p className="text-sm text-muted-foreground mb-4">Select which methods users can choose from.</p>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Checkbox id="2fa-email" checked={settings.security?.twoFactorAuthMethods?.email} onCheckedChange={(checked) => handle2faMethodChange('email', checked as boolean)} />
                                <Label htmlFor="2fa-email" className="flex items-center gap-2 font-normal"><MailCheck className="h-4 w-4"/> Email Authentication</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox id="2fa-app" checked={settings.security?.twoFactorAuthMethods?.authenticatorApp} onCheckedChange={(checked) => handle2faMethodChange('authenticatorApp', checked as boolean)} />
                                <Label htmlFor="2fa-app" className="flex items-center gap-2 font-normal"><Smartphone className="h-4 w-4"/> Authenticator App</Label>
                            </div>
                             <div className="flex items-center space-x-3">
                                <Checkbox id="2fa-sms" checked={settings.security?.twoFactorAuthMethods?.mobileNumber} onCheckedChange={(checked) => handle2faMethodChange('mobileNumber', checked as boolean)} />
                                <Label htmlFor="2fa-sms" className="flex items-center gap-2 font-normal"><MessageSquare className="h-4 w-4"/> Mobile Number (SMS)</Label>
                            </div>
                        </div>
                    </Card>
                )}
                
                {settings.security?.enableRecaptcha && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="recaptchaSiteKey">reCAPTCHA Site Key</Label>
                            <div className="relative">
                               <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input id="recaptchaSiteKey" name="recaptchaSiteKey" value={settings.security?.recaptchaSiteKey || ''} onChange={(e) => handleSecurityChange('recaptchaSiteKey', e.target.value)} placeholder="Your site key" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recaptchaSecretKey">reCAPTCHA Secret Key</Label>
                            <div className="relative">
                               <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input id="recaptchaSecretKey" name="recaptchaSecretKey" value={settings.security?.recaptchaSecretKey || ''} onChange={(e) => handleSecurityChange('recaptchaSecretKey', e.target.value)} placeholder="Your secret key" className="pl-10" />
                            </div>
                        </div>
                    </div>
                )}
                <div className="space-y-2 pt-4">
                    <Label className="text-base font-medium">Maintenance &amp; Utilities</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="maintenanceMode" className="font-medium">Enable Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">Temporarily take your site offline for visitors.</p>
                            </div>
                            <Switch
                                id="maintenanceMode"
                                checked={settings.security?.maintenanceMode || false}
                                onCheckedChange={(checked) => handleSecurityChange('maintenanceMode', checked)}
                            />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="enableAccountDeletion" className="font-medium">Enable Account Deletion</Label>
                                <p className="text-sm text-muted-foreground">Allow users to delete their own accounts.</p>
                            </div>
                            <Switch
                                id="enableAccountDeletion"
                                checked={settings.security?.enableAccountDeletion || false}
                                onCheckedChange={(checked) => handleSecurityChange('enableAccountDeletion', checked)}
                            />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                        <Button variant="outline" type="button"><Eraser className="mr-2 h-4 w-4" />Clear Cache</Button>
                        <Button variant="outline" type="button"><FileCode className="mr-2 h-4 w-4" />Generate sitemap.xml</Button>
                        <Button variant="outline" type="button"><FileText className="mr-2 h-4 w-4" />Generate robots.txt</Button>
                     </div>
                </div>
            </div>
        </CollapsibleSection>
      </div>
      
      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
