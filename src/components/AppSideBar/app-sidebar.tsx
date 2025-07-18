"use client"

import * as React from "react"
import {
    ArrowUpCircleIcon,
    BarChartIcon,
    CameraIcon,
    Circle,
    CircleDot,
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
import { useUser } from "@/hooks/useUser"
import { PageTransition } from "@/components/principales/pageTransition"
import ThemeToggle from "@/components/custom/theme-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

interface User {
    name: string
    email: string
    avatar: string
}

interface NavUserProps {
    user: User
}

const data = {
    user: {
        name: "nombreDeUsuario",
        email: "m@ejemplo.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Eventos",
            url: "/dashboard/event",
            icon: LayoutDashboardIcon,
        },
        {
            title: "Tickets",
            url: "/dashboard/ticket",
            icon: ListIcon,
        },
        {
            title: "Ordenes",
            url: "/dashboard/order",
            icon: BarChartIcon,
        },
        {
            title: "Usuarios",
            url: "/dashboard/users",
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

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const user = useUser()

    // Si aún no hay usuario cargado, opcional: mostrar loader o null
    if (!user) return null

    // Filtrar el navMain según el rol
    const navMainFiltered = data.navMain.filter((item) => {
        if (user.Role === "admin") return true // ve todo
        if (user.Role === "organizer") return ["Eventos", "Tickets"].includes(item.title)
        if (user.Role === "helper") return item.title === "Ordenes"
        return false
    })

    return (
        /* <PageTransition>*/
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="mb-2">
                            <ThemeToggle />
                        </div>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href={
                                user.Role === "helper"
                                    ? "/dashboard/order"
                                    : user.Role === "organizer"
                                        ? "/dashboard"
                                        : "/dashboard"
                            }>
                                <CircleDot className="h-5 w-5" />
                                <span className="text-base font-semibold">JoinWithUs</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMainFiltered} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            {/* <SidebarFooter>
              <ThemeToggle />
            </SidebarFooter> */}
        </Sidebar>
        /* </PageTransition>*/
    )
}
