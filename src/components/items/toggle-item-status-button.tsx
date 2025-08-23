'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleItemStatusButtonProps {
  itemId: string;
  itemName: string;
  projectId: string;
  isActive: boolean;
  onToggle?: () => void;
}

export function ToggleItemStatusButton({
  itemId,
  itemName,
  projectId,
  isActive,
  onToggle,
}: ToggleItemStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent row click when clicking the status

    setIsLoading(true);

    try {
      // Create form data for the toggle action
      const formData = new FormData();
      formData.append('itemId', itemId);
      formData.append('projectId', projectId);
      formData.append('isActive', isActive.toString());

      // Import the action
      const { toggleItemStatusAction } = await import('@/lib/actions/items');
      const result = await toggleItemStatusAction(formData);

      if (result.success) {
        toast.success(
          isActive ? `${itemName} has been set to inactive` : `${itemName} has been activated`,
        );
        onToggle?.();
        // Refresh the page to update the status
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update item status');
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge
        variant={isActive ? 'default' : 'secondary'}
        className="cursor-pointer"
        onClick={handleToggle}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className="h-6 w-6 p-0"
        title={isActive ? 'Set to Inactive' : 'Set to Active'}
      >
        {isActive ? (
          <PowerOff className="h-3 w-3 text-red-500" />
        ) : (
          <Power className="h-3 w-3 text-green-500" />
        )}
      </Button>
    </div>
  );
}
