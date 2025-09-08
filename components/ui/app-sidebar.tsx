"use client";

import { signOut, useSession } from "next-auth/react";
import {
  LayoutGrid,
  Users,
  Briefcase,
  List,
  Plus,
  FileStack,
  ChevronRight,
  Zap,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { logo } from "@/public/assets";

export function AppSidebar() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const user = session?.user;

  // Navigation
  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
    { title: "Network", url: "/dashboard/network", icon: Users },
  ];

  const gigItems = [
    { title: "Browse Gigs", url: "/dashboard/gigs", icon: List },
    { title: "Create Gig", url: "/dashboard/gigs/create", icon: Plus },
    { title: "Your Gigs", url: "/dashboard/gigs/mine", icon: FileStack },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <div className="py-2 flex items-center">
          <div className="flex items-center justify-center w-10 h-10   rounded-lg mr-3 group-data-[collapsible=icon]:mr-0">
            <Image src={logo} alt="logo" />
          </div>
          <h2 className="text-xl font-bold group-data-[collapsible=icon]:hidden">
            TEAM UP
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gigs */}
        <SidebarGroup>
          <SidebarGroupLabel>Gigs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible asChild defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Briefcase />
                      <span>Gig Management</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {gigItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile + Menu */}
      <SidebarFooter className="border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-lg  cursor-pointer  transition-colors">
              <Avatar className="h-6 w-6">
               
                  <AvatarImage src={user?.image} />
               
                  <AvatarFallback>
                    {user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                
              </Avatar>
              <div className="flex flex-col text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-medium">{user?.username || "User"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href={userId ? `/dashboard/profile/${userId}` : "/dashboard/profile"}>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className=""
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
