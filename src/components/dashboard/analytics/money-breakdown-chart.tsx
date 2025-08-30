'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MoneyBreakdownChartProps {
  data: {
    revenue: number;
    capital: number;
    profit: number;
  }
}

export function MoneyBreakdownChart({ data }: MoneyBreakdownChartProps) {
  const chartData = [
    {
      name: 'Breakdown',
      ...data
    }
  ]
  return (
    <Card className="col-span-6">
      <CardHeader>
        <CardTitle>Money Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {data.revenue > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              <Bar dataKey="capital" fill="#82ca9d" name="Capital" />
              <Bar dataKey="profit" fill="#ffc658" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
