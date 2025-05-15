"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Edit, PlusCircle, Trash2, RefreshCw } from "lucide-react"
import type { EventHistoryItem } from "../../services/eventos"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { fetchEventos, generarHistorialDesdeEventos } from "../../services/eventos"

interface EventHistoryProps {
  limit?: number
  onRefresh?: () => void
}

export function EventHistory({ limit = 10, onRefresh }: EventHistoryProps) {
  const [history, setHistory] = useState<EventHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const loadHistory = async () => {
  setIsLoading(true)
  try {
    const eventos = await fetchEventos()
    const historial = generarHistorialDesdeEventos(eventos)
    setHistory(historial.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
  } catch (error) {
    console.error("Error al generar historial desde eventos:", error)
  } finally {
    setIsLoading(false)
  }
}


  useEffect(() => {
    loadHistory()
  }, [])

  const handleRefresh = () => {
    loadHistory()
    if (onRefresh) {
      onRefresh()
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return <Badge className="bg-green-500">Creado</Badge>
      case "updated":
        return <Badge className="bg-yellow-500">Actualizado</Badge>
      case "deleted":
        return <Badge className="bg-red-500">Eliminado</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <PlusCircle className="h-4 w-4 text-green-500" />
      case "updated":
        return <Edit className="h-4 w-4 text-yellow-500" />
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  const filteredHistory = activeTab === "all" ? history : history.filter((item) => item.action === activeTab)

  const displayHistory = filteredHistory.slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Eventos
        </CardTitle>
        <button
          onClick={handleRefresh}
          className="p-1 rounded-full hover:bg-muted transition-colors"
          disabled={isLoading}
          title="Actualizar historial"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-between gap-2 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="created">Creados</TabsTrigger>
            <TabsTrigger value="updated">Actualizados</TabsTrigger>

            {/*<TabsTrigger value="deleted">Eliminados</TabsTrigger>*/}
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[300px] pr-4">
              {displayHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay registros de actividad {activeTab !== "all" ? `de tipo "${activeTab}"` : ""}.
                </div>
              ) : (
                <div className="space-y-4">
                  {displayHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                    >
                      <div className="mt-0.5">{getActionIcon(item.action)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.eventName}</p>
                          {getActionBadge(item.action)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center justify-between">
                          {/*<p className="text-xs text-muted-foreground">Por: {item.user}</p>*/}
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(item.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
