'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStockMovementsAction } from '@/lib/actions/stock-movements';
import type { Tables } from '@/lib/supabase/database.types';

type StockMovement = Tables<'stock_movements'>;

interface StockMovementHistoryProps {
  itemId: string;
  itemName: string;
  currentStock: number;
}

export function StockMovementHistory({
  itemId,
  itemName,
  currentStock,
}: StockMovementHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getStockMovementsAction(itemId);
      if (result.success) {
        setMovements(result.data || []);
      } else {
        setError(result.error || 'Failed to load stock movements');
      }
    } catch (err) {
      console.error('Error loading stock movements:', err);
      setError('Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const formatMovementType = (type: string) => {
    switch (type) {
      case 'in':
        return { label: 'Stock In', icon: ArrowUp };
      case 'out':
        return { label: 'Stock Out', icon: ArrowDown };
      default:
        return { label: type, icon: Package };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Movement History
          </CardTitle>
          <CardDescription>Track inventory changes for {itemName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
            <span className="text-muted-foreground ml-2">Loading movements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Movement History
          </CardTitle>
          <CardDescription>Track inventory changes for {itemName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadMovements} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Movement History
            </CardTitle>
            <CardDescription>
              Track inventory changes for {itemName} (Current stock: {currentStock})
            </CardDescription>
          </div>
          <Button onClick={loadMovements} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No stock movements recorded yet</p>
            <p className="text-sm">Stock adjustments will appear here</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const { label, icon: Icon } = formatMovementType(movement.movement_type);
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(movement.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movement.movement_type === 'in' ? '+' : '-'}
                          {Math.abs(movement.quantity)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {movement.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {movement.notes ? (
                          <span className="text-muted-foreground text-sm">{movement.notes}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {movement.created_by ? 'User' : 'System'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
