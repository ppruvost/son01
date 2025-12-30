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
 * BLOC 6 – AUDIO ON / OFF (STABLE)
 ********************/
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let isPlaying = false;

function toggleSound() {
  // Création AudioContext si nécessaire
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Reprise audio (obligatoire navigateur)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // STOP
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

  // PLAY
  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = parseFloat(freqSelect.value);

  gainNode.gain.value = 0.03; // volume doux soin humain

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  isPlaying = true;
  playBtn.textContent = "⏸ Stop";
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

function animate(t) {
  ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
  ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);

  const time = t * 0.001;

  // respiration visuelle
  const breath = 1 + 0.03 * Math.sin((2 * Math.PI / breathingCycle) * time);

  ctx.scale(breath, breath);

  drawChladni();

  requestAnimationFrame(animate);
}
