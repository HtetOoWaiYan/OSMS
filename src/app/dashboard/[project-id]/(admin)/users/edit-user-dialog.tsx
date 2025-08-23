'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import { updateUserRoleSchema, type UpdateUserRoleData } from '@/lib/validations/users';
import { updateUserRoleAction } from '@/lib/actions/users';
import { toast } from 'sonner';
import type { ProjectUser } from '@/lib/data/users';

interface EditUserDialogProps {
  children: React.ReactNode;
  user: ProjectUser;
}

export function EditUserDialog({ children, user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateUserRoleData>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      userId: user.id,
      role: user.role,
    },
  });

  const onSubmit = async (data: UpdateUserRoleData) => {
    try {
      setIsLoading(true);

      const result = await updateUserRoleAction(data);

      if (result.success) {
        toast.success('User role updated successfully');
        form.reset();
        setOpen(false);
        // Refresh the page to show the updated role
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit User Role
          </DialogTitle>
          <DialogDescription>
            Change the role for {user.name} ({user.email}). This will affect their permissions in
            the project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Agents can handle orders and customers. Admins have full project access.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Role
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
