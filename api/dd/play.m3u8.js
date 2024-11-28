export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Check if the 'id' parameter is provided
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    // URL for the original M3U8 playlist (passing the id as a query parameter)
    const originalUrl = `https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=${id}`;

    // Fetch the original M3U8 file from the source
    const response = await fetch(originalUrl, {
      headers: {
        Referer: "https://ranapk.spidy.online", // This may be required for the server to accept the request
      },
    });

    // If the response is not successful, return an error
    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch M3U8: ${response.statusText}`,
      });
      return;
    }

    // Read the M3U8 data as text
    const m3u8Data = await response.text();

    // Rewrite relative segment URLs in the M3U8 file to absolute URLs
    const baseUrl = originalUrl.replace(/\/[^/]*$/, "/");
    const rewrittenM3U8 = m3u8Data.replace(
      /(^(?!https?:\/\/|#).*)/gm, // Regex to match relative URLs
      (match) => new URL(match, baseUrl).href
    );

    // Set CORS headers to allow any origin to access the M3U8 file and its segments
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS"); // Allow GET and OPTIONS methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl"); // M3U8 content type

    // Send the modified M3U8 file with CORS headers
    res.status(200).send(rewrittenM3U8);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in M3U8 proxy handler:", error);

    // Send internal server error if something goes wrong
    res.status(500).json({ error: "Internal server error." });
  }
}
