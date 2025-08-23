'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Trash2, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedItems: string[];
  projectId: string;
  onActionComplete: () => void;
}

export function BulkActions({ selectedItems, projectId, onActionComplete }: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    setIsProcessing(true);

    try {
      // Here you would implement the actual bulk action API call
      // For now, we'll just simulate the action
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let message = '';
      switch (action) {
        case 'activate':
          message = `Activated ${selectedItems.length} items`;
          break;
        case 'deactivate':
          message = `Deactivated ${selectedItems.length} items`;
          break;
        case 'feature':
          message = `Featured ${selectedItems.length} items`;
          break;
        case 'unfeature':
          message = `Unfeatured ${selectedItems.length} items`;
          break;
        case 'delete':
          message = `Deactivated ${selectedItems.length} items`;
          break;
        default:
          message = `Action completed for ${selectedItems.length} items`;
      }

      toast.success(message);
      onActionComplete();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 flex items-center space-x-2 rounded-lg border p-4">
      <span className="text-muted-foreground text-sm">
        {selectedItems.length} item{selectedItems.length === 1 ? '' : 's'} selected
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isProcessing}>
            Bulk Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Status Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
            <Eye className="mr-2 h-4 w-4" />
            Activate Items
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
            <EyeOff className="mr-2 h-4 w-4" />
            Deactivate Items
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Feature Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleBulkAction('feature')}>
            <Star className="mr-2 h-4 w-4" />
            Feature Items
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('unfeature')}>
            <StarOff className="mr-2 h-4 w-4" />
            Unfeature Items
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash2 className="mr-2 h-4 w-4" />
                Deactivate Items
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate Items</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to deactivate {selectedItems.length} selected item
                  {selectedItems.length === 1 ? '' : 's'}? This will set them to inactive status.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleBulkAction('delete')}
                  disabled={isProcessing}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isProcessing ? 'Deactivating...' : 'Deactivate Items'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
