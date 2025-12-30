/********************
 * Variables
 ********************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const audioSelect = document.getElementById("audioSelect");
const audioElement = document.getElementById("audioFile");
const loopCheckbox = document.getElementById("loopCheckbox");

let audioCtx, analyser, dataArray;

/********************
 * Liste des fichiers audio
 * Déposer vos fichiers à la racine du projet
 ********************/
const audioFiles = [
  "396 HZ Solfeggio Liberating Guilt and Fear C.mp3",
  "528 HZ Solfeggio Transformation.mp3"
];

// Remplissage du select
audioFiles.forEach(file => {
  const option = document.createElement("option");
  option.value = file;
  option.textContent = file;
  audioSelect.appendChild(option);
});

// Charger la musique sélectionnée
audioSelect.addEventListener("change", () => {
  audioElement.src = audioSelect.value;
  audioElement.play();
});

// Loop toggle
loopCheckbox.addEventListener("change", () => {
  audioElement.loop = loopCheckbox.checked;
});

/********************
 * Setup AudioContext
 ********************/
function setupAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

audioElement.addEventListener("play", () => {
  if (!audioCtx) setupAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
});

/********************
 * Draw Chladni adaptatif
 ********************/
function drawChladni(threshold = 0.03) {
  const scale = 150;
  const step = 2;
  const L = Math.PI;

  ctx.fillStyle = "#e7dfd3";

  const avgFreq = dataArray ? dataArray.reduce((a,b)=>a+b,0)/dataArray.length : 0;
  const m = 2 + Math.floor(avgFreq / 32);
  const n = 2 + Math.floor(avgFreq / 32);

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
 * Animation
 ********************/
function animate(t) {
  ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
  ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);

  let threshold = 0.02;
  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
    threshold = 0.02 + avg / 512;
  }

  const time = t*0.001;
  const breath = 1 + 0.03*Math.sin((2*Math.PI/12)*time);
  ctx.scale(breath, breath);

  drawChladni(threshold);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
