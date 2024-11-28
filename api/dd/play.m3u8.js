export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Check if 'id' parameter is present
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    // Build the original URL for the M3U8 file
    const originalUrl = `https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=${id}`;

    // Fetch the M3U8 playlist from the original URL (without headers)
    const response = await fetch(originalUrl);

    // If the fetch fails
    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch M3U8 from original URL: ${response.statusText}`,
      });
      return;
    }

    // Parse the M3U8 data as text
    const m3u8Data = await response.text();

    // Fix relative URLs in the M3U8 file to be absolute
    const baseUrl = originalUrl.replace(/\/[^/]*$/, "/");
    const rewrittenM3U8 = m3u8Data.replace(
      /(^(?!https?:\/\/|#).*)/gm,
      (match) => new URL(match, baseUrl).href
    );

    // Set CORS headers to allow the browser to handle the file
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    // Send the M3U8 data as the response
    res.status(200).send(rewrittenM3U8);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in M3U8 proxy handler:", error);

    // Respond with a 500 internal server error and error details
    res.status(500).json({ error: "Internal server error." });
  }
}
