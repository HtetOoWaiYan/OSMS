'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PopularItemsChartProps {
  data: { name: string; total_sold: number }[]
}

export function PopularItemsChart({ data }: PopularItemsChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Popular Items</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="total_sold" fill="#82ca9d" name="Total Sold" />
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
