
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
  UserX,
  CalendarClock,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const templates = [
  {
    id: 'welcome',
    icon: UserPlus,
    title: 'Welcome Email',
    description: 'Sent to new users upon successful registration.',
    subject: 'Welcome to ToolifyAI!',
    body: `Hi {{firstName}},\n\nWelcome to ToolifyAI! We're thrilled to have you on board.\n\nExplore our suite of over 100 smart tools designed to boost your productivity. To get started, check out our most popular tools on the homepage.\n\nIf you have any questions, feel free to contact our support team.\n\nBest regards,\nThe ToolifyAI Team`,
  },
  {
    id: 'forgot-password',
    icon: KeyRound,
    title: 'Forgot Password',
    description: 'Sent when a user requests to reset their password.',
    subject: 'Reset Your ToolifyAI Password',
    body: `Hello {{firstName}},\n\nSomeone has requested a password reset for your ToolifyAI account. If this was you, please click the link below to set a new password:\n\n[Reset Password Link]\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe ToolifyAI Team`,
  },
  {
    id: 'email-verification',
    icon: MailCheck,
    title: 'Email Address Verification',
    description: 'Sent to new users to verify their email address.',
    subject: 'Verify Your Email Address for ToolifyAI',
    body: `Hi {{firstName}},\n\nPlease verify your email address by clicking the link below:\n\n[Verification Link]\n\nThis link will expire in 24 hours. If you did not sign up for ToolifyAI, please disregard this email.\n\nThanks,\nThe ToolifyAI Team`,
  },
  {
    id: 'password-changed',
    icon: ShieldCheck,
    title: 'Password Change Notification',
    description: 'Confirms that a user\'s password has been changed.',
    subject: 'Your ToolifyAI Password Has Been Changed',
    body: `Hello {{firstName}},\n\nThis is a confirmation that the password for your ToolifyAI account has been successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest,\nThe ToolifyAI Team`,
  },
  {
    id: 'subscription-confirmation',
    icon: BadgeCheck,
    title: 'Subscription Confirmation',
    description: 'Confirms a user\'s successful subscription to a plan.',
    subject: 'Your ToolifyAI Subscription is Confirmed!',
    body: `Hi {{firstName}},\n\nYour subscription to the {{planName}} plan is now active! Thank you for upgrading.\n\nYou now have access to all the premium features included in your plan. You can manage your subscription at any time from your account dashboard.\n\nWe're excited to see what you create!\n\nBest,\nThe ToolifyAI Team`,
  },
  {
    id: 'payment-receipt',
    icon: Receipt,
    title: 'Payment Receipt',
    description: 'Provides users with a receipt for their payment.',
    subject: 'Your ToolifyAI Receipt (Order #{{orderId}})',
    body: `Hi {{firstName}},\n\nThank you for your payment. Here is the receipt for your recent purchase.\n\nPlan: {{planName}}\nAmount: {{amount}}\nDate: {{date}}\n\nYou can view your full billing history in your account settings.\n\nThanks,\nThe ToolifyAI Team`,
  },
  {
    id: 'new-feature',
    icon: Megaphone,
    title: 'New Feature Announcement',
    description: 'Inform users about a new feature or tool update.',
    subject: '🚀 New Feature Alert: {{featureName}} is Here!',
    body: `Hi there,\n\nWe're constantly working to make ToolifyAI better, and we're excited to announce a brand new feature: {{featureName}}!\n\n{{featureDescription}}\n\nLog in now to give it a try!\n\nCheers,\nThe ToolifyAI Team`,
  },
  {
    id: 'support-ticket',
    icon: Ticket,
    title: 'Support Ticket Confirmation',
    description: 'Confirms receipt of a user\'s support ticket.',
    subject: 'We\'ve Received Your Support Request (Ticket #{{ticketId}})',
    body: `Hello {{firstName}},\n\nThanks for reaching out! This email is to confirm that we have received your support request (Ticket #{{ticketId}}). Our team will review it and get back to you as soon as possible.\n\nYou can view the status of your ticket in your user dashboard.\n\nBest regards,\nThe ToolifyAI Support Team`,
  },
   {
    id: 'security-alert',
    icon: AlertTriangle,
    title: 'Security Alert',
    description: 'Alerts users of a login from a new device or location.',
    subject: 'Security Alert: New Login to Your ToolifyAI Account',
    body: `Hello {{firstName}},\n\nYour account was just accessed from a new device or location. If this was you, you can safely ignore this email. If you do not recognize this activity, please change your password immediately and contact support.\n\nDevice: {{device}}\nLocation: {{location}}\n\nThanks,\nThe ToolifyAI Security Team`,
  },
  {
    id: 'inactive-account',
    icon: Clock,
    title: 'Inactive Account Reminder',
    description: 'Sent to users whose accounts have been inactive for a period (e.g., 6 months).',
    subject: "We've Missed You at ToolifyAI!",
    body: `Hello {{firstName}},\n\nIt's been a while since you last logged into your ToolifyAI account. We're constantly adding new tools and features to help you be more productive.\n\nLog in today to see what's new!\n\nIf you don't plan on using your account, you can deactivate it from your profile settings. For security, inactive accounts may be automatically deactivated after a long period of inactivity.\n\nBest,\nThe ToolifyAI Team`,
  },
   {
    id: 'renewal-reminder',
    icon: CalendarClock,
    title: 'Subscription Renewal Reminder',
    description: 'Reminds users that their subscription is about to renew.',
    subject: 'Your ToolifyAI Subscription is Renewing Soon',
    body: `Hi {{firstName}},\n\nJust a friendly reminder that your subscription for the {{planName}} plan will automatically renew on {{renewalDate}}.\n\nIf you need to make any changes to your subscription or billing information, please visit your account dashboard.\n\nThanks for being a valued member!\n\nThe ToolifyAI Team`,
  },
];

export default function EmailTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

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
                    <Button className="w-full" disabled>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title} Preview</DialogTitle>
            <DialogDescription>
              This is a preview of the "{selectedTemplate?.subject}" email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="p-4 border rounded-lg bg-muted text-sm">
                <p className="whitespace-pre-wrap font-sans">{selectedTemplate?.body}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
