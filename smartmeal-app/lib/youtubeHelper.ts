/**
 * YouTube API Helper
 * Search for cooking videos related to recipes
 */

export interface YouTubeSearchResult {
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
}

/**
 * Search YouTube for a recipe video
 */
export async function searchYouTubeVideo(
  recipeName: string
): Promise<YouTubeSearchResult> {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.warn("YouTube API key not configured");
    return { videoId: null, title: null, thumbnail: null };
  }

  try {
    const query = encodeURIComponent(`${recipeName} recipe tutorial`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoDuration=medium&relevanceLanguage=en&maxResults=1&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
      };
    }

    return { videoId: null, title: null, thumbnail: null };
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return { videoId: null, title: null, thumbnail: null };
  }
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  // Use youtube-nocookie.com for privacy
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: "default" | "medium" | "high" = "medium"): string {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
