'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, UserX, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { removeUserAction, resendInvitationAction } from '@/lib/actions/users';
import { EditUserDialog } from './edit-user-dialog';
import type { ProjectUser } from '@/lib/data/users';

interface UserTableActionsProps {
  user: ProjectUser;
  projectId: string;
}

export function UserTableActions({ user, projectId }: UserTableActionsProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResendInvitation = async () => {
    try {
      setIsLoading(true);
      const result = await resendInvitationAction(
        {
          userId: user.id,
          email: user.email,
        },
        projectId,
      );

      if (result.success) {
        toast.success('Invitation resent successfully');
      } else {
        toast.error(result.error || 'Failed to resend invitation');
      }
    } catch (error) {
      toast.error('Failed to resend invitation');
      console.error('Error resending invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    try {
      setIsLoading(true);
      const result = await removeUserAction(
        {
          userId: user.id,
        },
        projectId,
      );

      if (result.success) {
        toast.success('User removed successfully');
        setShowRemoveDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to remove user');
      }
    } catch (error) {
      toast.error('Failed to remove user');
      console.error('Error removing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show actions for pending users who haven't confirmed their invitation
  const canEdit = user.invitationStatus === 'confirmed';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.invitationStatus === 'pending' && (
            <DropdownMenuItem onClick={handleResendInvitation} disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              Resend invitation
            </DropdownMenuItem>
          )}

          {canEdit && (
            <EditUserDialog user={user} projectId={projectId}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                Edit role
              </DropdownMenuItem>
            </EditUserDialog>
          )}

          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="text-destructive focus:text-destructive"
            disabled={isLoading}
          >
            <UserX className="mr-2 h-4 w-4" />
            Remove user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{user.name}</strong> ({user.email}) from this
              project? This action cannot be undone and they will lose access to all project data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
