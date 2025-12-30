/********************
 * BLOC 0 – VARIABLES GLOBALES
 ********************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const freqSelect = document.getElementById("freqSelect");
const mSlider = document.getElementById("mSlider");
const nSlider = document.getElementById("nSlider");
const mVal = document.getElementById("mVal");
const nVal = document.getElementById("nVal");
const playBtn = document.getElementById("playBtn");

const audioElement = document.getElementById("audioFile");

let audioCtx = null;
let oscillator = null;
let gainNode = null;
let isPlaying = false;

let m = parseInt(mSlider.value);
let n = parseInt(nSlider.value);

/********************
 * BLOC 1 – SLIDERS
 ********************/
mSlider.addEventListener("input", () => {
  m = parseInt(mSlider.value);
  mVal.textContent = m;
});

nSlider.addEventListener("input", () => {
  n = parseInt(nSlider.value);
  nVal.textContent = n;
});

/********************
 * BLOC 2 – AUDIO ON/OFF OSCILLATEUR
 ********************/
function toggleSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();

  if (isPlaying) {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    oscillator = null;
    gainNode = null;
    isPlaying = false;
    playBtn.textContent = "▶ Son";
    return;
  }

  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = parseFloat(freqSelect.value);
  gainNode.gain.value = 0.03;

  oscillator.connect(gainNode).connect(audioCtx.destination);
  oscillator.start();

  isPlaying = true;
  playBtn.textContent = "⏸ Stop";
}

playBtn.addEventListener("click", toggleSound);

/********************
 * BLOC 3 – AUDIO LOCAL INTERACTIF
 ********************/
let analyser, dataArray;

function setupAudioAnalysis() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

audioElement.addEventListener("play", () => {
  if (!analyser) setupAudioAnalysis();
  if (audioCtx.state === "suspended") audioCtx.resume();
});

/********************
 * BLOC 4 – FIGURE DE CHLADNI
 ********************/
function drawChladni(threshold = 0.03) {
  const scale = 150;
  const step = 2;
  const L = Math.PI;

  ctx.fillStyle = "#e7dfd3";

  for (let x = -scale; x <= scale; x += step) {
    for (let y = -scale; y <= scale; y += step) {
      const nx = (x / scale) * L;
      const ny = (y / scale) * L;

      const v = Math.cos(n * nx) * Math.cos(m * ny) -
                Math.cos(m * nx) * Math.cos(n * ny);

      if (Math.abs(v) < threshold) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  }
}

/********************
 * BLOC 5 – ANIMATION LENTE
 ********************/
function animate(t) {
  ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
  ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);

  let threshold = 0.03;

  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a,b) => a+b,0) / dataArray.length;
    threshold = 0.02 + avg / 512; // seuil dynamique selon amplitude
  }

  const time = t * 0.001;
  const breath = 1 + 0.03 * Math.sin((2 * Math.PI / 12) * time);
  ctx.scale(breath, breath);

  drawChladni(threshold);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
