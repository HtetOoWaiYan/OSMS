'use client';

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectUser } from '@/lib/data/users';

interface UserTableActionsProps {
  user: ProjectUser;
}

export function UserTableActions({ user }: UserTableActionsProps) {
  const handleResendInvitation = () => {
    // TODO: Implement resend invitation functionality
    console.log('Resend invitation for:', user.email);
  };

  const handleRemoveUser = () => {
    // TODO: Implement remove user functionality
    console.log('Remove user:', user.email);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleResendInvitation}>
          <Mail className="mr-2 h-4 w-4" />
          Resend invitation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRemoveUser}>
          <UserX className="mr-2 h-4 w-4" />
          Remove user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
