import {
  Bell,
  Home,
  LineChart,
  Package2,
  Settings,
  Users,
  PenSquare,
} from 'lucide-react';

import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar>
          <SidebarHeader>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <Package2 className="h-6 w-6" />
                <span>ToolifyAI Admin</span>
              </Link>
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/dashboard" tooltip="Dashboard">
                  <Home />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/users" tooltip="Users" disabled>
                  <Users />
                  Users
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/ai-prompt-templates" tooltip="Prompts">
                    <PenSquare />
                    Prompt Templates
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton href="/admin/analytics" tooltip="Analytics" disabled>
                  <LineChart />
                  Analytics
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <SidebarTrigger className="sm:hidden" />
            </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
