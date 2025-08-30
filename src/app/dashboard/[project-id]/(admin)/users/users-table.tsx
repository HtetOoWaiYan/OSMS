import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Mail } from 'lucide-react';
import { getProjectUsers } from '@/lib/data/users';
import { UserTableActions } from './user-table-actions';

interface UsersTableProps {
  projectId: string;
}

export async function UsersTable({ projectId }: UsersTableProps) {
  const result = await getProjectUsers(projectId);

  if (!result.success || !result.data) {
    return (
      <div className="text-destructive py-8 text-center">
        <p>{result.error || 'Failed to load users'}</p>
      </div>
    );
  }

  const users = result.data;

  if (users.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <UserCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>No users found in this project</p>
        <p className="text-sm">Invite users to get started with team collaboration</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground text-sm">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.invitationStatus === 'confirmed' ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Pending</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(user.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <UserTableActions user={user} projectId={projectId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
