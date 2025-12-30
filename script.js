document.addEventListener("DOMContentLoaded", () => {

  /********************
   * VARIABLES DOM
   ********************/
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const audioSelect = document.getElementById("audioSelect");
  const audioElement = document.getElementById("audioFile");

  const loopTrackCheckbox = document.getElementById("loopTrack");
  const loopPlaylistCheckbox = document.getElementById("loopPlaylist");

  let audioCtx, analyser, dataArray;
  let currentTrackIndex = 0;

  /********************
   * PLAYLIST LOCALE
   ********************/
  const audioFiles = [
    "song/396 HZ.mp3",
    "song/432 HZ.mp3"
  ];

  audioSelect.innerHTML = "";

  audioFiles.forEach(file => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file.replace("song/", "");
    audioSelect.appendChild(option);
  });

  if (audioFiles.length > 0) {
    audioElement.src = audioFiles[0];
  }

  audioSelect.addEventListener("change", () => {
    currentTrackIndex = audioSelect.selectedIndex;
    audioElement.src = audioFiles[currentTrackIndex];
    audioElement.play();
  });

  /********************
   * AUDIO ANALYSIS
   ********************/
  function setupAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audioElement);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  audioElement.addEventListener("play", () => {
    if (!audioCtx) setupAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
  });

  /********************
   * PLAYLIST AUTO / BOUCLE
   ********************/
  audioElement.addEventListener("ended", () => {

    // 🔁 boucle du morceau
    if (loopTrackCheckbox.checked) {
      audioElement.currentTime = 0;
      audioElement.play();
      return;
    }

    // ▶️ morceau suivant
    currentTrackIndex++;

    // fin de playlist
    if (currentTrackIndex >= audioFiles.length) {
      if (loopPlaylistCheckbox.checked) {
        currentTrackIndex = 0;
      } else {
        return;
      }
    }

    audioSelect.selectedIndex = currentTrackIndex;
    audioElement.src = audioFiles[currentTrackIndex];
    audioElement.play();
  });

  /********************
   * CHLADNI VISUEL
   ********************/
  function drawChladni({ m, n, threshold, size, color }) {
    const scale = 160;
    const step = 2;
    const L = Math.PI;

    ctx.fillStyle = color;

    for (let x = -scale; x <= scale; x += step) {
      for (let y = -scale; y <= scale; y += step) {
        const nx = (x / scale) * L;
        const ny = (y / scale) * L;

        const v =
          Math.cos(n * nx) * Math.cos(m * ny) -
          Math.cos(m * nx) * Math.cos(n * ny);

        if (Math.abs(v) < threshold) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }

  /****
