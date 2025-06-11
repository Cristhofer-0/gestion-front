"use client"
import { useState } from "react"
import { useUser } from "@/hooks/useUser"

//BARRA IZQUIERDA
import { AppSidebar } from "@/components/AppSideBar/app-sidebar"
import { AccountProfile} from "@/components/principales/perfil"
import { SiteHeader } from "@/components/custom/site-header"
//DOCUMENTACION DE SHADCN
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Dashboard() {
    const user = useUser()
    const [refreshKey, setRefreshKey] = useState(0)

    const handleHistoryRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    if (!user) {
        return // o puedes mostrar un loader/spinner
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="container mx-auto p-4 md:p-6">
                    <AccountProfile />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}