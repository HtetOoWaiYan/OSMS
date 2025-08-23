import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { UsersTable } from './users-table';
import { InviteUserDialog } from './invite-user-dialog';

// Force dynamic rendering since we need to check user role
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader
        title="User Management"
        description="Manage users and invitations for your project"
      >
        <InviteUserDialog>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </InviteUserDialog>
      </PageHeader>

      <Suspense fallback={<div>Loading users...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
