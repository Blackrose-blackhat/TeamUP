// components/app-sidebar.tsx
"use client";

import { signOut } from "next-auth/react";
import { 
  User, 
  Settings, 
  Briefcase, 
  LogOut, 
  Zap, 
  Plus,
  List,
  Eye,
  FileStack
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

// Main navigation items
const mainItems = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

// Gig-related items with sub-navigation
const gigItems = [
  {
    title: "Browse Gigs",
    url: "/dashboard/gigs",
    icon: List,
    description: "View all available gigs"
  },
  {
    title: "Create Gig",
    url: "/dashboard/gigs/create",
    icon: Plus,
    description: "Post a new gig"
  },
  {
    title: "Your Gigs",
    url: "/dashboard/gigs/mine",
    icon: FileStack,
    description: "View your posted Gigs"
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="py-2 flex items-center">
          {/* Logo - always visible */}
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3 group-data-[collapsible=icon]:mr-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {/* Title - hidden when collapsed */}
          <h2 className="text-xl font-bold group-data-[collapsible=icon]:hidden">
            Dashboard
          </h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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

        {/* Gigs Section */}
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}