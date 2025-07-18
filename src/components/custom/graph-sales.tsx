"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface Order {
  OrderId: number
  UserId: number
  TotalPrice: number
  OrderDate: string
}

interface ChartData {
  date: string
  totalSales: number
}

interface User {
  UserId: number
  Role: string
}

function formatToLocalDateKey(dateIso: string): string {
  const date = new Date(dateIso)

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date) // Devuelve 'YYYY-MM-DD'
}

export function ChartSales({ user }: { user: { UserId: number; Role: string } }) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeRange, setTimeRange] = useState("90d")

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`)
        const orders = await response.json()

        const aggregated: Record<string, number> = {}

        orders.filter((order: any) =>
          order.PaymentStatus === "paid" &&
          (user.Role === "admin" || order.Event?.OrganizerId === user.UserId)
        ).forEach((order: any) => {
          const date = new Date(order.OrderDate)
          const localDate = formatToLocalDateKey(order.OrderDate)
          aggregated[localDate] = (aggregated[localDate] || 0) + Number(order.TotalPrice)
        })

        const formattedData: ChartData[] = Object.entries(aggregated).map(([date, totalSales]) => ({
          date,
          totalSales,
        }))

        formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setTimeout(() => {
          setChartData(formattedData)
        }, 50)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      }
    }

    fetchData()
  }, [])
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date(
  new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
)
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Ventas Totales</CardTitle>
        <CardDescription>Monto total por día de ventas pagadas</CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">Último mes</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">Última semana</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={{}} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fill-sales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value + "T00:00:00").toLocaleDateString("es-PE", {
                  timeZone: "America/Lima",
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `S/.${value}`}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value + "T00:00:00")
                    if (isNaN(date.getTime())) return "Fecha inválida"
                    return date.toLocaleDateString("es-PE", {
                      timeZone: "America/Lima",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />

            <Area
              type="monotone"
              name="Ventas: "
              dataKey="totalSales"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#fill-sales)"
              dot={{ r: 3 }} // 👈 Esto muestra los puntos
              isAnimationActive={true}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
