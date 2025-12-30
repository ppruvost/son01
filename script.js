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
  const customPlayButton = document.getElementById("customPlayButton");

  let audioCtx, analyser, dataArray;
  let currentTrackIndex = 0;
  let isPlaying = false;

  /********************
   * PLAYLIST LOCALE
   ********************/
  const audioFiles = [
    "song/396 Hz.mp3",
    "song/432 Hz.mp3"
  ];

  // Remplit la liste déroulante
  audioFiles.forEach((file, index) => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file.replace("song/", "");
    audioSelect.appendChild(option);
  });

  // Charge le premier morceau
  if (audioFiles.length > 0) {
    audioElement.src = audioFiles[0];
  }

  /********************
   * GESTION DE LA LECTURE
   ********************/
  customPlayButton.addEventListener("click", () => {
    if (audioElement.paused) {
      audioElement.play()
        .then(() => {
          customPlayButton.textContent = "Pause";
          isPlaying = true;
        })
        .catch(e => {
          console.error("Erreur de lecture :", e);
          alert("La lecture a été bloquée par le navigateur. Veuillez interagir avec la page et réessayer.");
        });
    } else {
      audioElement.pause();
      customPlayButton.textContent = "Lecture";
      isPlaying = false;
    }
  });

  // Changement de morceau
  audioSelect.addEventListener("change", () => {
    currentTrackIndex = audioSelect.selectedIndex;
    audioElement.src = audioFiles[currentTrackIndex];
    if (isPlaying) {
      audioElement.play()
        .catch(e => console.error("Erreur de lecture :", e));
    }
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
    drawLoop();
  });

  /********************
   * PLAYLIST AUTO / BOUCLE
   ********************/
  audioElement.addEventListener("ended", () => {
    if (loopTrackCheckbox.checked) {
      audioElement.currentTime = 0;
      audioElement.play()
        .catch(e => console.error("Erreur de lecture :", e));
      return;
    }
    currentTrackIndex++;
    if (currentTrackIndex >= audioFiles.length) {
      if (loopPlaylistCheckbox.checked) {
        currentTrackIndex = 0;
      } else {
        customPlayButton.textContent = "Lecture";
        isPlaying = false;
        return;
      }
    }
    audioSelect.selectedIndex = currentTrackIndex;
    audioElement.src = audioFiles[currentTrackIndex];
    audioElement.play()
      .catch(e => console.error("Erreur de lecture :", e));
  });

  /********************
   * CHLADNI VISUEL
   ********************/
  function drawChladni({ m = 1, n = 1, threshold = 0.1, size = 2, color = "#e7dfd3" } = {}) {
    const scale = 160;
    const step = 2;
    const L = Math.PI;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;

    for (let x = -scale; x <= scale; x += step) {
      for (let y = -scale; y <= scale; y += step) {
        const nx = (x / scale) * L;
        const ny = (y / scale) * L;
        const v = Math.cos(n * nx) * Math.cos(m * ny) - Math.cos(m * nx) * Math.cos(n * ny);
        if (Math.abs(v) < threshold) {
          ctx.fillRect(x + canvas.width/2, y + canvas.height/2, size, size);
        }
      }
    }
  }

  function drawLoop() {
    if (!audioCtx || audioElement.paused) return;
    analyser.getByteFrequencyData(dataArray);
    drawChladni({ m: 1, n: 1, threshold: 0.1, size: 2, color: "#e7dfd3" });
    requestAnimationFrame(drawLoop);
  }
});
