import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, BarChart2, Activity, Users, Archive } from "lucide-react";
import { useLocation } from "wouter";
import { Redirect } from "wouter";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const menuItems = [
    {
      icon: <PlusCircle className="h-4 w-4" />,
      label: "Questions",
      href: "/admin/questions",
    },
    {
      icon: <Archive className="h-4 w-4" />,
      label: "Archived",
      href: "/admin/questions/archived",
    },
    {
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Analytics",
      href: "/admin/analytics",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Users & Teams",
      href: "/admin/users",
    },
    ...(user.username === "gair" ? [
      {
        icon: <Activity className="h-4 w-4" />,
        label: "User Analytics",
        href: "/admin/user",
      }
    ] : []),
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between border-b px-4 py-2">
            <h2 className="text-lg font-semibold tracking-tight">Admin</h2>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    tooltip={item.label}
                  >
                    <a href={item.href} className="flex items-center gap-2 w-full px-2 py-1.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}