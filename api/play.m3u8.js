<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play M3U8 Stream</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@0.14.19/dist/hls.min.js"></script>
</head>
<body>

<video id="video" width="100%" height="100%" controls></video>

<script>
  // Check if the browser supports HLS.js
  if (Hls.isSupported()) {
      var video = document.getElementById('video');
      var hls = new Hls({
          // Configuring buffer settings for better performance
          startLevel: -1, // Start with the best available level
          capLevelOnFPSDrop: true, // Cap video quality if FPS drops
          maxBufferLength: 30, // Max buffer length in seconds
          maxMaxBufferLength: 60, // Max overall buffer size in seconds
          maxBufferSize: 60 * 1000 * 1000, // Max buffer size in bytes
          liveSyncDurationCount: 3, // Number of segments to sync for live content
          maxBufferHole: 0.5, // Max allowed buffer hole (seconds)
      });

      // Provide the m3u8 stream URL
      hls.loadSource('http://119.156.26.155:8000/play/a05u/index.m3u8');
      hls.attachMedia(video);

      // Once HLS is attached to the video element, play it
      hls.on(Hls.Events.MANIFEST_LOADED, function () {
          video.play();
      });

      // Handle errors
      hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
              switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                      console.error('A network error occurred');
                      break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                      console.error('A media error occurred');
                      break;
                  case Hls.ErrorTypes.OTHER_ERROR:
                      console.error('An unknown error occurred');
                      break;
                  default:
                      console.error('A fatal error occurred');
                      break;
              }
          }
      });
  } else {
      console.error('HLS.js is not supported in this browser.');
  }
</script>

</body>
</html>
