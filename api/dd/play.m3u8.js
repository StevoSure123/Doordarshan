export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    const originalUrl = `https://allinonereborn.com/dd.m3u8?id=${id}`;
    const response = await fetch(originalUrl);

    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch M3U8: ${response.statusText}`,
      });
      return;
    }

    const m3u8Data = await response.text();

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    res.status(200).send(m3u8Data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
