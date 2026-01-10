
'use client';

import { YouTubeDownloader } from './YouTubeDownloader';

export function YouTubeChannelLogoDownloader() {
  return (
    <YouTubeDownloader
      itemToFetch="logo"
      title="YouTube Logo Downloader"
      description="Enter a YouTube channel URL to download its profile picture (logo) in high resolution."
    />
  );
}
