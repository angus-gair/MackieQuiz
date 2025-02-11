import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, BarChart2, Activity } from "lucide-react";
import { Link, useLocation } from "wouter";
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
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Analytics",
      href: "/admin/analytics",
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: "Site Metrics",
      href: "/admin/metrics",
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between">
            <h2 className="px-2 text-lg font-semibold">Admin Dashboard</h2>
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
                    <Link href={item.href} className="w-full">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
