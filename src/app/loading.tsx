import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Purple Shopping logo area */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Loading Purple Shopping...</p>
        </div>
      </div>
    </div>
  );
}
