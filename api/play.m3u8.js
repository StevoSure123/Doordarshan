export default async function handler(req, res) {
  try {
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

    // Set CORS and cache headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=60"); // Cache for 60 seconds

    // Optimize preloading
    const tsSegments = m3u8Data
      .split("\n")
      .filter((line) => line.endsWith(".ts"))
      .map((url) => new URL(url, originalUrl).toString());

    const preloadWithLimit = async (urls, limit = 3) => {
      const chunks = Array.from({ length: Math.ceil(urls.length / limit) }, (_, i) =>
        urls.slice(i * limit, i * limit + limit)
      );

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((url) =>
            fetch(url, { headers: { Referer: "https://ranapk.spidy.online" } }).catch(() => null)
          )
        );
      }
    };

    preloadWithLimit(tsSegments.slice(0, 5)); // Preload the next 5 segments

    res.status(200).send(m3u8Data);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
