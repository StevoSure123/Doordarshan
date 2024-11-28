export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Ensure 'id' is provided
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    const originalUrl = `https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=${id}`;

    // Fetch the original M3U8 playlist
    const response = await fetch(originalUrl, {
      headers: {
        Referer: "https://ranapk.spidy.online", // Add Referer if required by the server
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch M3U8: ${response.statusText}`,
      });
      return;
    }

    const m3u8Data = await response.text();

    // Rewrite relative URLs to absolute
    const baseUrl = originalUrl.replace(/\/[^/]*$/, "/");
    const rewrittenM3U8 = m3u8Data.replace(
      /(^(?!https?:\/\/|#).*)/gm, // Matches relative URLs
      (match) => new URL(match, baseUrl).href
    );

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    // Send the rewritten M3U8 data
    res.status(200).send(rewrittenM3U8);
  } catch (error) {
    console.error("Error in M3U8 proxy handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
