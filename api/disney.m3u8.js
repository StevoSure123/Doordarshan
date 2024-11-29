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

        // Process the playlist to update URLs
        const modifiedM3U8 = originalM3U8
            .split("\n")
            .map(line => {
                // Modify ts.php links
                if (line.includes("ts.php?ts=")) {
                    const urlStart = line.indexOf("http");
                    if (urlStart !== -1) {
                        const url = line.substring(urlStart);
                        return line.replace(url, `${proxyUrl}${url}`);
                    }
                }

                // Add proxy to .ts files, but skip if already proxied
                if (line.trim().endsWith(".ts") && !line.includes(proxyUrl)) {
                    return `${proxyUrl}${line.trim()}`;
                }

                return line;
            })
            .join("\n");

        // Ensure no #EXT-X-ENDLIST for infinite loop playback
        const loopedM3U8 = modifiedM3U8.replace(/#EXT-X-ENDLIST/g, "").trim();

        // Send the modified playlist
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(loopedM3U8);
    } catch (error) {
        // Enhanced error message for debugging
        console.error("Error processing m3u8:", error);
        res.status(500).send(`Error processing m3u8: ${error.message}`);
    }
                            }
