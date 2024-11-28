export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Validate the presence of the 'id' query parameter
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    // Build the original M3U8 URL
    const originalUrl = `https://allinonereborn.com/dd.m3u8?id=${id}`;

    // Fetch the M3U8 file from the original URL
    const response = await fetch(originalUrl);

    // Handle fetch failure
    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch M3U8 from the original URL: ${response.statusText}`,
      });
      return;
    }

    // Parse the M3U8 data
    const m3u8Data = await response.text();

    // Add CORS headers to allow playback in the browser
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    // Send the M3U8 data as the response
    res.status(200).send(m3u8Data);
  } catch (error) {
    console.error("Error in M3U8 handler:", error);

    // Return a 500 error with the details
    res.status(500).json({ error: "Internal server error." });
  }
}
