export default async function handler(req, res) {
    const proxyUrl = "https://cors-proxy.cooks.fyi/";
    const m3u8Url = "https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=864";

    try {
        // Fetch the original m3u8 playlist through the proxy
        const response = await fetch(`${proxyUrl}${m3u8Url}`);
        if (!response.ok) {
            res.status(response.status).send(`Failed to fetch m3u8: ${response.statusText}`);
            return;
        }

        const originalM3U8 = await response.text();

        // Process the m3u8 to prepend the proxy URL to all .ts segment URLs
        const modifiedM3U8 = originalM3U8
            .split("\n")
            .map(line => {
                if (line.trim().endsWith(".ts") || line.trim().startsWith("http")) {
                    return `${proxyUrl}${line.trim()}`;
                }
                return line;
            })
            .join("\n");

        // Set appropriate headers for an m3u8 playlist
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(modifiedM3U8);
    } catch (error) {
        res.status(500).send(`Error processing m3u8: ${error.message}`);
    }
}
