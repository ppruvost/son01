document.addEventListener("DOMContentLoaded", () => {
  const audioSelect = document.getElementById("audioSelect");
  const audioElement = document.getElementById("audioFile");
  const customPlayButton = document.getElementById("customPlayButton");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const audioFiles = ["song/396 Hz.mp3", "song/432 Hz.mp3"];
  let audioCtx = null;
  let isPlaying = false;

  /* =========================
     Remplir la liste déroulante
     ========================= */
  audioFiles.forEach((file) => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file.replace("song/", "");
    audioSelect.appendChild(option);
  });

  // Définir une source par défaut (IMPORTANT)
  audioElement.src = audioFiles[0];

  customPlayButton.disabled = false;

  /* =========================
     Bouton Lecture / Pause
     ========================= */
  customPlayButton.addEventListener("click", async () => {
    try {
      // Créer / réactiver AudioContext dans le clic utilisateur
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      if (isPlaying) {
        audioElement.pause();
        customPlayButton.textContent = "Lecture";
        isPlaying = false;
      } else {
        // Sécurité : s'assurer que la source est définie
        if (!audioElement.src) {
          audioElement.src = audioSelect.value;
        }

        await audioElement.play();
        customPlayButton.textContent = "Pause";
        isPlaying = true;
        drawLoop();
      }
    } catch (error) {
      console.error("Lecture bloquée :", error);
    }
  });

  /* =========================
     Changement de morceau
     ========================= */
  audioSelect.addEventListener("change", () => {
    audioElement.pause();
    audioElement.src = audioSelect.value;
    audioElement.load();

    if (isPlaying) {
      audioElement.play().catch(e => console.error("Erreur lecture :", e));
    }
  });

  /* =========================
     Visualisation Chladni (exemple)
     ========================= */
  function drawChladni() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e7dfd3";

    // Exemple simple (à remplacer par ton algorithme réel)
    ctx.fillRect(100, 100, 200, 200);
  }

  function drawLoop() {
    if (!isPlaying) return;
    drawChladni();
    requestAnimationFrame(drawLoop);
  }
});      } catch (error) {
        console.error("Erreur de lecture :", error);
        alert("La lecture a été bloquée. Veuillez interagir avec la page et réessayer.");
      }
    }
  });

  // Chargement d'un nouveau morceau
  audioSelect.addEventListener("change", () => {
    audioElement.src = audioSelect.value;
    if (isPlaying) {
      audioElement.play().catch(e => console.error("Erreur :", e));
    }
  });

  // Visualisation Chladni
  function drawChladni() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e7dfd3";
    // Exemple simplifié de dessin
    ctx.fillRect(100, 100, 200, 200);
  }

  function drawLoop() {
    if (!isPlaying) return;
    drawChladni();
    requestAnimationFrame(drawLoop);
  }
});
