export default async function handler(req, res) {
    const proxyUrl = "https://cors-proxy.cooks.fyi/";
    const m3u8Url = "https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=864";

    try {
        const response = await fetch(`${proxyUrl}${m3u8Url}`);
        if (!response.ok) {
            res.status(response.status).send(`Failed to fetch m3u8: ${response.statusText}`);
            return;
        }

        let originalM3U8 = await response.text();

        const modifiedM3U8 = originalM3U8
            .split("\n")
            .map(line => {
                if (line.includes("ts.php?ts=")) {
                    const urlStart = line.indexOf("http");
                    const url = line.substring(urlStart);
                    return line.replace(url, `${proxyUrl}${url}`);
                } else if (line.trim().endsWith(".ts")) {
                    return `${proxyUrl}${line.trim()}`;
                }
                return line;
            })
            .join("\n");

        // Ensure playlist has #EXT-X-ENDLIST for proper playback
        if (!modifiedM3U8.includes("#EXT-X-ENDLIST")) {
            modifiedM3U8 += "\n#EXT-X-ENDLIST";
        }

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(modifiedM3U8);
    } catch (error) {
        res.status(500).send(`Error processing m3u8: ${error.message}`);
    }
}
