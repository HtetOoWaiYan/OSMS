import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ message: 'No tag provided' }, { status: 400 });
  }

  revalidateTag(tag);

  return NextResponse.json({ message: `${tag} revalidated` }, { status: 200 });
}
