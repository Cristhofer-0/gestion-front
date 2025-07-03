"use client"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type Periodo = "total" | "monthly" | "weekly"

interface DataBar {
  period: string
  amount: number
}

const rangeLabels: Record<Periodo, string> = {
  total: "Total",
  monthly: "Este mes",
  weekly: "Esta semana",
}

export default function BarSalesSummary() {
  const [data, setData] = useState<DataBar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const rangos: Periodo[] = ["total", "monthly", "weekly"]

        const rangeMap: Record<Periodo, string> = {
          total: "all",
          monthly: "30d",
          weekly: "7d",
        }

        const promesas = rangos.map(async (rango) => {
          const res = await fetch(`http://localhost:3000/ingresitos?range=${rangeMap[rango]}`)
          const json = await res.json()
          return {
            period: rangeLabels[rango],
            amount: json.total ?? 0,
          }
        })

        const resultados = await Promise.all(promesas)
        setData(resultados)
      } catch (error) {
        console.error("❌ Error al cargar los datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return (
    <div className="w-full h-[300px] bg-white rounded-xl p-4 shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-3">Comparación de Ingresos</h2>
      {loading ? (
        <p className="text-gray-500">Cargando gráfico...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value: number) => `S/ ${value.toFixed(2)}`} />
            <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
