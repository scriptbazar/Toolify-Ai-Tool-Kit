
import { getOriginalUrl } from '@/ai/flows/url-shortener';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export default async function ShortUrlRedirectPage({ params }: { params: { shortId: string } }) {
  const { shortId } = params;
  const originalUrl = await getOriginalUrl(shortId);

  if (originalUrl) {
    redirect(originalUrl);
  } else {
    notFound();
  }
}
