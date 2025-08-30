'use server'

import { revalidateTag } from 'next/cache'

export async function refreshAnalytics(projectId: string) {
  revalidateTag(`analytics-${projectId}`)
}
