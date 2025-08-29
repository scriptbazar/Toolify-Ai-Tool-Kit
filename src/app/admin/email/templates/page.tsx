
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Eye,
  Edit,
  PlusCircle,
  KeyRound,
  UserPlus,
  BadgeCheck,
  Megaphone,
  Ticket,
  MailCheck,
  ShieldCheck,
  Receipt,
  AlertTriangle,
  Clock,
  UserX,
  CalendarClock,
  Wand2,
  Loader2,
  ThumbsUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog";
import { Logo } from '@/components/common/Logo';
import { regenerateEmailTemplate, generateFeatureAnnouncementEmail } from '@/ai/flows/ai-email-composer';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


const initialTemplates = [
  {
    id: 'welcome',
    icon: UserPlus,
    title: 'Welcome Email',
    description: 'Sent to new users upon successful registration.',
    subject: 'Welcome to ToolifyAI!',
    body: `Hi {{name}},\n\nWelcome to ToolifyAI! We're thrilled to have you on board and can't wait for you to explore our suite of over 100 smart tools designed to boost your productivity.\n\nTo get started, we recommend checking out our most popular tools on the homepage. If you have any questions or need assistance, our support team is always here to help.\n\nBest regards,\nThe ToolifyAI Team`,
  },
  {
    id: 'forgot-password',
    icon: KeyRound,
    title: 'Forgot Password',
    description: 'Sent when a user requests to reset their password.',
    subject: 'Reset Your ToolifyAI Password',
    body: `Hello {{name}},\n\nA password reset was requested for your ToolifyAI account. If this was you, please click the button below to set a new password. The link will expire in 1 hour for your security.\n\n<a href="{{resetLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>\n\nIf you did not request this, you can safely ignore this email. No changes have been made to your account.\n\nThanks,\nThe ToolifyAI Team`,
  },
  {
    id: 'email-verification',
    icon: MailCheck,
    title: 'Email Address Verification',
    description: 'Sent to new users to verify their email address.',
    subject: 'Verify Your Email Address for ToolifyAI',
    body: `Hi {{name}},\n\nPlease verify your email address to complete your registration and secure your account. Click the button below:\n\n<a href="{{verificationLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email Address</a>\n\nThis link will expire in 24 hours. If you did not sign up for ToolifyAI, please disregard this email.\n\nThanks,\nThe ToolifyAI Team`,
  },
    {
    id: 'review-request',
    icon: ThumbsUp,
    title: 'Review Request',
    description: 'Sent to users 7 days after signup to ask for a review.',
    subject: 'Got a moment? Share your thoughts on ToolifyAI!',
    body: `Hi {{name}},\n\nWe hope you're enjoying your first week with ToolifyAI! We're always working to improve our tools and would love to hear about your experience.\n\nIf you have a favorite tool or any feedback for us, please consider leaving a review. It only takes a minute and helps us immensely!\n\n<a href="{{reviewLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Leave a Review</a>\n\nYour feedback is incredibly valuable to us.\n\nBest,\nThe ToolifyAI Team`,
  },
  {
    id: 'password-changed',
    icon: ShieldCheck,
    title: 'Password Change Notification',
    description: 'Confirms that a user\'s password has been changed.',
    subject: 'Your ToolifyAI Password Has Been Changed',
    body: `Hello {{name}},\n\nThis is a confirmation that the password for your ToolifyAI account was successfully changed. \n\nIf you did not make this change, please contact our support team immediately.\n\nBest,\nThe ToolifyAI Team`,
  },
  {
    id: 'subscription-confirmation',
    icon: BadgeCheck,
    title: 'Subscription Confirmation',
    description: 'Confirms a user\'s successful subscription to a plan.',
    subject: 'Your ToolifyAI Subscription is Confirmed!',
    body: `Hi {{name}},\n\nYour subscription to the {{planName}} plan is now active! Thank you for upgrading. You now have access to all the premium features included in your plan.\n\nYou can manage your subscription and view billing details at any time from your account dashboard.\n\n<a href="{{dashboardLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Go to Dashboard</a>\n\nWe're excited to see what you create!\n\nBest,\nThe ToolifyAI Team`,
  },
  {
    id: 'payment-receipt',
    icon: Receipt,
    title: 'Payment Receipt',
    description: 'Provides users with a receipt for their payment.',
    subject: 'Your ToolifyAI Receipt (Order #{{orderId}})',
    body: `Hi {{name}},\n\nThank you for your payment. Here is the receipt for your recent purchase.\n\nPlan: {{planName}}\nSubscription Period: {{subscriptionStartDate}} to {{subscriptionEndDate}}\nAmount: {{amount}}\nDate: {{date}}\n\nYou can view your full billing history in your account settings.\n\nThanks for being a valued customer,\nThe ToolifyAI Team`,
  },
  {
    id: 'new-feature',
    icon: Megaphone,
    title: 'New Feature Announcement',
    description: 'Inform users about a new feature or tool update.',
    subject: '🚀 New Feature Alert: {{featureName}} is Here!',
    body: `Hi {{name}},\n\nWe're constantly working to make ToolifyAI better, and we're excited to announce a brand new feature: {{featureName}}!\n\n{{featureDescription}}\n\nLog in now to give it a try and supercharge your workflow!\n\n<a href="{{featureLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Try it Now</a>\n\nCheers,\nThe ToolifyAI Team`,
  },
  {
    id: 'support-ticket',
    icon: Ticket,
    title: 'Support Ticket Confirmation',
    description: 'Confirms receipt of a user\'s support ticket.',
    subject: 'We\'ve Received Your Support Request (Ticket #{{ticketId}})',
    body: `Hello {{name}},\n\nThanks for reaching out! This email is to confirm that we have received your support request (Ticket #{{ticketId}}). Our team will review it and get back to you as soon as possible, typically within 24 hours.\n\nYou can view the status of your ticket by clicking the button below.\n\n<a href="{{ticketLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Ticket Status</a>\n\nBest regards,\nThe ToolifyAI Support Team`,
  },
   {
    id: 'security-alert',
    icon: AlertTriangle,
    title: 'Security Alert',
    description: 'Alerts users of a login from a new device or location.',
    subject: 'Security Alert: New Login to Your ToolifyAI Account',
    body: `Hello {{name}},\n\nYour account was just accessed from a new device or location. If this was you, you can safely ignore this email.\n\nDevice: {{device}}\nLocation: {{location}}\n\nIf you do not recognize this activity, please change your password immediately and contact support. We recommend enabling Two-Factor Authentication for enhanced security.\n\n<a href="{{changePasswordLink}}" style="background-color: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Secure Your Account Now</a>\n\nThanks,\nThe ToolifyAI Security Team`,
  },
  {
    id: 'inactive-account',
    icon: Clock,
    title: 'Inactive Account Reminder',
    description: 'Sent to users whose accounts have been inactive for a period.',
    subject: "We've Missed You at ToolifyAI!",
    body: `Hello {{name}},\n\nIt's been a while since you last logged into your ToolifyAI account. We're constantly adding new tools and features to help you be more productive.\n\nLog in today to see what's new!\n\n<a href="{{loginLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Check Out What's New</a>\n\nIf you don't plan on using your account, you can deactivate it from your profile settings. For security, inactive accounts may be automatically deactivated after a long period of inactivity.\n\nBest,\nThe ToolifyAI Team`,
  },
   {
    id: 'renewal-reminder',
    icon: CalendarClock,
    title: 'Subscription Expiration Reminder',
    description: 'Reminds users that their subscription is about to expire.',
    subject: 'Action Required: Your ToolifyAI Subscription is Expiring Soon!',
    body: `Hi {{name}},\n\nThis is a friendly reminder that your subscription for the {{planName}} plan is set to expire on {{renewalDate}}.\n\nTo avoid losing access to your Pro features, please renew your subscription. If your plan expires, your account will be reverted to the Free plan.\n\n<a href="{{dashboardLink}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Renew Your Subscription</a>\n\nThanks for being a valued member!\n\nThe ToolifyAI Team`,
  },
];


