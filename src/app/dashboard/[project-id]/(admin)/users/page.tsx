import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { UsersTable } from './users-table';
import { InviteUserDialog } from './invite-user-dialog';

// Force dynamic rendering since we need to check user role
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and invitations for your project</p>
        </div>
        <InviteUserDialog>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </InviteUserDialog>
      </div>

      <Suspense fallback={<div>Loading users...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
