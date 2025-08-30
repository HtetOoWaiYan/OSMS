'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LowStockItemsListProps {
  data: { name: string; stock_quantity: number; min_stock_level: number | null }[]
}

export function LowStockItemsList({ data }: LowStockItemsListProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Low Stock Items</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.name} className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.name}</span>
                <span className={`text-sm font-bold ${item.stock_quantity <= (item.min_stock_level || 0) ? 'text-red-500' : 'text-yellow-500'}`}>
                  {item.stock_quantity}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-muted-foreground">No low stock items</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
