'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Star, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ToggleItemStatusButton } from './toggle-item-status-button';
import { StockAdjustmentDialog } from './stock-adjustment-dialog';
import type { Tables } from '@/lib/supabase/database.types';

type Item = Tables<'items'>;
type Category = Tables<'categories'>;

interface ItemWithPrice extends Item {
  category?: Category | null;
  current_price?: {
    base_price?: number | null;
    selling_price?: number | null;
    discount_percentage?: number | null;
  } | null;
  first_image_url?: string;
  image_count?: number | null;
}

interface ItemsTableProps {
  items: ItemWithPrice[];
  projectId: string;
}

export function ItemsTable({ items, projectId }: ItemsTableProps) {
  const router = useRouter();

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/${projectId}/items/${itemId}/edit`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleRowClick(item.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center overflow-hidden rounded-md">
                    {item.first_image_url ? (
                      <Image
                        src={item.first_image_url}
                        alt={`${item.name} image`}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="text-muted-foreground h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 font-medium">
                      <span>{item.name}</span>
                      {item.is_featured && (
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">SKU: {item.sku || 'N/A'}</div>
                    {item.image_count && item.image_count > 0 && (
                      <div className="text-muted-foreground text-xs">
                        {item.image_count} image{item.image_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {item.category?.name ? (
                  <Badge variant="secondary">{item.category.name}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {item.current_price ? (
                  <div>
                    <div className="font-medium">
                      ${item.current_price.selling_price?.toFixed(2)}
                    </div>
                    {item.current_price.discount_percentage &&
                      item.current_price.discount_percentage > 0 && (
                        <div className="text-muted-foreground text-xs line-through">
                          ${item.current_price.base_price?.toFixed(2)}
                        </div>
                      )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{item.stock_quantity}</div>
                  {item.min_stock_level && item.stock_quantity <= item.min_stock_level && (
                    <Badge variant="destructive" className="text-xs">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <StockAdjustmentDialog
                    itemId={item.id}
                    itemName={item.name}
                    currentStock={item.stock_quantity}
                    minStockLevel={item.min_stock_level || 0}
                    projectId={projectId}
                    defaultReason="manual_adjustment"
                  />
                  <ToggleItemStatusButton
                    itemId={item.id}
                    itemName={item.name}
                    projectId={projectId}
                    isActive={item.is_active ?? false}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