function FeatureAnnouncementEditor({ template, onUpdate, onClose }: { template: any, onUpdate: (updatedTemplate: any) => void, onClose: () => void }) {
  const [featureName, setFeatureName] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [emailBody, setEmailBody] = useState(template.body);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!featureName || !featureDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide a feature name and description to generate the announcement.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateFeatureAnnouncementEmail({ featureName, featureDescription });
      setEmailBody(result.emailBody);
      toast({ title: "Content Generated!", description: "AI has drafted the announcement email." });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Could not generate content.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveChanges = () => {
    onUpdate({ ...template, body: emailBody });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Edit: {template.title}</DialogTitle>
        <DialogDesc>
          Provide feature details to generate an announcement, or edit the content manually.
        </DialogDesc>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4">
              <h3 className="font-semibold text-lg">AI Content Generation</h3>
              <div className="space-y-2">
                  <Label htmlFor="featureName">Feature Name</Label>
                  <Input id="featureName" value={featureName} onChange={(e) => setFeatureName(e.target.value)} placeholder="e.g., AI Image Generation"/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="featureDescription">Feature Description</Label>
                  <Textarea id="featureDescription" value={featureDescription} onChange={(e) => setFeatureDescription(e.target.value)} placeholder="e.g., Users can now create unique images from text prompts."/>
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                 {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate with AI
              </Button>
               <h3 className="font-semibold text-lg pt-4">Email Body</h3>
               <Textarea 
                 value={emailBody}
                 onChange={(e) => setEmailBody(e.target.value)}
                 className="min-h-[250px] font-mono"
                 placeholder="Your email content will appear here..."
               />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Live Preview</h3>
             <div className="p-6 border rounded-lg bg-muted h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <Logo className="h-8 w-8 text-primary"/>
                    <span className="text-xl font-bold text-foreground">ToolifyAI</span>
                </div>
                <div 
                    className="text-sm text-foreground whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{ __html: emailBody.replace(/\n/g, '<br />') || '' }}
                 />
            </div>
          </div>
      </div>
       <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
    </DialogContent>
  )
}


export default function EmailTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };
  
  const handleRegenerate = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    try {
      const result = await regenerateEmailTemplate({
        templateType: selectedTemplate.title
      });
      
      const updatedBody = result.emailBody;
      setSelectedTemplate((prev: any) => ({ ...prev, body: updatedBody }));

      // Also update the main templates state so changes persist after closing modal
      setTemplates(currentTemplates => 
        currentTemplates.map(t => 
          t.id === selectedTemplate.id ? { ...t, body: updatedBody } : t
        )
      );

      toast({
        title: "Template Regenerated!",
        description: "The email content has been updated by AI.",
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not regenerate the template.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateUpdate = (updatedTemplate: any) => {
    setTemplates(currentTemplates =>
        currentTemplates.map(t =>
            t.id === updatedTemplate.id ? updatedTemplate : t
        )
    );
    toast({
        title: "Template Saved!",
        description: `The "${updatedTemplate.title}" template has been updated.`,
    });
  };

  const currentDialog = () => {
    if (!selectedTemplate) return null;

    if (selectedTemplate.id === 'new-feature') {
      return <FeatureAnnouncementEditor template={selectedTemplate} onUpdate={handleTemplateUpdate} onClose={() => setIsPreviewOpen(false)} />;
    }

    return (
       <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title} Preview</DialogTitle>
            <DialogDesc>
              This is a preview of the "{selectedTemplate?.subject}" email.
            </DialogDesc>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="p-6 border rounded-lg bg-muted">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <Logo className="h-8 w-8 text-primary"/>
                    <span className="text-xl font-bold text-foreground">ToolifyAI</span>
                </div>
                <div 
                    className="text-sm text-foreground whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate?.body.replace(/\n/g, '<br />') || '' }}
                 />
            </div>
          </div>
           <DialogFooter className="sm:justify-between gap-2">
              <Button onClick={handleRegenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Regenerate with AI
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
        </DialogContent>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground">
          Manage the automated emails sent from your application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Templates</CardTitle>
          <CardDescription>
            These are the default templates for system-generated emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:max-w-md"
              />
            </div>
            <Button disabled>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <template.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <div className="text-sm p-3 bg-muted rounded-md border text-muted-foreground truncate">
                       Subject: {template.subject}
                     </div>
                  </CardContent>
                  <div className="p-4 pt-0 mt-auto flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button className="w-full" onClick={() => handlePreview(template)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center">
                No templates found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {currentDialog()}
      </Dialog>
    </div>
  );
}
