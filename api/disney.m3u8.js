export default async function handler(req, res) {
    const proxyUrl = "https://cors-proxy.cooks.fyi/"; // Proxy server URL
    const m3u8Url = "https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=864"; // Original m3u8 URL

    try {
        // Fetch the original m3u8 playlist
        const response = await fetch(`${proxyUrl}${m3u8Url}`);
        if (!response.ok) {
            res.status(response.status).send(`Failed to fetch m3u8: ${response.statusText}`);
            return;
        }

        const originalM3U8 = await response.text();

        // Rewrite segment URLs in the playlist
        const modifiedM3U8 = originalM3U8
            .split("\n")
            .map(line => {
                if (line.startsWith("http") && !line.startsWith(proxyUrl)) {
                    // Proxy absolute URLs
                    return `${proxyUrl}${line}`;
                } else if (line.trim().endsWith(".ts") || line.includes("ts.php")) {
                    // Proxy relative segment URLs
                    const relativeUrl = new URL(line, m3u8Url).href;
                    return `${proxyUrl}${relativeUrl}`;
                }
                // Leave other lines (e.g., #EXTINF) unchanged
                return line;
            })
            .join("\n");

        // Serve the modified m3u8 playlist
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(modifiedM3U8);
    } catch (error) {
        console.error("Error processing m3u8:", error);
        res.status(500).send(`Error processing m3u8: ${error.message}`);
    }
}
