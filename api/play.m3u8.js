let cachedSegments = []; // Cache for fetched .ts segments
let lastFetchedSegment = null; // Track the last fetched segment

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).end();
      return;
    }

    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    const originalUrl = `https://m3u8-proxy-six.vercel.app/m3u8-proxy?url=https://ranapk.spidy.online/MACX/JAZZ4K0/play.m3u8?id=${id}&headers=%7B%22referer%22%3A%22https%3A%2F%2F9anime.pl%22%7D`;

    const response = await fetch(originalUrl, {
      headers: { Referer: "https://ranapk.spidy.online" },
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch M3U8 from original URL: ${response.statusText}`,
      });
      return;
    }

    const m3u8Data = await response.text();

    // Parse and update segment cache
    const tsSegments = m3u8Data
      .split("\n")
      .filter((line) => line.endsWith(".ts"));

    // Cache new segments
    tsSegments.forEach((seg) => {
      if (!cachedSegments.includes(seg)) {
        cachedSegments.push(seg);
      }
    });

    lastFetchedSegment = tsSegments[tsSegments.length - 1];

    // Preload more segments
    await preloadSegments(tsSegments);

    // Dynamically build the playlist for playback
    const updatedM3U8 = buildDynamicPlaylist(m3u8Data);

    // Set response headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=10"); // Short cache for near real-time updates

    res.status(200).send(updatedM3U8);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// Function to preload segments
async function preloadSegments(segments, retries = 3) {
  for (const segment of segments) {
    try {
      const segmentUrl = new URL(segment, originalUrl).toString();
      await fetch(segmentUrl, {
        headers: { Referer: "https://ranapk.spidy.online" },
      });
    } catch (error) {
      console.error(`Failed to preload segment: ${segment}, Error: ${error}`);
      if (retries > 0) {
        await preloadSegments([segment], retries - 1);
      }
    }
  }
}

// Function to build a dynamic playlist
function buildDynamicPlaylist(m3u8Data) {
  const lines = m3u8Data.split("\n");
  const segments = lines.filter((line) => line.endsWith(".ts"));

  // Append new segments dynamically
  const allSegments = [...cachedSegments].join("\n");

  return lines
    .map((line) => (line.endsWith(".ts") ? allSegments : line))
    .join("\n");
}
