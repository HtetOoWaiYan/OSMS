'use client';

import { Badge } from '@/components/ui/badge';

export function LiveSaleBanner() {
  return (
    <div className="bg-yellow-400 px-4 py-3 text-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Live Sale</h2>
          <Badge
            variant="secondary"
            className="h-6 rounded-full bg-white px-2 text-sm font-semibold text-black hover:bg-white"
          >
            12
          </Badge>
        </div>
        <div className="text-sm font-medium">Special deals available now!</div>
      </div>
    </div>
  );
}
