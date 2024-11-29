export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Check if 'id' parameter is present
    if (!id) {
      return res.status(400).json({ error: "Missing 'id' query parameter." });
    }

    const originalUrl = `https://cors-proxy.cooks.fyi/https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=${id}`;

    // Fetch the M3U8 playlist from the original URL
    const response = await fetch(originalUrl);

    // If the fetch fails
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch M3U8 from original URL: ${response.statusText}`,
      });
    }

    // Parse the M3U8 data as text
    let m3u8Data = await response.text();

    // Replace segment URLs with proxied URLs
    const proxyBaseUrl = "https://cors-proxy.cooks.fyi/https://ranapk.spidy.online/";
    m3u8Data = m3u8Data.replace(/(https?:\/\/[^\/]+\/[^\.]+\.ts)/g, (match) => {
      return proxyBaseUrl + match.replace(/^https?:\/\/[^\/]+\//, "");
    });

    // Optimize CORS and caching headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=5"); // Cache for 5 seconds for better performance

    // Preload related media segments (for reducing buffering)
    const preloadedSegments = m3u8Data
      .split("\n")
      .filter(line => line.endsWith(".ts")) // Fetch .ts files
      .map(segmentUrl =>
        fetch(new URL(segmentUrl, originalUrl).toString()).catch(err => console.error("Preload error:", err))
      );

    // Wait for preloading to complete (non-blocking, or use await if blocking is needed)
    Promise.all(preloadedSegments)
      .then(() => console.log("Segments preloaded"))
      .catch(err => console.error("Error preloading segments:", err));

    // Send the M3U8 playlist as the response
    res.status(200).send(m3u8Data);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
