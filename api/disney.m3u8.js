// diseny.m3u8.js
(function() {
    // Function to replace ts-proxy with m3u8-proxy in the URL
    function replaceProxyInUrl(url) {
        // Check if the url contains "ts-proxy" and replace it with "m3u8-proxy"
        return url.replace(/ts-proxy/g, "m3u8-proxy");
    }

    // URL from the m3u8-proxy you provided
    const originalM3U8Url = "http://119.156.26.155:8000/play/a05u/index.m3u8";
    const referer = "https://9anime.pl"; // Referer header

    // Construct the m3u8 proxy URL
    const m3u8ProxyUrl = `https://m3u8-proxy-six.vercel.app/m3u8-proxy?url=${encodeURIComponent(originalM3U8Url)}&headers=${encodeURIComponent(JSON.stringify({ referer }))}`;

    // Replace any instances of ts-proxy in the URL with m3u8-proxy
    const updatedM3U8Url = replaceProxyInUrl(m3u8ProxyUrl);

    // Example of how you can use the updated URL
    console.log("Updated M3U8 URL:", updatedM3U8Url);

    // Here you could dynamically use this URL in your application or player
    // For example, setting it as the source of a video player element
    const videoElement = document.getElementById("video-player");
    if (videoElement) {
        videoElement.src = updatedM3U8Url;
    }
})();
