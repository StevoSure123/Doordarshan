export default async function handler(req, res) {
    const proxyUrl = "https://cors-proxy.cooks.fyi/";
    const m3u8Url = "https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=864";

    try {
        // Fetch the original m3u8 playlist via the proxy
        const response = await fetch(`${proxyUrl}${m3u8Url}`);
        if (!response.ok) {
            res.status(response.status).send(`Failed to fetch m3u8: ${response.statusText}`);
            return;
        }

        const originalM3U8 = await response.text();

        // Rewrite the playlist URLs to include the proxy
        const modifiedM3U8 = originalM3U8
            .split("\n")
            .map(line => {
                // Rewrite fully-qualified URLs (e.g., ts.php or .ts URLs)
                if (line.startsWith("http") && !line.startsWith(proxyUrl)) {
                    return `${proxyUrl}${line}`;
                }

                // Rewrite relative segment URLs (e.g., .ts files without a base URL)
                if (line.trim().endsWith(".ts") && !line.startsWith(proxyUrl)) {
                    const relativeUrl = new URL(line, m3u8Url).href; // Resolve relative URL
                    return `${proxyUrl}${relativeUrl}`;
                }

                // Leave other lines (e.g., #EXTINF) unchanged
                return line;
            })
            .join("\n");

        // Send the modified playlist to the client
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(modifiedM3U8);
    } catch (error) {
        console.error("Error processing m3u8:", error);
        res.status(500).send(`Error processing m3u8: ${error.message}`);
    }
            }
