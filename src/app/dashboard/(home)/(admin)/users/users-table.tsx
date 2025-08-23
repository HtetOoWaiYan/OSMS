"use client";

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, UserCheck, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getProjectUsersAction } from '@/lib/actions/users';
import type { ProjectUser } from '@/lib/data/users';

export function UsersTable() {
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getProjectUsersAction();
      
      if (result.success && result.data) {
        setUsers(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
        <Button onClick={loadUsers} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No users found in this project</p>
        <p className="text-sm">Invite users to get started with team collaboration</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
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
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.invitationStatus === 'confirmed' ? (
                    <>
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Pending</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(user.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend invitation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserX className="mr-2 h-4 w-4" />
                      Remove user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
