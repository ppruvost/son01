document.addEventListener("DOMContentLoaded", () => {

  /********************
   * VARIABLES
   ********************/
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const audioSelect = document.getElementById("audioSelect");
  const audioElement = document.getElementById("audioFile");

  let audioCtx, analyser, dataArray;

  /********************
   * PLAYLIST
   ********************/
  const audioFiles = [
    "song/396 HZ.mp3",
    "song/485 HZ.mp3"
  ];

  audioSelect.innerHTML = "";

  audioFiles.forEach(file => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file.replace("song/", "");
    audioSelect.appendChild(option);
  });

  audioElement.src = audioFiles[0];

  audioSelect.addEventListener("change", () => {
    audioElement.src = audioSelect.value;
    audioElement.play();
  });

  /********************
   * AUDIO ANALYSIS
   ********************/
  function setupAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audioElement);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512; // ✅ valeur valide

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  audioElement.addEventListener("play", () => {
    if (!audioCtx) setupAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
  });

  /********************
   * CHLADNI
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

  /********************
   * ANIMATION
   ********************/
  function animate(t) {
    requestAnimationFrame(animate);

    ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);

    let energy = 0, bass = 0, treble = 0;

    if (analyser) {
      analyser.getByteFrequencyData(dataArray);

      const len = dataArray.length;
      bass = dataArray.slice(0, len * 0.25).reduce((a,b)=>a+b,0)/(len*0.25);
      treble = dataArray.slice(len * 0.6).reduce((a,b)=>a+b,0)/(len*0.4);
      energy = dataArray.reduce((a,b)=>a+b,0)/len;
    }

    // 🎵 paramètres visuels
    const m = 2 + Math.floor(bass / 40);
    const n = 3 + Math.floor(treble / 40);

    const threshold = 0.03 + energy / 600;
    const size = 1.2 + energy / 300;

    const hue = 35 + energy * 0.5;
    const color = `hsl(${hue}, 45%, 75%)`;

    const time = t * 0.001;
    ctx.rotate(0.04 * Math.sin(time * 0.2));
    ctx.scale(
      1 + 0.05 * Math.sin(time * 0.3),
      1 + 0.05 * Math.sin(time * 0.3)
    );

    drawChladni({ m, n, threshold, size, color });
  }

  requestAnimationFrame(animate);
});
