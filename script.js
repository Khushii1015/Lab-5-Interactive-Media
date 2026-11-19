const audio = document.getElementById("soundscape");
const playBtn = document.getElementById("playBtn");
const seek = document.getElementById("seek");
const time = document.getElementById("time");
const volume = document.getElementById("volume");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
const images = document.querySelectorAll(".gallery img");
const clip = document.getElementById("clip");

let analyser;
let data;

function setupAudio() { // Connects the audio to an analyser so the page can read the sound's frequencies
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  data = new Uint8Array(analyser.frequencyBinCount);
}

function togglePlay() { // Plays or pauses the soundscape and updates the button text
  if (!analyser) setupAudio();
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "Pause";
  } else {
    audio.pause();
    playBtn.textContent = "Play";
  }
}

function formatTime(seconds) { // Turns a number of seconds into m:ss format
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return m + ":" + s;
}

function updateProgress() { // Moves the seek bar, updates the time and highlights the image for the current scene
  seek.value = (audio.currentTime / audio.duration) * 100 || 0;
  time.textContent = formatTime(audio.currentTime);
  let current = images[0];
  for (const img of images) {
    if (audio.currentTime >= img.dataset.time) current = img;
  }
  for (const img of images) {
    img.classList.toggle("active", img === current);
  }
}

function seekAudio() { // Jumps the audio to the point chosen on the seek bar
  audio.currentTime = (seek.value / 100) * audio.duration;
}

function changeVolume() { // Sets the audio volume from the volume slider
  audio.volume = volume.value;
}

function jumpToScene(event) { // Jumps the audio to the scene of the clicked image and starts playing
  audio.currentTime = event.currentTarget.dataset.time;
  if (audio.paused) togglePlay();
}

function resetPlayer() { // Sets the button back to Play when the soundscape ends
  playBtn.textContent = "Play";
}

function playClip() { // Plays the video when the mouse moves over it
  clip.play();
}

function pauseClip() { // Pauses the video when the mouse leaves it
  clip.pause();
}

function draw() { // Runs every frame to draw sound bars, pulse the active image and brighten the video with the volume
  requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!analyser) return;
  analyser.getByteFrequencyData(data);
  const barWidth = canvas.width / data.length;
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i] / 255) * canvas.height;
    ctx.fillStyle = "hsl(" + i * 4 + ", 70%, 50%)";
    ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
    total += data[i];
  }
  const level = total / data.length / 255;
  document.documentElement.style.setProperty("--pulse", 1 + level * 0.15);
  clip.style.filter = "brightness(" + (0.6 + level) + ")";
}

playBtn.addEventListener("click", togglePlay);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", resetPlayer);
seek.addEventListener("input", seekAudio);
volume.addEventListener("input", changeVolume);
for (const img of images) img.addEventListener("click", jumpToScene);
clip.addEventListener("mouseenter", playClip);
clip.addEventListener("mouseleave", pauseClip);
draw();
