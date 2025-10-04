

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, UploadCloud, Image as ImageIcon, Mail, Facebook, Instagram, Twitter, Youtube, Code, Search, ChevronDown, ChevronUp, ShieldCheck, KeyRound, Eraser, FileCode, FileText, Smartphone, MailCheck, Power, Construction, MessageSquare, AlertTriangle, Calendar as CalendarIcon, Clock, Cpu, SlidersHorizontal, Palette, Link as LinkIcon, Globe, Bitcoin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { GeneralSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AdBlockerDetector } from '@/components/common/AdBlockerDetector';
import { clearCache } from '@/ai/flows/utility-actions';


export const runtime = 'nodejs';

type CollapsibleSectionProps = {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  isFullWidth: boolean;
  icon: React.ElementType;
};

const CollapsibleSection = ({ id, title, description, children, isOpen, onToggle, isFullWidth, icon: Icon }: CollapsibleSectionProps) => {
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
                <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-primary"/>
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>
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
  const [isClearingCache, setIsClearingCache] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const appSettings = await getSettings();
        let generalData = appSettings.general || {};

        if (generalData.security?.maintenanceModeUntil && typeof generalData.security.maintenanceModeUntil === 'string') {
          generalData.security.maintenanceModeUntil = new Date(generalData.security.maintenanceModeUntil);
        }
        
        const defaultSettingsData: GeneralSettings = {
            siteTitle: '',
            slogan: '',
            siteDescription: '',
            metaKeywords: '',
            copyrightText: '© {year} ToolifyAI. All rights reserved.',
            logoUrl: '',
            faviconUrl: '',
            contactEmail: '',
            socialLinks: { 
                facebook: '',
                twitter: '',
                instagram: '',
                youtube: '',
            },
            webmaster: {
                 googleSearchConsole: '',
                 googleAnalytics: '',
                 googleAdsense: '',
                 yandexWebmaster: '',
                 bingWebmaster: '',
                 pinterest: '',
                 baidu: '',
                 yahooSearchConsole: '',
            },
            apiKeys: {
                googleApiKey: '',
                googleCseId: '',
            },
            security: {
                enableTwoFactorAuth: false,
                twoFactorAuthMethods: {
                    email: true,
                    authenticatorApp: false,
                    mobileNumber: false,
                },
                enableRecaptcha: false,
                recaptchaSiteKey: '',
                recaptchaSecretKey: '',
                maintenanceMode: false,
                maintenanceModeMessage: '',
                maintenanceModeUntil: undefined,
                enableNewLoginAlerts: true,
                enableAdBlockerDetection: false,
            }
        };

        const mergedSettings = {
            ...defaultSettingsData,
            ...generalData,
            socialLinks: { ...defaultSettingsData.socialLinks, ...generalData.socialLinks },
            webmaster: { ...defaultSettingsData.webmaster, ...generalData.webmaster },
            apiKeys: { ...defaultSettingsData.apiKeys, ...generalData.apiKeys },
            security: { 
                ...defaultSettingsData.security, 
                ...generalData.security,
                twoFactorAuthMethods: { ...defaultSettingsData.security?.twoFactorAuthMethods, ...generalData.security?.twoFactorAuthMethods }
            },
        };

        setSettings(mergedSettings);

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
  
    const handleApiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => (prev ? {
      ...prev,
      apiKeys: {
        ...(prev.apiKeys || {}),
        [name]: value
      }
    } : null));
  };
  
  const handleSecurityChange = (field: string, value: any) => {
    setSettings(prev => {
        if (!prev) return null;
        const newSecuritySettings = { ...(prev.security || {}), [field]: value };
        return { ...prev, security: newSecuritySettings };
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
        description: 'Site settings have been saved. Some changes may require a page refresh or server restart to take effect.',
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

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
        const result = await clearCache();
        if (result.success) {
            toast({
                title: 'Cache Cleared!',
                description: 'The website data cache has been successfully cleared.',
            });
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message || 'Could not clear cache.',
            variant: 'destructive',
        });
    } finally {
        setIsClearingCache(false);
    }
  };


  const handleUtilityClick = (action: string) => {
    toast({
      title: 'Action Triggered!',
      description: `The "${action}" process has been initiated successfully.`,
    });
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
    { id: 'general', title: 'General Settings', description: "Update your site's title, description, etc.", icon: SlidersHorizontal },
    { id: 'branding', title: 'Branding & Contact', description: "Customize your site's appearance and contact info.", icon: Palette },
    { id: 'social', title: 'Social Media Links', description: 'Provide links to your social media profiles.', icon: LinkIcon },
    { id: 'webmaster', title: 'Webmaster Tools', description: 'Add verification codes for webmaster tools.', icon: Globe },
    { id: 'apiKeys', title: 'API Keys for Tools', description: 'Configure API keys for third-party services.', icon: KeyRound },
    { id: 'security', title: 'Security & Utilities', description: 'Manage site security and maintenance.', icon: ShieldCheck },
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
         <CollapsibleSection id="general" title="General Settings" description="Update your site's title, description, etc." icon={SlidersHorizontal} isOpen={openSection === 'general'} onToggle={handleToggle} isFullWidth={openSection === 'general'}>
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

        <CollapsibleSection id="branding" title="Branding & Contact" description="Customize your site's appearance and contact info." icon={Palette} isOpen={openSection === 'branding'} onToggle={handleToggle} isFullWidth={openSection === 'branding'}>
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
        
        <CollapsibleSection id="social" title="Social Media Links" description="Provide links to your social media profiles." icon={LinkIcon} isOpen={openSection === 'social'} onToggle={handleToggle} isFullWidth={openSection === 'social'}>
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
        
        <CollapsibleSection id="webmaster" title="Webmaster Tools" description="Add verification codes for webmaster tools." icon={Globe} isOpen={openSection === 'webmaster'} onToggle={handleToggle} isFullWidth={openSection === 'webmaster'}>
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
        
        <CollapsibleSection id="apiKeys" title="API Keys for Tools" description="Configure API keys for third-party services." icon={KeyRound} isOpen={openSection === 'apiKeys'} onToggle={handleToggle} isFullWidth={openSection === 'apiKeys'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="googleApiKey">Google API Key</Label>
                     <Input id="googleApiKey" name="googleApiKey" value={settings.apiKeys?.googleApiKey || ''} onChange={handleApiKeysChange} placeholder="Enter Google API Key"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="googleCseId">Google Custom Search Engine ID</Label>
                     <Input id="googleCseId" name="googleCseId" value={settings.apiKeys?.googleCseId || ''} onChange={handleApiKeysChange} placeholder="Enter CSE ID"/>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection id="security" title="Security & Utilities" description="Manage site security and maintenance." icon={ShieldCheck} isOpen={openSection === 'security'} onToggle={handleToggle} isFullWidth={openSection === 'security'}>
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="enableNewLoginAlerts" className="font-medium">New Login Alerts</Label>
                            <p className="text-sm text-muted-foreground">Notify users of logins from new devices.</p>
                        </div>
                        <Switch
                            id="enableNewLoginAlerts"
                            checked={settings.security?.enableNewLoginAlerts ?? true}
                            onCheckedChange={(checked) => handleSecurityChange('enableNewLoginAlerts', checked)}
                        />
                    </div>
                     <div className="flex items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="adBlockerDetection" className="font-medium">Ad Blocker Detection</Label>
                            <p className="text-sm text-muted-foreground">
                                Ask free users to disable their ad blocker.
                            </p>
                        </div>
                        <Switch
                            id="adBlockerDetection"
                            checked={settings.security?.enableAdBlockerDetection || false}
                            onCheckedChange={(checked) => handleSecurityChange('enableAdBlockerDetection', checked)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">Take site offline for visitors.</p>
                            </div>
                            <Switch
                                id="maintenanceMode"
                                checked={settings.security?.maintenanceMode || false}
                                onCheckedChange={(checked) => handleSecurityChange('maintenanceMode', checked)}
                            />
                        </div>
                        {settings.security?.maintenanceMode && (
                            <div className="space-y-4 pt-4 border-t">
                                 <div className="space-y-2">
                                    <Label htmlFor="maintenanceModeMessage">Maintenance Message</Label>
                                    <Textarea
                                        id="maintenanceModeMessage"
                                        placeholder="e.g., We'll be back online shortly!"
                                        value={settings.security?.maintenanceModeMessage || ''}
                                        onChange={(e) => handleSecurityChange('maintenanceModeMessage', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maintenanceModeUntil">Ends At (Optional)</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !settings.security?.maintenanceModeUntil && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {settings.security?.maintenanceModeUntil ? format(settings.security.maintenanceModeUntil, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={settings.security?.maintenanceModeUntil}
                                                onSelect={(date) => handleSecurityChange('maintenanceModeUntil', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="enableRecaptcha" className="font-medium">Google reCAPTCHA</Label>
                                <p className="text-sm text-muted-foreground">Protect your forms from spam.</p>
                            </div>
                            <Switch
                                id="enableRecaptcha"
                                checked={settings.security?.enableRecaptcha || false}
                                onCheckedChange={(checked) => handleSecurityChange('enableRecaptcha', checked)}
                            />
                        </div>
                        {settings.security?.enableRecaptcha && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="recaptchaSiteKey">reCAPTCHA Site Key</Label>
                                    <Input id="recaptchaSiteKey" value={settings.security?.recaptchaSiteKey || ''} onChange={(e) => handleSecurityChange('recaptchaSiteKey', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="recaptchaSecretKey">reCAPTCHA Secret Key</Label>
                                    <Input id="recaptchaSecretKey" value={settings.security?.recaptchaSecretKey || ''} onChange={(e) => handleSecurityChange('recaptchaSecretKey', e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="col-span-1 md:col-span-2">
                    <div className="space-y-4 rounded-lg border p-4">
                        <Label className="font-medium">Site Utilities</Label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Button variant="outline" type="button" onClick={handleClearCache} disabled={isClearingCache}>
                                {isClearingCache ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
                                Clear Cache
                            </Button>
                            <Button variant="outline" type="button" onClick={() => handleUtilityClick('Generate Sitemap')}><FileCode className="mr-2 h-4 w-4" />Generate sitemap.xml</Button>
                            <Button variant="outline" type="button" onClick={() => handleUtilityClick('Generate Robots.txt')}><FileText className="mr-2 h-4 w-4" />Generate robots.txt</Button>
                         </div>
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
