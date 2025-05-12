"use client"
import { useState } from "react"

//BARRA IZQUIERDA
import { AppSidebar } from "./components/app-sidebar"
// EL GRAFICO DE LOS DATOS
//import { ChartAreaInteractive } from "./components/chart-area-interactive"
//LA TABLA DE LOS DATOS
import { DataTable } from "./components/data-table"
//LAS CARTAS DE LA PARTE SUPERIOR
//import { SectionCards } from "./components/section-cards"
//TOPNAV QUE SE ENCARGA DE MOSTRAR/OCULTAR LA BARRA LATERAL
import { SiteHeader } from "./components/site-header"
//DOCUMENTACION DE SHADCN
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
//LA TABLA DE HISTORIAL
import { EventHistory } from "./components/event-history"

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0)
    
    const handleHistoryRefresh = () => {
        // Forzar actualización de la tabla de eventos
        setRefreshKey((prev) => prev + 1)
    }
    
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="container mx-auto p-4 md:p-6">
                    <div className="@container/main flex flex-col gap-6">
                        {/* Descomenta estas secciones si son necesarias */}
                        {/* <SectionCards /> */}
                        {/* <ChartAreaInteractive /> */}
                        
                        {/* Tabla de datos */}
                        <DataTable key={refreshKey} />
                        
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