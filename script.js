// ELEMENT DOM
const imageElement = document.getElementById("game-image");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-answer");
const hintBtn = document.getElementById("hint");
const nextBtn = document.getElementById("next");
const clueText = document.getElementById("clue");
const levelText = document.getElementById("level");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const timerText = document.getElementById("timer");
const coinsText = document.getElementById("coins");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");
const splashScreen = document.getElementById("splash-screen");
const onlineLeaderboard = document.getElementById("online-leaderboard");
const shareBtn = document.getElementById("share-score-btn");
const challengeBtn = document.getElementById("challenge-mode-btn");
const rewardBtn = document.getElementById("daily-reward-btn");

// AUDIO
const audioClick = document.getElementById("audio-click");
const audioWrong = document.getElementById("audio-wrong");
const audioCorrect = document.getElementById("audio-correct");
const audioPopup = document.getElementById("audio-popup");
const audioTimer = document.getElementById("audio-timer");
const audioLevelup = document.getElementById("audio-levelup");
const bgm = document.getElementById("bgm");

// VARIABEL
let questions = [];
let currentLevel = 0;
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let timer = 15;
let coins = 0;
let timerInterval;
let hintShown = false;
let answeredCorrectly = false;

const API_URL = "https://api.jsonbin.io/v3/b/68919fe3ae596e708fc1e0ba";
const API_KEY = "$2a$10$3GsWlEiH9nWulr/R44duCOQNbhSvZSBoGxEbMZTiuCUujMfUsbcgK";

// SPLASH
window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.remove("show");
    splashScreen.style.display = "none";
    loadOnlineLeaderboard();
  }, 3000);
});

// AUDIO FIX
document.addEventListener("click", () => {
  if (bgm.paused) {
    bgm.volume = 0.4;
    bgm.play().catch(err => console.warn("BGM autoplay blocked:", err));
  }
}, { once: true });

// LOAD SOAL
fetch("soal.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
    startTimer();
  })
  .catch(() => showPopup("⚠️ Gagal memuat soal!"));

// TAMPILKAN SOAL
function showQuestion() {
  const q = questions[currentLevel][currentQuestionIndex];
  imageElement.src = q.image;
  imageElement.classList.add("blur");
  answerInput.value = "";
  clueText.textContent = "-";
  timer = 15;
  hintShown = false;
  answeredCorrectly = false;

  livesText.textContent = lives;
  levelText.textContent = currentLevel + 1;
  scoreText.textContent = score;
  coinsText.textContent = coins;
  timerText.textContent = timer;

  nextBtn.disabled = true;
}

// TIMER
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    timerText.textContent = timer;
    if (timer === 3) audioTimer.play();
    if (timer <= 0) {
      clearInterval(timerInterval);
      loseLife();
    }
  }, 1000);
}

// CEK JAWABAN
function checkAnswer() {
  if (answeredCorrectly) return showPopup("✅ Sudah dijawab benar!");

  const jawaban = answerInput.value.trim().toLowerCase();
  const kunci = questions[currentLevel][currentQuestionIndex].answer.toLowerCase();

  if (jawaban === kunci) {
    audioCorrect.play();
    imageElement.classList.remove("blur");
    score += 10;
    coins += 5;
    updateStats();
    showPopup("🎉 Benar! " + questions[currentLevel][currentQuestionIndex].fact);
    answeredCorrectly = true;
    nextBtn.disabled = false;
    clearInterval(timerInterval);
  } else {
    audioWrong.play();
    showPopup("❌ Salah!");
    loseLife();
  }
}

// HINT
function showHint() {
  if (hintShown) return showPopup("ℹ️ Hint sudah ditampilkan!");
  const hints = questions[currentLevel][currentQuestionIndex].hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];
  clueText.textContent = hint;
  hintShown = true;
  score = Math.max(0, score - 2);
  updateStats();
  audioPopup.play();
}

// NYAWA BERKURANG
function loseLife() {
  lives--;
  updateStats();
  if (lives <= 0) {
    showPopup("💀 Game Over! Skor kamu: " + score);
    sendScoreToLeaderboard();
    resetGame();
  } else {
    nextBtn.disabled = false;
  }
}

// LANJUT
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions[currentLevel].length) {
    currentLevel++;
    currentQuestionIndex = 0;
    if (currentLevel >= questions.length) {
      showPopup("🏁 Semua level selesai! Skor akhir: " + score);
      sendScoreToLeaderboard();
      return;
    }
    audioLevelup.play();
    showPopup("🔥 Level Naik ke " + (currentLevel + 1));
  }
  showQuestion();
  startTimer();
}

// RESET GAME
function resetGame() {
  currentLevel = 0;
  currentQuestionIndex = 0;
  score = 0;
  lives = 3;
  coins = 0;
  showQuestion();
  startTimer();
}

// UPDATE UI
function updateStats() {
  scoreText.textContent = score;
  livesText.textContent = lives;
  coinsText.textContent = coins;
}

// POPUP
function showPopup(msg) {
  popupText.textContent = msg;
  popup.classList.remove("hidden");
  audioPopup.play();
}

// SHARE
shareBtn.addEventListener("click", async () => {
  audioClick.play();
  const text = `Aku main Tebakin 3D dan skorku ${score}! Yuk coba juga gamenya!`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: "Tebakin 3D", text, url });
    } catch (err) {
      console.warn("Share dibatalkan:", err);
    }
  } else {
    navigator.clipboard.writeText(`${text} ${url}`)
      .then(() => showPopup("📋 Link skor disalin ke clipboard!"))
      .catch(() => showPopup("❌ Gagal menyalin!"));
  }
});

// DUMMY CHALLENGE MODE
challengeBtn.addEventListener("click", () => {
  audioClick.play();
  showPopup("⏳ Mode tantangan akan datang!");
});

// DUMMY DAILY REWARD
rewardBtn.addEventListener("click", () => {
  audioClick.play();
  coins += 10;
  showPopup("🎁 Kamu dapat 10 koin harian!");
  updateStats();
});

// LEADERBOARD ONLINE
function loadOnlineLeaderboard() {
  fetch(`${API_URL}/latest`, { headers: { 'X-Master-Key': API_KEY } })
    .then(res => res.json())
    .then(data => {
      const list = data.record || [];
      let html = "<ul>";
      list.slice(0, 10).forEach((user, i) => {
        html += `<li>#${i + 1} <b>${user.name}</b> - ${user.score}</li>`;
      });
      html += "</ul>";
      onlineLeaderboard.innerHTML = html;
    })
    .catch(() => {
      onlineLeaderboard.innerHTML = "<p>❌ Gagal memuat leaderboard</p>";
    });
}

// KIRIM SKOR
function sendScoreToLeaderboard() {
  const name = prompt("Nama kamu:");
  if (!name) return;

  fetch(`${API_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY }
  })
    .then(res => res.json())
    .then(data => {
      const list = data.record || [];
      list.push({ name, score });
      list.sort((a, b) => b.score - a.score);
      if (list.length > 10) list.length = 10;

      return fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        body: JSON.stringify(list)
      });
    })
    .then(() => loadOnlineLeaderboard())
    .catch(err => console.error("❌ Gagal simpan skor:", err));
}

// EVENTS
submitBtn.addEventListener("click", () => {
  audioClick.play();
  checkAnswer();
});
nextBtn.addEventListener("click", () => {
  audioClick.play();
  nextQuestion();
});
hintBtn.addEventListener("click", () => {
  audioClick.play();
  showHint();
});
popupClose.addEventListener("click", () => {
  popup.classList.add("hidden");
});
