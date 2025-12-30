/********************
 * BLOC 1 – CANVAS
 ********************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/********************
 * BLOC 2 – UI
 ********************/
const freqSelect = document.getElementById("freqSelect");
const mSlider = document.getElementById("mSlider");
const nSlider = document.getElementById("nSlider");
const mVal = document.getElementById("mVal");
const nVal = document.getElementById("nVal");
const playBtn = document.getElementById("playBtn");

/********************
 * BLOC 3 – AUDIO
 ********************/
let audioCtx = null;
let oscillator = null;
let startTime = null;
let animationId = null;

/********************
 * BLOC 4 – PARAMÈTRES
 ********************/
let m = parseInt(mSlider.value);
let n = parseInt(nSlider.value);

/********************
 * BLOC 5 – ÉCOUTEURS
 ********************/
mSlider.oninput = () => {
  m = parseInt(mSlider.value);
  mVal.textContent = m;
};

nSlider.oninput = () => {
  n = parseInt(nSlider.value);
  nVal.textContent = n;
};

/********************
 * BLOC 6 – AUDIO ON/OFF
 ********************/
function toggleSound() {
  if (!audioCtx) audioCtx = new AudioContext();

  if (oscillator) {
    oscillator.stop();
    oscillator = null;
    cancelAnimationFrame(animationId);
    playBtn.textContent = "▶ Son";
    return;
  }

  oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = parseFloat(freqSelect.value);

  const gain = audioCtx.createGain();
  gain.gain.value = 0.04;

  oscillator.connect(gain).connect(audioCtx.destination);
  oscillator.start();

  startTime = performance.now();
  playBtn.textContent = "⏸ Stop";
  animate();
}

playBtn.addEventListener("click", toggleSound);

/********************
 * BLOC 7 – FIGURE DE CHLADNI
 ********************/
function drawChladni(t) {
  const scale = 160;
  const step = 2;
  ctx.beginPath();

  for (let x = -scale; x <= scale; x += step) {
    for (let y = -scale; y <= scale; y += step) {
      const X = ((x + scale) / (2 * scale)) * Math.PI;
      const Y = ((y + scale) / (2 * scale)) * Math.PI;

      const value =
        Math.sin(n * X) * Math.sin(m * Y) -
        Math.sin(m * X) * Math.sin(n * Y);

      const threshold = 0.04 + 0.02 * Math.sin(t * 0.0004);

      if (Math.abs(value) < threshold) {
        ctx.lineTo(x, y);
      }
    }
  }
  ctx.stroke();
}

/********************
 * BLOC 8 – ANIMATION
 ********************/
function animate(time = performance.now()) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.strokeStyle = "#e7dfd3";
  ctx.globalAlpha = 0.85;

  const freq = parseFloat(freqSelect.value);
  const t = time - startTime;

  ctx.rotate(Math.sin(t * 0.0001 * freq) * 0.03);

  drawChladni(t);

  animationId = requestAnimationFrame(animate);
}
