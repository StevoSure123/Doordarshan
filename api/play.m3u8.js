let cachedSegments = [];
const MAX_CACHE_SIZE = 50; // Limit cached segments
let lastSegmentFetched = null;

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

    // Parse new segments and update cache
    const newSegments = m3u8Data
      .split("\n")
      .filter((line) => line.endsWith(".ts"));

    newSegments.forEach((segment) => {
      if (!cachedSegments.includes(segment)) {
        cachedSegments.push(segment);
      }
    });

    // Enforce cache size limit
    if (cachedSegments.length > MAX_CACHE_SIZE) {
      cachedSegments = cachedSegments.slice(-MAX_CACHE_SIZE);
    }

    lastSegmentFetched = newSegments[newSegments.length - 1];

    // Preload next segments
    await preloadSegments(newSegments);

    // Dynamically build the playlist
    const updatedM3U8 = buildPlaylist(m3u8Data);

    // Set headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=10");

    res.status(200).send(updatedM3U8);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// Preload segments with a limit on parallel requests
async function preloadSegments(segments, concurrency = 5) {
  const preloadQueue = segments.slice(0, 10); // Preload the first 10 segments
  const chunkedQueue = Array.from({ length: Math.ceil(preloadQueue.length / concurrency) }, (_, i) =>
    preloadQueue.slice(i * concurrency, i * concurrency + concurrency)
  );

  for (const chunk of chunkedQueue) {
    await Promise.all(
      chunk.map((segment) =>
        fetch(new URL(segment, lastSegmentFetched).toString(), {
          headers: { Referer: "https://ranapk.spidy.online" },
        }).catch((err) => console.error(`Preload error for ${segment}:`, err))
      )
    );
  }
}

// Build playlist with cached and real-time segments
function buildPlaylist(m3u8Data) {
  const lines = m3u8Data.split("\n");
  const playlistSegments = lines.filter((line) => line.endsWith(".ts"));
  const allSegments = [...cachedSegments].join("\n");

  return lines
    .map((line) => (line.endsWith(".ts") ? allSegments : line))
    .join("\n");
}
