/********************
 * VARIABLES
 ********************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const audioSelect = document.getElementById("audioSelect");
const audioElement = document.getElementById("audioFile");

let audioCtx, analyser, dataArray;

/********************
 * PLAYLIST (à adapter)
 ********************/
const audioFiles = [
  "song/396 HZ.mp3",
  "song/485 HZ.mp3"
  
];

audioFiles.forEach(file => {
  const option = document.createElement("option");
  option.value = file;
  option.textContent = file.replace("song/", "");
  audioSelect.appendChild(option);
});

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
 * CHLADNI DYNAMIQUE
 ********************/
function drawChladni(params) {
  const {
    m,
    n,
    threshold,
    pointSize,
    color
  } = params;

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
        ctx.fillRect(x, y, pointSize, pointSize);
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

  let energy = 0;
  let bass = 0;
  let treble = 0;

  if (analyser) {
    analyser.getByteFrequencyData(dataArray);

    const len = dataArray.length;
    bass = dataArray.slice(0, len * 0.2).reduce((a, b) => a + b, 0) / (len * 0.2);
    treble = dataArray.slice(len * 0.6).reduce((a, b) => a + b, 0) / (len * 0.4);
    energy = dataArray.reduce((a, b) => a + b, 0) / len;
  }

  /* Paramètres visuels dérivés du son */
  const m = 2 + Math.f
