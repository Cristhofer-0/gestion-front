//BARRA IZQUIERDA
import { AppSidebar } from "./components/app-sidebar"
// EL GRAFICO DE LOS DATOS
import { ChartAreaInteractive } from "./components/chart-area-interactive"
//LA TABLA DE LOS DATOS
import { DataTable } from "./components/data-table"
//LAS CARTAS DE LA PARTE SUPERIOR
import { SectionCards } from "./components/section-cards"
//TOPNAV QUE SE ENCARGA DE MOSTRAR/OCULTAR LA BARRA LATERAL
import { SiteHeader } from "./components/site-header"
//DOCUMENTACION DE SHADCN
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

//EJEMPLO DE LOS DATOS
import data from "./data.json"



export default function dashboard() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* <SectionCards /> */}
                            {/* <div className="px-4 lg:px-6">
                                <ChartAreaInteractive />
                            </div> */}
                            <DataTable />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )




}
