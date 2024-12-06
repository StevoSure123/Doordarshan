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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=30");

    const tsSegments = m3u8Data.split("\n").filter((line) => line.endsWith(".ts"));

    const preloadWithLimit = async (urls, limit = 5) => {
      const chunks = Array.from(
        { length: Math.ceil(urls.length / limit) },
        (_, i) => urls.slice(i * limit, i * limit + limit)
      );
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((url) =>
            fetch(new URL(url, originalUrl).toString(), {
              headers: { Referer: "https://ranapk.spidy.online" },
            })
          )
        );
      }
    };

    try {
      await preloadWithLimit(tsSegments.slice(0, 2)); // Preload the next 2 segments
    } catch (preloadError) {
      console.error("Error during segment preloading:", preloadError);
    }

    res.status(200).send(m3u8Data);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
