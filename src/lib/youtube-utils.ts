
export function getVideoId(url: string): string | null {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            const videoIdParam = urlObj.searchParams.get('v');
            if (videoIdParam) return videoIdParam;
        }
    } catch (e) {
        // Handle cases where URL is not a full URL but just an ID
        const regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match) return match[1];
        return null;
    }
    return null;
}
