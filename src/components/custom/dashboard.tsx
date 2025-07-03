"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Calendar, CalendarDays, BarChart3 } from "lucide-react"
import SalesSummaryCard from "../dashboard/dashboard-cuadro"
import BarSalesSummary from "@/components/dashboard/BarSalesSummary"

export default function SalesDashboard() {
    const [salesData, setSalesData] = useState({
        total: {
            amount: 0,
            count: 0,
            change: 0,
            period: "Total",
        },
        monthly: {
            amount: 0,
            count: 0,
            change: 0,
            period: "Este mes",
        },
        weekly: {
            amount: 0,
            count: 0,
            change: 0,
            period: "Esta semana",
        },
    });


    const [selectedPeriod, setSelectedPeriod] = useState<"total" | "monthly" | "weekly">("total")



    async function fetchDatos(range: "total" | "monthly" | "weekly") {
        try {
            // Mapeo de frontend -> backend
            const rangeMap: Record<typeof range, string> = {
                total: "all",
                monthly: "30d",
                weekly: "7d"
            };

            const backendRange = rangeMap[range];

            const url = new URL("http://localhost:3000/ingresitos");
            url.searchParams.set("range", backendRange);

            const response = await fetch(url.toString());

            if (!response.ok) throw new Error("Error en la respuesta del servidor");

            const data = await response.json();
            console.log("✅ Datos recibidos:", data);

            return data; // ← contiene: { message, total }
        } catch (error) {
            console.error("❌ Error fetching data:", error);
            return null;
        }
    }

    async function fetchCantidadOrdenes(range: "total" | "monthly" | "weekly") {
        try {
            const rangeMap: Record<typeof range, string> = {
                total: "all",
                monthly: "30d",
                weekly: "7d"
            };

            const backendRange = rangeMap[range];
            const url = new URL("http://localhost:3000/ordenes-pagadas");
            url.searchParams.set("range", backendRange);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error("Error en la respuesta del servidor");

            const data = await response.json();
            console.log("📦 Cantidad de órdenes recibidas:", data);
            return data; // ← contiene: { message, count }
        } catch (error) {
            console.error("❌ Error fetching cantidad de órdenes:", error);
            return null;
        }
    }

    async function fetchPorcentaje(range: "monthly" | "weekly") {
        try {
            const rangeMap: Record<typeof range, string> = {
                monthly: "30d",
                weekly: "7d"
            };

            const backendRange = rangeMap[range];
            const url = new URL("http://localhost:3000/porcentaje-cambio-ingresos");
            url.searchParams.set("range", backendRange);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error("Error en la respuesta del servidor");

            const data = await response.json();
            console.log("📈 Porcentaje de cambio recibido:", data);
            return data; // ← contiene: { change }
        } catch (error) {
            console.error("❌ Error al obtener el porcentaje de cambio:", error);
            return null;
        }
    }


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "PEN",
        }).format(amount)
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("es-ES").format(num)
    }

    const getChangeColor = (change: number) => {
        return change >= 0 ? "text-green-600" : "text-red-600"
    }

    const getChangeIcon = (change: number) => {
        return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    }

    const periods = [
        { key: "total" as const, label: "Total", icon: BarChart3 },
        { key: "monthly" as const, label: "Mensual", icon: Calendar },
        { key: "weekly" as const, label: "Semanal", icon: CalendarDays },
    ]


    useEffect(() => {
        const fetchTodosLosPeriodos = async () => {
            const rangos: ("total" | "monthly" | "weekly")[] = ["total", "monthly", "weekly"];

            const nuevasPromesas = rangos.map(async (rango) => {
                const [ingresos, ordenes, porcentaje] = await Promise.all([
                    fetchDatos(rango),
                    fetchCantidadOrdenes(rango),
                    rango === "total" ? null : fetchPorcentaje(rango),
                ]);

                return {
                    key: rango,
                    data: {
                        amount: ingresos?.total || 0,
                        count: ordenes?.count || 0,
                        change: porcentaje?.change || "0", // ✅ ahora se toma de porcentaje
                        period:
                            rango === "total"
                                ? "Total"
                                : rango === "monthly"
                                    ? "Este mes"
                                    : "Esta semana",
                    },
                };
            });

            const resultados = await Promise.all(nuevasPromesas);

            const datosFinales = resultados.reduce((acc, curr) => {
                acc[curr.key] = curr.data;
                return acc;
            }, {} as typeof salesData);

            setSalesData(datosFinales);
        };

        fetchTodosLosPeriodos();
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                    {periods.map((period) => {
                        const Icon = period.icon
                        return (
                            <Button
                                key={period.key}
                                variant={selectedPeriod === period.key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedPeriod(period.key)}
                                className="flex items-center gap-2"
                            >
                                <Icon className="h-4 w-4" />
                                {period.label}
                            </Button>

                        )
                    })}
                </div>
            </div>

            {/* Vista detallada del período seleccionado */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                        Ventas - {salesData[selectedPeriod].period}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Ingresos</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(salesData[selectedPeriod].amount)}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Número de Ventas</p>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(salesData[selectedPeriod].count)}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Cambio vs. período anterior</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${getChangeColor(salesData[selectedPeriod].change)}`}>
                                    {salesData[selectedPeriod].change > 0 ? "+" : ""}
                                    {salesData[selectedPeriod].change}%
                                </span>
                                <span className={getChangeColor(salesData[selectedPeriod].change)}>
                                    {getChangeIcon(salesData[selectedPeriod].change)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <BarSalesSummary />

            {/* Vista general de todos los períodos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(salesData).map(([key, data]) => {
                    const isSelected = selectedPeriod === key
                    const Icon = periods.find((p) => p.key === key)?.icon || DollarSign

                    return (
                        <Card
                            key={key}
                            className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
                                }`}
                            onClick={() => setSelectedPeriod(key as "total" | "monthly" | "weekly")}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{data.period}</CardTitle>
                                <Icon className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>

                                <SalesSummaryCard
                                    amount={data.amount}
                                    count={data.count}
                                    change={data.change}
                                    formatCurrency={formatCurrency}
                                    formatNumber={formatNumber}
                                />
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Métricas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Promedio por Venta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(salesData[selectedPeriod].amount / salesData[selectedPeriod].count)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Basado en {salesData[selectedPeriod].period.toLowerCase()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Proyección Mensual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {selectedPeriod === "weekly"
                                ? formatCurrency(salesData.weekly.amount * 4.33)
                                : selectedPeriod === "monthly"
                                    ? formatCurrency(salesData.monthly.amount)
                                    : formatCurrency(salesData.monthly.amount)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {selectedPeriod === "weekly" ? "Estimado basado en ventas semanales" : "Ventas del mes actual"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
