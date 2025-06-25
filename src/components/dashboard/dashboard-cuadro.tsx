"use client"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

type Props = {
  amount: number
  count: number
  change: number
  formatCurrency: (amount: number) => string
  formatNumber: (num: number) => string
}

export default function SalesSummaryCard({
  amount,
  count,
  change,
  formatCurrency,
  formatNumber,
}: Props) {
  const getChangeIcon = (change: number) =>
    change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />

  return (
    <div className="space-y-3">
      <div>
        <div className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</div>
        <p className="text-xs text-gray-600">{formatNumber(count)} ventas</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={change >= 0 ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {getChangeIcon(change)}
          {change > 0 ? "+" : ""}
          {change}%
        </Badge>
        <span className="text-xs text-gray-500">vs. período anterior</span>
      </div>
    </div>
  )
}
