let currentLevel = 0;
let currentQuestion = 0;
let score = 0;
let lives = 3;
let coins = 0;
let timer;
let timeLeft = 15;
let soundOn = true;
let soal = [];

// AUDIO
const audioClick = document.getElementById("audio-click");
const audioWrong = document.getElementById("audio-wrong");
const bgm = document.getElementById("bgm");

// ELEMENTS
const image = document.getElementById("game-image");
const input = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-answer");
const optionsDiv = document.getElementById("options");
const livesEl = document.getElementById("lives");
const timerEl = document.getElementById("timer");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");

function playSound(audio) {
  if (soundOn) {
    audio.currentTime = 0;
    audio.play();
  }
}

function showPopup(message) {
  popupText.textContent = message;
  popup.classList.remove("hidden");
  popup.classList.add("popup");
  playSound(audioClick);
}

popupClose.addEventListener("click", () => {
  popup.classList.add("hidden");
});

document.getElementById("toggle-sound").onclick = () => {
  soundOn = !soundOn;
  showPopup(`Suara ${soundOn ? "Aktif" : "Nonaktif"}`);
  if (soundOn) bgm.play(); else bgm.pause();
};

document.getElementById("hint").onclick = () => {
  const hints = soal[currentLevel][currentQuestion].hints;
  showPopup("Hint: " + hints.join(", "));
};

document.getElementById("next").onclick = () => {
  nextQuestion();
};

document.getElementById("toggle-theme").onclick = () => {
  document.body.classList.toggle("dark");
};

submitBtn.onclick = () => {
  const answer = input.value.trim().toLowerCase();
  const correct = soal[currentLevel][currentQuestion].answer.toLowerCase();

  if (answer === correct) {
    score += 10;
    coins += 2;
    showPopup("✅ Benar! 🎉\nFakta: " + soal[currentLevel][currentQuestion].fact);
    nextQuestion();
  } else {
    lives--;
    showPopup("❌ Salah! Jawaban benar: " + correct);
    playSound(audioWrong);
    if (lives <= 0) {
      showPopup("😢 Game Over!\nSkor Akhir: " + score);
      resetGame();
    }
  }

  updateStatus();
};

function updateStatus() {
  livesEl.textContent = lives;
  timerEl.textContent = timeLeft;
  scoreEl.textContent = score;
  coinsEl.textContent = coins;
  levelEl.textContent = currentLevel + 1;
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      showPopup("⏰ Waktu Habis!");
      lives--;
      updateStatus();
      if (lives <= 0) {
        showPopup("😢 Game Over!");
        resetGame();
      } else {
        nextQuestion();
      }
    }
  }, 1000);
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= soal[currentLevel].length) {
    currentLevel++;
    currentQuestion = 0;
    if (currentLevel >= soal.length) {
      showPopup("🎉 Semua level selesai!\nSkor Akhir: " + score);
      resetGame();
      return;
    }
  }
  loadQuestion();
}

function loadQuestion() {
  const q = soal[currentLevel][currentQuestion];
  image.src = q.image;
  input.value = "";
  input.focus();
  optionsDiv.innerHTML = "";
  startTimer();
  updateStatus();
}

function resetGame() {
  currentLevel = 0;
  currentQuestion = 0;
  score = 0;
  lives = 3;
  coins = 0;
  loadQuestion();
}

async function loadSoal() {
  try {
    const res = await fetch("soal.json");
    soal = await res.json();
    loadQuestion();
    if (soundOn) bgm.play();
  } catch (err) {
    showPopup("⚠️ Gagal memuat soal.json");
    console.error(err);
  }
}

window.onload = () => {
  loadSoal();
  updateStatus();
};
