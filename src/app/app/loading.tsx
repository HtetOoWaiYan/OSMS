import { Loader2 } from 'lucide-react';

export default function AppLoadingPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <div className="space-y-2">
          <h2 className="text-foreground text-lg font-semibold">Loading Purple Shopping</h2>
          <p className="text-muted-foreground text-sm">Verifying your access...</p>
        </div>
      </div>
    </div>
  );
}
