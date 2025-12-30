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
  gain.gain.value = 0.03;

  oscillator.connect(gain).connect(audioCtx.destination);
  oscillator.start();

  startTime = performance.now();
  playBtn.textContent = "⏸ Stop";
  animate();
}

playBtn.addEventListener("click", toggleSound);

/********************
 * BLOC 7 – FIGURE DE CHLADNI (VERSION PHYSIQUE)
 ********************/
function drawChladni() {
  const scale = 150;
  const step = 3;  // densité des échantillons
  const L = Math.PI;

  ctx.fillStyle = "#e7dfd3";

  for (let x = -scale; x <= scale; x += step) {
    for (let y = -scale; y <= scale; y += step) {
      // On normalise sur [-π..π]
      const nx = (x / scale) * L;
      const ny = (y / scale) * L;

      // formule correcte des lignes nodales
      const v =
        Math.cos(n * nx) * Math.cos(m * ny) -
        Math.cos(m * nx) * Math.cos(n * ny);

      // seuil très fin pour nœud
      if (Math.abs(v) < 0.008) {
        ctx.fillRect(x, y, 1.3, 1.3);
      }
    }
  }
}

/********************
 * BLOC 8 – ANIMATION
 ********************/
function animate(time = performance.now()) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = "#e7dfd3";
  ctx.globalAlpha = 0.9;

  const freq = parseFloat(freqSelect.value);
  const t = time - startTime;

  drawChladni();

  animationId = requestAnimationFrame(animate);
}
