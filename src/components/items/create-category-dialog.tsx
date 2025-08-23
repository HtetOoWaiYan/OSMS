'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryForm } from './category-form';

interface CreateCategoryDialogProps {
  projectId: string;
}

export function CreateCategoryDialog({ projectId }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md"
        onClick={(e) => {
          // Prevent any clicks inside the dialog from propagating to parent
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>Add a new product category to organize your items</DialogDescription>
        </DialogHeader>
        <CategoryForm projectId={projectId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
