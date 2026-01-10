
'use client';

import {
  Home,
  LineChart,
  Settings,
  Users,
  PenSquare,
  Package,
  History,
  GitCommitVertical,
  Megaphone,
  UserCog,
  Mail,
  BookText,
  Ticket,
  FileText as FileTextIcon,
  PlusCircle,
  LayoutGrid,
  BarChart3,
  Cog,
  UserPlus,
  SlidersHorizontal,
  ListChecks,
  CreditCard,
  Footprints,
  HelpCircle,
  PanelLeft,
  Lightbulb,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home, color: 'text-sky-500' },
    { href: '/admin/users', label: 'User Management', icon: Users, color: 'text-violet-500' },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart, color: 'text-amber-500' },
    { href: '/admin/ticket-management', label: 'Ticket Management', icon: Ticket, color: 'text-rose-500' },
    { href: '/admin/announcement', label: 'Announcement', icon: Megaphone, color: 'text-cyan-500' },
    { href: '/admin/payment-history', label: 'Payment History', icon: History, color: 'text-lime-500' },
    { href: '/admin/affiliate-management', label: 'Affiliate Management', icon: GitCommitVertical, color: 'text-emerald-500' },
    { href: '/admin/review-management', label: 'Review Management', icon: TrendingUp, color: 'text-orange-500' },
    { href: '/admin/advertisement', label: 'Advertisement', icon: Megaphone, color: 'text-pink-500' },
  ];

  const toolManagementLinks = [
    { href: '/admin/tools', icon: Package, label: 'All Tools', color: 'text-slate-500' },
    { href: '/admin/tools/new', icon: PlusCircle, label: 'Add New Tool', color: 'text-green-500' },
    { href: '/admin/tool-management/requests', icon: Lightbulb, label: 'Tool Requests', color: 'text-yellow-500' },
    { href: '/admin/tool-management/usage', icon: TrendingUp, label: 'Tool Usage', color: 'text-blue-500' },
  ];

  const blogManagementLinks = [
    { href: '/admin/blog/all-posts', icon: FileTextIcon, label: 'All Posts', color: 'text-sky-500' },
    { href: '/admin/blog/add-new', icon: PlusCircle, label: 'Add New Post', color: 'text-green-500' },
    { href: '/admin/blog/categories', icon: LayoutGrid, label: 'Categories', color: 'text-orange-500' },
    { href: '/admin/blog/comments', icon: MessageSquare, label: 'Comments', color: 'text-amber-500' },
  ];

  const emailManagementLinks = [
    { href: '/admin/email/templates', icon: FileTextIcon, label: 'Email Templates', color: 'text-indigo-500' },
    { href: '/admin/email/subscribers', icon: UserPlus, label: 'Subscribers', color: 'text-teal-500' },
    { href: '/admin/email/compose', icon: PenSquare, label: 'Compose', color: 'text-rose-500' },
    { href: '/admin/email/all-emails', icon: History, label: 'All Emails', color: 'text-slate-500' },
    { href: '/admin/email/reports', icon: BarChart3, label: 'Email Reports', color: 'text-cyan-500' },
    { href: '/admin/email/settings', icon: Cog, label: 'Mail Settings', color: 'text-lime-500' },
  ];
  
  const settingsLinks = [
    { href: '/admin/settings/site', icon: SlidersHorizontal, label: 'Site Settings', color: 'text-gray-500' },
    { href: '/admin/settings/homepage', icon: Home, label: 'Homepage Settings', color: 'text-sky-500' },
    { href: '/admin/settings/plan', icon: ListChecks, label: 'Plan Management', color: 'text-violet-500' },
    { href: '/admin/settings/payment', icon: CreditCard, label: 'Payment Settings', color: 'text-green-500' },
    { href: '/admin/settings/page', icon: FileTextIcon, label: 'Page Management', color: 'text-blue-500' },
    { href: '/admin/settings/affiliate', icon: GitCommitVertical, label: 'Affiliate Settings', color: 'text-emerald-500'},
    { href: '/admin/settings/sidebar', icon: PanelLeft, label: 'Sidebar Management', color: 'text-orange-500'},
    { href: '/admin/settings/footer', icon: Footprints, label: 'Footer Management', color: 'text-rose-500' },
    { href: '/admin/settings/faqs', icon: HelpCircle, label: 'FAQs Management', color: 'text-amber-500' },
  ];


const NavAccordion = ({ title, icon: Icon, links, isActive, ...props }: any) => {
    const accordionColor = {
        'Tool Management': 'text-fuchsia-500',
        'Email Management': 'text-red-500',
        'Blog Management': 'text-purple-500',
        'Settings': 'text-gray-500',
    }[title] || 'text-muted-foreground';

    return (
      <Accordion type="single" collapsible defaultValue={isActive ? title : undefined} {...props}>
          <AccordionItem value={title} className="border-b-0">
              <AccordionTrigger className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}>
                  <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', !isActive && accordionColor)} />
                      <span>{title}</span>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pl-4">
                  <SubmenuItems links={links} />
              </AccordionContent>
          </AccordionItem>
      </Accordion>
    )
};

const SubmenuItems = ({ links }: { links: { href: string; icon: React.ElementType; label: string, color: string }[] }) => {
    const pathname = usePathname();
    return (
     <nav className="grid gap-1">
      {links.map((link, index) => {
          const isActive = pathname === link.href;
        return (
            <Link
            key={link.href}
            href={link.href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground relative',
                isActive && 'bg-accent text-accent-foreground'
            )}
            >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-[22px] flex justify-center">
                {index !== links.length - 1 && <div className="w-px h-full bg-border" />}
            </div>
            <div className="absolute left-[22px] top-1/2 -translate-y-1/2 w-3 h-px bg-border"/>
            <link.icon className={cn("h-4 w-4 ml-8", isActive ? 'text-foreground' : link.color)} />
            {link.label}
            </Link>
        )
      })}
    </nav>
  );
}


export function AdminSidebarNav() {
    const pathname = usePathname();

    const isToolRouteActive = pathname.startsWith('/admin/tools') || pathname.startsWith('/admin/tool-management');
    const isBlogRouteActive = pathname.startsWith('/admin/blog');
    const isEmailRouteActive = pathname.startsWith('/admin/email');
    const isSettingsRouteActive = pathname.startsWith('/admin/settings');

    return (
        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4 py-4">
        {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )}
          >
            <link.icon className={cn('h-4 w-4', !isActive && link.color)} />
            {link.label}
          </Link>
        )})}
        <NavAccordion title="Tool Management" icon={Package} links={toolManagementLinks} isActive={isToolRouteActive} />
        <NavAccordion title="Email Management" icon={Mail} links={emailManagementLinks} isActive={isEmailRouteActive} />
        <NavAccordion title="Blog Management" icon={BookText} links={blogManagementLinks} isActive={isBlogRouteActive} />
        <NavAccordion title="Settings" icon={Settings} links={settingsLinks} isActive={isSettingsRouteActive} />
      </nav>
    );
}
