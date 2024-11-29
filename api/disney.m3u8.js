export default async function handler(req, res) {
    const m3u8Proxies = [
        "https://cors-proxy.cooks.fyi/",
        "https://thingproxy.freeboard.io/fetch/"
    ];

    const tsProxy = "https://thingproxy.freeboard.io/fetch/";

    const m3u8Url = "https://ranapk.spidy.online/MACX/JAZZ4K/play.m3u8?id=864";

    for (const proxyUrl of m3u8Proxies) {
        try {
            // Attempt to fetch m3u8 playlist through the proxy
            const response = await fetch(`${proxyUrl}${m3u8Url}`);
            if (!response.ok) {
                console.error(`Failed to fetch m3u8 using proxy ${proxyUrl}: ${response.statusText}`);
                continue; // Try the next proxy
            }

            let originalM3U8 = await response.text();

            // Process the playlist to update URLs for TS segments
            const modifiedM3U8 = originalM3U8
                .split("\n")
                .map(line => {
                    if (line.includes("ts.php?ts=")) {
                        const urlStart = line.indexOf("http");
                        if (urlStart !== -1) {
                            const url = line.substring(urlStart);
                            return line.replace(url, `${tsProxy}${url}`);
                        }
                    }

                    if (line.trim().endsWith(".ts") && !line.includes(tsProxy)) {
                        return `${tsProxy}${line.trim()}`;
                    }

                    return line;
                })
                .join("\n");

            const loopedM3U8 = modifiedM3U8.replace(/#EXT-X-ENDLIST/g, "").trim();

            // Send the modified playlist
            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            return res.status(200).send(loopedM3U8);
        } catch (error) {
            console.error(`Error fetching m3u8 with proxy ${proxyUrl}:`, error);
        }
    }

    res.status(500).send("Failed to fetch m3u8 with all available proxies.");
}
