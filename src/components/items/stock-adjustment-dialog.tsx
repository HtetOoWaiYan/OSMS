'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Package } from 'lucide-react';
import { toast } from 'sonner';

interface StockAdjustmentDialogProps {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStockLevel?: number;
}

export function StockAdjustmentDialog({
  itemId,
  itemName,
  currentStock,
  minStockLevel = 0,
}: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newStock = currentStock + adjustment;
  const isLowStock = minStockLevel > 0 && newStock <= minStockLevel;

  const handleSubmit = async () => {
    if (adjustment === 0) {
      toast.error('Please enter an adjustment amount');
      return;
    }

    if (newStock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would implement the actual stock adjustment API call
      // For now, we'll just simulate the adjustment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Stock adjusted for ${itemName}. New stock: ${newStock}`);
      setOpen(false);
      setAdjustment(0);
      setNotes('');
    } catch (error) {
      console.error('Stock adjustment error:', error);
      toast.error('Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setAdjustment(0);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="mr-2 h-4 w-4" />
          Adjust Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>Adjust stock quantity for &quot;{itemName}&quot;</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Stock Info */}
          <div className="bg-muted rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Current Stock</span>
              <span className="text-lg font-bold">{currentStock}</span>
            </div>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock Alert
              </Badge>
            )}
          </div>

          {/* Adjustment Input */}
          <div className="space-y-2">
            <Label htmlFor="adjustment">Adjustment</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdjustment((prev) => prev - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                id="adjustment"
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                className="text-center"
                placeholder="0"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdjustment((prev) => prev + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Use positive numbers to add stock, negative numbers to remove stock
            </p>
          </div>

          {/* New Stock Preview */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Stock</span>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${newStock < 0 ? 'text-destructive' : ''}`}>
                  {newStock}
                </span>
                {adjustment !== 0 && (
                  <Badge variant={adjustment > 0 ? 'default' : 'secondary'}>
                    {adjustment > 0 ? '+' : ''}
                    {adjustment}
                  </Badge>
                )}
              </div>
            </div>
            {newStock <= minStockLevel && minStockLevel > 0 && (
              <Badge variant="destructive" className="mt-2 text-xs">
                Will be low stock
              </Badge>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={isSubmitting || adjustment === 0}
          >
            Reset
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || adjustment === 0 || newStock < 0}
          >
            {isSubmitting ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
