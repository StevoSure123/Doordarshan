export default async function handler(req, res) {
    const proxyUrl = "https://cors-proxy.cooks.fyi/";
    const m3u8Url = "https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=864";

    try {
        // Fetch the m3u8 playlist
        const response = await fetch(`${proxyUrl}${m3u8Url}`);
        if (!response.ok) {
            res.status(response.status).send(`Failed to fetch m3u8: ${response.statusText}`);
            return;
        }

        let originalM3U8 = await response.text();

        // Process the playlist to rewrite segment URLs
        const modifiedM3U8 = originalM3U8
            .split("\n")
            .map(line => {
                // Handle absolute URLs (e.g., ts.php links)
                if (line.includes("http") && !line.includes(proxyUrl)) {
                    return `${proxyUrl}${line}`;
                }

                // Handle relative segment URLs (e.g., .ts files)
                if (line.trim().endsWith(".ts")) {
                    return `${proxyUrl}${line.trim()}`;
                }

                // Return other lines as-is (e.g., headers like #EXTINF)
                return line;
            })
            .join("\n");

        // Send the modified playlist
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(modifiedM3U8);
    } catch (error) {
        console.error("Error processing m3u8:", error);
        res.status(500).send(`Error processing m3u8: ${error.message}`);
    }
                                  }
