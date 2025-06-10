"use client"
import { useState } from "react"
import { useUser } from "@/hooks/useUser"

//BARRA IZQUIERDA
import { AppSidebar } from "@/components/AppSideBar/app-sidebar"
// EL GRAFICO DE LOS DATOS
//import { ChartAreaInteractive } from "./components/chart-area-interactive"
//LA TABLA DE LOS DATOS
import { DataTable } from "@/components/DataTable/data-table"
import { OrderTable } from "@/components/DataTable/data-table-orders"
//LAS CARTAS DE LA PARTE SUPERIOR
//import { SectionCards } from "./components/section-cards"
//TOPNAV QUE SE ENCARGA DE MOSTRAR/OCULTAR LA BARRA LATERAL
import { SiteHeader } from "@/components/custom/site-header"
//DOCUMENTACION DE SHADCN
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
//LA TABLA DE HISTORIAL
import { EventHistory } from "@/components/Historial/event-history"

export default function Dashboard() {
    const user = useUser()
    const [refreshKey, setRefreshKey] = useState(0)

    const handleHistoryRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    if (!user) {
        return <div>Cargando usuario...</div> // o puedes mostrar un loader/spinner
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="container mx-auto p-4 md:p-6">
                    <div className="@container/main flex flex-col gap-6">
                        {/* Tabla de datos según el rol */}
                        {user.Role === "helper" ? (
                            <OrderTable key={refreshKey} />
                        ) : (
                            <DataTable key={refreshKey} />
                        )}

                        {/* Historial de eventos */}
                        <div className="rounded-lg border bg-card shadow">
                            <EventHistory onRefresh={handleHistoryRefresh} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}