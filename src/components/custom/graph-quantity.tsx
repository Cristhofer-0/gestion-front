"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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
import { ChartSales } from "./graph-sales"
import { DollarSign } from "lucide-react"
import { ResumenVentasPorPeriodo } from "../dashboard/resumen-ventas"

interface Order {
  OrderId: number
  UserId: number
  Quantity: number
  OrderDate: string
}

interface ChartDataBase {
  date: string
  jsDate?: Date
}

interface ChartData {
  [ticketType: string]: number | string
}

export function ChartAreaInteractive({ user }: { user: { UserId: number; Role: string } }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeRange, setTimeRange] = useState("90d")
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`);
        const orders = await response.json();

        const aggregated: Record<string, any> = {};

        orders
          .filter((order: any) => {
            const isPaid = order.PaymentStatus === "paid";
            const isVisible = user.Role === "admin" || order.Event?.OrganizerId === user.UserId;
            return isPaid && isVisible;
          })
          .forEach((order: any) => {
            const limaDate = new Date(
              new Date(order.OrderDate).toLocaleString("en-US", { timeZone: "America/Lima" })
            );

            const year = limaDate.getFullYear();
            const month = String(limaDate.getMonth() + 1).padStart(2, "0");
            const day = String(limaDate.getDate()).padStart(2, "0");
            const date = `${year}-${month}-${day}`;
            const jsDate = new Date(`${date}T12:00:00`); // ⬅️ CORRECTO

            const type = order.Ticket?.Type || "Otro";

            if (!aggregated[date]) {
              aggregated[date] = { date, jsDate };
            }

            if (!aggregated[date][type]) {
              aggregated[date][type] = 0;
            }

            aggregated[date][type] += order.Quantity;
          });

        const formattedData: ChartData[] = Object.values(aggregated).map(obj => ({
          ...obj,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }
    fetchData();
  }, []);


  const filteredData = chartData.filter((item) => {
    const [year, month, day] = (item.date as string).split("-").map(Number)
    const date = new Date(year, month - 1, day)
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
    )

    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return date >= startDate
  })
   .sort((a, b) => {
    const dateA = new Date(a.date as string).getTime();
    const dateB = new Date(b.date as string).getTime();
    return dateA - dateB;
  });

  const colorMap: Record<string, string> = {
    general: "#8B5CF6", // azul
    vip: "#F59E0B",     // rojo
    otro: "#10b981",    // verde
    // puedes agregar más tipos aquí
  }

  const ticketTypes = Array.from(
    new Set(chartData.flatMap(data =>
      Object.keys(data).filter(key => key !== "date" && key !== "jsDate")
    ))
  )

  function normalize(type: string): string {
    return type.toLowerCase().replace(/[^a-z0-9]/gi, "-")
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard de Ventas</h1>
        <p className="mt-1 text-muted-foreground">Resumen de rendimiento de ventas</p>
        <br />
        <div className="">
          <ResumenVentasPorPeriodo user={user} />
        </div>
        <br />
        <div>
          <ChartSales user={user}/>
          <br />
        </div>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardTitle>Cantidad de Entradas Vendidas</CardTitle>
            <CardDescription>
              <span className="@[540px]/card:block hidden">Total de entradas por tipo: General o VIP</span>
            </CardDescription>
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
            <ChartContainer
              config={{}} // puedes definir `chartConfig` si tienes uno
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  {ticketTypes.map((type) => {
                    const normalizedType = normalize(type)
                    const color = colorMap[normalizedType] || "#8b5cf6"
                    return (
                      <linearGradient id={`fill-${normalizedType}`} x1="0" y1="0" x2="0" y2="1" key={type}>
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
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
                    new Date(value + "T00:00:00").toLocaleDateString("es-PE", {
                      timeZone: "America/Lima",
                      month: "short",
                      day: "numeric",
                    })
                  }

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
                {ticketTypes.map((type) => {
                  const normalized = normalize(type)
                  const color =
                    type.toLowerCase() === "general"
                      ? "#8B5CF6" // morado
                      : type.toLowerCase() === "vip"
                      ? "#F59E0B" // dorado
                      : "#10b981" // verde por defecto

                  return (
                    <Area
                      key={type}
                      dataKey={type}
                      name={`${type}`} // Nombre visible en tooltip
                      type="monotone"
                      stroke={color}
                      fillOpacity={1}
                      fill={`url(#fill-${normalized})`}
                    />
                  )
                })}
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}
