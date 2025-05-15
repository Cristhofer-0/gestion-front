"use client"

import * as React from "react"
import {
    ArrowUpCircleIcon,
    BarChartIcon,
    CameraIcon,
    ClipboardListIcon,
    DatabaseIcon,
    FileCodeIcon,
    FileIcon,
    FileTextIcon,
    FolderIcon,
    HelpCircleIcon,
    LayoutDashboardIcon,
    ListIcon,
    SearchIcon,
    SettingsIcon,
    UsersIcon,
} from "lucide-react"

import { NavDocuments } from "./Nav/nav-documents"
import { NavMain } from "./Nav/nav-main"
import { NavSecondary } from "./Nav/nav-secondary"
import { NavUser } from "./Nav/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "nombreDeUsuario",
        email: "m@ejemplo.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Eventos",
            url: "/dashboard",
            icon: LayoutDashboardIcon,
        },
        {
            title: "Tickets",
            url: "/dashboard/ticket",
            icon: ListIcon,
        },
        {
            title: "Analitica",
            url: "#",
            icon: BarChartIcon,
        },
        {
            title: "Texto2",
            url: "#",
            icon: FolderIcon,
        },
        {
            title: "Usuarios",
            url: "#",
            icon: UsersIcon,
        },
    ],
    navClouds: [
        {
            title: "Capture",
            icon: CameraIcon,
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
            icon: FileTextIcon,
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
            icon: FileCodeIcon,
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
            title: "Ajustes",
            url: "#",
            icon: SettingsIcon,
        },
        {
            title: "Ayuda",
            url: "#",
            icon: HelpCircleIcon,
        },
        {
            title: "Buscar",
            url: "#",
            icon: SearchIcon,
        },
    ],
    documents: [
        {
            name: "Datos",
            url: "#",
            icon: DatabaseIcon,
        },
        {
            name: "Reportes",
            url: "#",
            icon: ClipboardListIcon,
        },
        {
            name: "OTros",
            url: "#",
            icon: FileIcon,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <ArrowUpCircleIcon className="h-5 w-5" />
                                <span className="text-base font-semibold">Nombre Industria</span>
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
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
