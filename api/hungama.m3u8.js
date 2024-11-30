const proxyUrl = 'https://m3u8-proxy-six.vercel.app/m3u8-proxy';  // The URL you want to use for proxying
const targetUrl = 'https://stalker.yuvraj49.xyz/zjzly/stream.php?id=1094&headers=%7B%22referer%22%3A%22https%3A%2F%2F9anime.pl%22%7D';  // The target m3u8 URL

function fetchM3U8() {
    const headers = {
        'Referer': 'https://9anime.pl', // Ensure proper headers
    };

    const url = `${proxyUrl}?url=${encodeURIComponent(targetUrl)}&headers=${encodeURIComponent(JSON.stringify(headers))}`;

    // Fetch the m3u8 file through the proxy
    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log('M3U8 Proxy Response:', data);
            // You can use this m3u8 data now to load into a player
            // Example: Load this URL into a video player (like video.js or hls.js)
            // For example:
            // var player = new Hls();
            // player.loadSource(data);
            // player.attachMedia(videoElement);
        })
        .catch(error => {
            console.error('Error fetching M3U8 file:', error);
        });
}

fetchM3U8();
