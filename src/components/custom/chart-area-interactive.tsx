"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import SalesDashboard from "../custom/dashboard"
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
  ChartConfig,
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
  Quantity: number
  OrderDate: string
  // Puedes extender el tipo si deseas usar más info como Event, Ticket o User
}

interface ChartData {
  date: string
  [ticketType: string]: number | string // date es string, el resto son cantidades
}



export function ChartAreaInteractive() {
  const [orders, setOrders] = useState<Order[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeRange, setTimeRange] = useState("90d")

  useEffect(() => {
    async function fetchData() {
    try {
      const response = await fetch("http://localhost:3000/orders");
      const orders = await response.json();

      // Agrupar por fecha y tipo de ticket
      const aggregated: Record<string, Record<string, any>> = {};

      orders.forEach((order: any) => {
        const date = new Date(order.OrderDate).toISOString().split("T")[0];
        const type = order.Ticket?.Type || "Otro";

        if (!aggregated[date]) {
          aggregated[date] = { date };
        }

        if (!aggregated[date][type]) {
          aggregated[date][type] = 0;
        }

        aggregated[date][type] += order.Quantity;
      });

      const formattedData: ChartData[] = Object.values(aggregated).map(obj => ({
        ...obj,
        date: obj.date as string, // aseguramos que 'date' esté
      }))

      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  }


    fetchData()
  }, [])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2025-07-03") // o new Date() si deseas "hoy"
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return date >= startDate
  })

  const ticketTypes = Array.from(
    new Set(chartData.flatMap(data => Object.keys(data).filter(key => key !== "date")))
  )

  function normalize(type: string): string {
    return type.toLowerCase().replace(/[^a-z0-9]/gi, "-")
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Ventas</h1>
        <p className="text-gray-600 mt-1">Resumen de rendimiento de ventas</p>
        <br />
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardTitle>Total Visitors</CardTitle>
            <CardDescription>
              <span className="@[540px]/card:block hidden">Total for the selected range</span>
              <span className="@[540px]/card:hidden">Filtered range</span>
            </CardDescription>
            <div className="absolute right-4 top-4">
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={(val) => val && setTimeRange(val)}
                variant="outline"
                className="@[767px]/card:flex hidden"
              >
                <ToggleGroupItem value="90d" className="h-8 px-2.5">Last 3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d" className="h-8 px-2.5">Last 30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d" className="h-8 px-2.5">Last 7 days</ToggleGroupItem>
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
            <ChartContainer
              config={{}} // puedes definir `chartConfig` si tienes uno
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  {ticketTypes.map((type) => {
                    const normalizedType = normalize(type)
                    return (
                      <linearGradient id={`fill-${normalizedType}`} x1="0" y1="0" x2="0" y2="1" key={type}>
                        <stop offset="5%" stopColor={`var(--color-${normalizedType})`} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={`var(--color-${normalizedType})`} stopOpacity={0.1} />
                      </linearGradient>
                    )
                  })}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      indicator="dot"
                    />
                  }
                />
                {ticketTypes.map((type) => (
                  <Area
                    key={type}
                    dataKey={type}
                    type="natural"
                    stackId="a"
                    stroke={`var(--color-${type.toLowerCase()})`}
                    fillOpacity={1}
                    fill={`url(#fill-${type.toLowerCase()})`}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div>
        <SalesDashboard />
      </div>
    </div>
  )
}
