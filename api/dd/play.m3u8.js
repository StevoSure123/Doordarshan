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

    // Fetch M3U8 data
    const m3u8Data = await response.text();

    // Rewrite relative segment URLs to absolute
    const baseUrl = originalUrl.replace(/\/[^/]*$/, "/");
    const rewrittenM3U8 = m3u8Data.replace(
      /(^(?!https?:\/\/|#).*)/gm, // Match relative URLs (not starting with http/https/#)
      (match) => new URL(match, baseUrl).href // Rewrite with full URL
    );

    // Set headers for CORS and streaming
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    // Send the rewritten M3U8 file
    res.status(200).send(rewrittenM3U8);
  } catch (error) {
    console.error("Error proxying M3U8:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
