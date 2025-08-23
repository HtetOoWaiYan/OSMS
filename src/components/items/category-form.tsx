'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createCategoryActionSimple } from '@/lib/actions/items';

interface CategoryFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function CategoryForm({ projectId, onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Add the project ID to form data
      formData.append('projectId', projectId);

      const result = await createCategoryActionSimple(formData);

      if (result.success) {
        // Reset form and notify success
        const form = document.getElementById('category-form') as HTMLFormElement;
        form?.reset();

        if (onSuccess) {
          onSuccess();
        }

        // Refresh the page to show new category
        router.refresh();
      } else {
        setError(result.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="category-form"
      action={handleSubmit}
      className="space-y-4"
      onSubmit={(e) => {
        // Prevent the form submission from bubbling to parent forms
        e.stopPropagation();
      }}
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name*</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Electronics"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-end space-y-2">
          <div className="flex items-center space-x-2">
            <Switch id="isActive" name="isActive" defaultChecked={true} disabled={isSubmitting} />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Optional description for this category"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={(e) => {
            // Prevent event bubbling to parent forms
            e.stopPropagation();
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
