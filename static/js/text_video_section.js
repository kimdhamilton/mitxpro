/*eslint-env jquery*/
/*eslint semi: ["error", "always"]*/
/* global Hls */

function initializeHlsVideo(VideoSelector) {
  const video = VideoSelector.get(0);

  if (video) {
    const videoUrl = VideoSelector.data("source");
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } // eslint-disable-line brace-style
    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
    // This is using the built-in support of the plain video element, without using hls.js.
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    }
  }
}

$(document).ready(function() {
  const tvVideo = $("#tv-video");
  const lightBoxVideo = $("#tv-light-box-video");
  initializeHlsVideo(tvVideo);
  initializeHlsVideo(lightBoxVideo);
});
