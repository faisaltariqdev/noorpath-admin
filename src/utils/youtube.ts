/**
 * YouTube Utility Helpers for NoorPath Portal
 * Provides robust URL extraction, ID validation, and thumbnail resolution.
 */

/**
 * Extracts an 11-character YouTube video ID from various URL formats or direct IDs.
 * Supported formats:
 * - youtu.be/<id>
 * - youtube.com/watch?v=<id>
 * - youtube.com/embed/<id>
 * - youtube-nocookie.com/embed/<id>
 * - youtube.com/shorts/<id>
 * - Plain 11-char ID (e.g., "hlJyUtgzgIM")
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already a valid 11-character alphanumeric YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    // youtu.be/<id>
    if (parsed.hostname.includes("youtu.be")) {
      const pathnameId = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      if (pathnameId && pathnameId.length === 11) return pathnameId;
    }

    // youtube.com / youtube-nocookie.com
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtube-nocookie.com")) {
      // /watch?v=<id>
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      // /embed/<id> or /shorts/<id> or /v/<id>
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = pathSegments.findIndex((s) => s === "embed" || s === "shorts" || s === "v");
      if (embedIdx !== -1 && pathSegments[embedIdx + 1]) {
        const id = pathSegments[embedIdx + 1].substring(0, 11);
        if (id.length === 11) return id;
      }
    }
  } catch {
    // If URL parsing fails, fallback to regex
  }

  const regexMatch = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/,
  );

  return regexMatch ? regexMatch[1] : null;
}

/**
 * Returns YouTube thumbnail URL
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: "maxresdefault" | "hqdefault" | "mqdefault" = "maxresdefault",
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Returns direct YouTube watch URL
 */
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
