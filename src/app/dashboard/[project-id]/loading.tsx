import { Skeleton } from '@/components/ui/skeleton';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Loading() {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="space-y-6 p-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="rounded-md border">
              <div className="grid grid-cols-4 gap-4 border-b p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 border-b p-4 last:border-0">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
