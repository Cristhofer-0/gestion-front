"use client"

import { useEffect, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"

interface Order {
  OrderId: number
  UserId: number
  TotalPrice: number
  OrderDate: string
  PaymentStatus: string
  Quantity: number
  Event?: { OrganizerId: number }
}

interface Props {
  user: { UserId: number; Role: string }
}

function getChangeIcon(change: number) {
  return change >= 0 ? (
    <ArrowUp className="w-3 h-3" />
  ) : (
    <ArrowDown className="w-3 h-3" />
  )
}

function getLabel(base: string, periodo: string) {
  const periodos = {
    semanal: "Semanal",
    mensual: "Mensual",
    total: "Total",
  }
  const isPlural = base.toLowerCase().includes("ventas")
  const sufijo = isPlural
    ? `${periodos[periodo as keyof typeof periodos]}es`
    : periodos[periodo as keyof typeof periodos]
  return `${base} ${sufijo}`
}

export function ResumenVentasPorPeriodo({ user }: Props) {
  const [periodo, setPeriodo] = useState("semanal")
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`)
      .then((res) => res.json())
      .then((data) => {
        const filtrados = data.filter((o: Order) => {
          const isPaid = o.PaymentStatus === "paid"
          const isVisible =
            user.Role === "admin" || o.Event?.OrganizerId === user.UserId
          return isPaid && isVisible
        })
        setOrders(filtrados)
      })
  }, [user])

  const now = new Date()
  const start = new Date(now)
  const prevStart = new Date(now)
  const prevEnd = new Date(now)

  if (periodo === "semanal") {
    start.setDate(now.getDate() - 7)
    prevEnd.setDate(now.getDate() - 7)
    prevStart.setDate(now.getDate() - 14)
  } else if (periodo === "mensual") {
    start.setMonth(now.getMonth() - 1)
    prevEnd.setMonth(now.getMonth() - 1)
    prevStart.setMonth(now.getMonth() - 2)
  }

  const current = periodo === "total" ? orders : orders.filter((o) => new Date(o.OrderDate) >= start)
  const previous = orders.filter((o) => {
    const date = new Date(o.OrderDate)
    return date >= prevStart && date < prevEnd
  })

  const totalActual = current.reduce((sum, o) => sum + Number(o.TotalPrice || 0), 0)
  const totalPrevio = previous.reduce((sum, o) => sum + Number(o.TotalPrice || 0), 0)
  const promedioActual =
    current.length > 0 ? totalActual / current.length : 0
  const promedioPrevio =
    previous.length > 0 ? totalPrevio / previous.length : 0

  const changeVentas =
    totalPrevio === 0 ? 100 : ((totalActual - totalPrevio) / totalPrevio) * 100
  const changePromedio =
    promedioPrevio === 0
      ? 100
      : ((promedioActual - promedioPrevio) / promedioPrevio) * 100

  const totalClientes = new Set(current.map((o) => o.UserId)).size
  
  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={periodo}
        onValueChange={(val) => val && setPeriodo(val)}
        className="flex gap-2"
      >
        <ToggleGroupItem 
          value="total"
          className="px-4 py-2 text-sm font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-muted"
        >
          Total
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="mensual"
          className="px-4 py-2 text-sm font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-muted"
        >
          Mensual
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="semanal"
          className="px-4 py-2 text-sm font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-muted"
        >
          Semanal
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {getLabel("Ventas", periodo)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {(Number(totalActual) || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos en el periodo</p>
            {periodo !== "total" && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`flex items-center gap-1 ${
                    changeVentas >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {getChangeIcon(changeVentas)}
                  {changeVentas > 0 ? "+" : ""}
                  {(Number(changeVentas) || 0).toFixed(1)}%
                </Badge>
                <span className="text-xs text-gray-500">vs. período anterior</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Entradas Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current.reduce((sum, o) => sum + Number(o.Quantity || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Total de tickets vendidos</p>
          </CardContent>
        </Card>

        {user.Role === "organizer" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <p className="text-xs text-muted-foreground">Usuarios distintos que compraron</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {getLabel("Promedio", periodo)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {(Number(promedioActual) || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por orden pagada</p>
            {periodo !== "total" && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`flex items-center gap-1 ${
                    changePromedio >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {getChangeIcon(changePromedio)}
                  {changePromedio > 0 ? "+" : ""}
                  {(Number(changePromedio) || 0).toFixed(1)}%
                </Badge>
                <span className="text-xs text-gray-500">vs. período anterior</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
