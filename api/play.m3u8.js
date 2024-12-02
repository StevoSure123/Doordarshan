export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    const originalUrl = https://m3u8-proxy-six.vercel.app/m3u8-proxy?url=https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=${id}&headers=%7B%22referer%22%3A%22https%3A%2F%2F9anime.pl%22%7D;

    const response = await fetch(originalUrl, {
      headers: { Referer: "https://ranapk.spidy.online" },
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: Failed to fetch M3U8 from original URL: ${response.statusText},
      });
      return;
    }

    const m3u8Data = await response.text();

    // Extract TS segment URLs
    const tsSegments = m3u8Data.split("\n").filter((line) => line.endsWith(".ts"));

    // Preload TS segments asynchronously
    const preloadSegments = async (urls, maxSegments = 5) => {
      const limitedUrls = urls.slice(0, maxSegments);
      await Promise.all(
        limitedUrls.map((url) =>
          fetch(new URL(url, originalUrl).toString(), {
            headers: { Referer: "https://ranapk.spidy.online" },
          }).catch((e) => console.warn(Preload failed for ${url}: ${e.message}))
        )
      );
    };

    preloadSegments(tsSegments, 5); // Preload the first 5 segments

    // Set response headers for CORS, caching, and content type
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=30"); // Cache for 30 seconds

    // Send the M3U8 playlist
    res.status(200).send(m3u8Data);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
