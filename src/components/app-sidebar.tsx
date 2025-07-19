"use client"


import { Camera, BarChart2, LayoutDashboard, Database, Circle, FileText, Folder, Search, Settings, Users } from 'lucide-react';

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useContext } from 'react';
import { AuthContext } from '@/context/myContext';


export function AppSidebar() {
  // Check User or Admin
  const { user } = useContext<any>(AuthContext)
  const isAdmin = user.role === "admin"
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: isAdmin ? "View All Users" : "View All Form Responses",
        url: "/viewallforms",
        icon: FileText,
      },
      {
        title: "Analytics",
        url: "#",
        icon: BarChart2,
      },
      {
        title: "Projects",
        url: "#",
        icon: Folder,
      },
      {
        title: "Team",
        url: "#",
        icon: Users,
      },
    ],
    navClouds: [
      {
        title: "Capture",
        icon: Camera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: FileText,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: FileText,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: Settings,
      },
      {
        title: "Get Help",
        url: "#",
        icon: Folder,
      },
      {
        title: "Search",
        url: "#",
        icon: Search,
      },
    ],
    documents: [
      {
        name: "Data Library",
        url: "#",
        icon: Database,
      },
      {
        name: "Reports",
        url: "#",
        icon: FileText,
      },
      {
        name: "Word Assistant",
        url: "#",
        icon: FileText,
      },
    ],
  }
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Circle className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
