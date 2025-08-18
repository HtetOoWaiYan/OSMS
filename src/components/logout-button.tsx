'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

import { LogOut } from 'lucide-react';

interface LogoutButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  showIcon?: boolean;
  children?: React.ReactNode;
  asChild?: boolean;
}

export function LogoutButton({
  showIcon = true,
  children,
  variant = 'outline',
  size = 'sm',
  className = 'w-full',
  ...props
}: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/dashboard/auth/login');
  };

  return (
    <Button onClick={logout} variant={variant} size={size} className={className} {...props}>
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {children || 'Logout'}
    </Button>
  );
}
