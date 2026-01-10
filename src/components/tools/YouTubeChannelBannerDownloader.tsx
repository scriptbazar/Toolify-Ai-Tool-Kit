
'use client';

import { YouTubeDownloader } from './YouTubeDownloader';

export function YouTubeChannelBannerDownloader() {
  return (
    <YouTubeDownloader
      itemToFetch="banner"
      title="YouTube Banner Downloader"
      description="Enter a YouTube channel URL to download its banner image in the highest available resolution."
    />
  );
}
