
import { getAdminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    if (!shortId) {
        return new Response('Short ID is required', { status: 400 });
    }
    
    const adminDb = getAdminDb();
    const shortUrlRef = adminDb.collection('shortenedUrls').doc(shortId);
    const docSnap = await shortUrlRef.get();
    
    if (docSnap.exists) {
        const { originalUrl } = docSnap.data() as { originalUrl: string };
        // Perform a permanent redirect
        return NextResponse.redirect(originalUrl, 301);
    } else {
        return new Response('URL not found', { status: 404 });
    }

  } catch (error: any) {
    console.error('Redirect error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
