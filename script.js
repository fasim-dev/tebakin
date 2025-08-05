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
const shareBtn = document.getElementById("share-score-btn"); // ✅ Tambahan tombol share

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
const API_URL = "https://api.jsonbin.io/v3/b/68919fe3ae596e708fc1e0ba";
const API_KEY = "$2a$10$3GsWlEiH9nWulr/R44duCOQNbhSvZSBoGxEbMZTiuCUujMfUsbcgK";

// SPLASH SCREEN
window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.remove("show");
    splashScreen.style.display = "none";
    loadOnlineLeaderboard(); // leaderboard dimuat setelah splash
  }, 3000);
});

// AUDIO AUTOPLAY FIX
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
  .catch(err => {
    console.error("Gagal load soal:", err);
    showPopup("⚠️ Soal tidak ditemukan!");
  });

function showQuestion() {
  const question = questions[currentLevel][currentQuestionIndex];
  imageElement.src = question.image;
  imageElement.classList.add("blur");
  answerInput.value = "";
  clueText.textContent = "-";
  timer = 15;
  livesText.textContent = lives;
  levelText.textContent = currentLevel + 1;
  scoreText.textContent = score;
  coinsText.textContent = coins;
  timerText.textContent = timer;
  nextBtn.disabled = true;
  hintShown = false;
}

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

function checkAnswer() {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = questions[currentLevel][currentQuestionIndex].answer.toLowerCase();

  if (userAnswer === correctAnswer) {
    audioCorrect.play();
    imageElement.classList.remove("blur");
    score += 10;
    coins += 5;
    updateStats();
    showPopup("🎉 Benar! " + questions[currentLevel][currentQuestionIndex].fact);
    clearInterval(timerInterval);
    nextBtn.disabled = false;
  } else {
    audioWrong.play();
    showPopup("❌ Jawaban salah!");
    loseLife();
  }
}

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

function showHint() {
  if (hintShown) {
    showPopup("⚠️ Hint sudah ditampilkan!");
    return;
  }
  const hints = questions[currentLevel][currentQuestionIndex].hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];
  clueText.textContent = hint;
  score = Math.max(0, score - 2);
  updateStats();
  audioPopup.play();
  hintShown = true;
}

function showPopup(message) {
  popupText.textContent = message;
  popup.classList.remove("hidden");
  audioPopup.play();
}

function resetGame() {
  currentLevel = 0;
  currentQuestionIndex = 0;
  score = 0;
  lives = 3;
  coins = 0;
  showQuestion();
  startTimer();
}

function updateStats() {
  scoreText.textContent = score;
  livesText.textContent = lives;
  coinsText.textContent = coins;
}

// ✅ LOAD LEADERBOARD ONLINE
function loadOnlineLeaderboard() {
  fetch(`${API_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY }
  })
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
    .catch(err => {
      console.error("Leaderboard gagal dimuat:", err);
      onlineLeaderboard.innerHTML = "<p>Leaderboard tidak tersedia.</p>";
    });
}

// ✅ KIRIM SKOR KE JSONBIN.IO
function sendScoreToLeaderboard() {
  const playerName = prompt("Nama kamu:");
  if (!playerName) return;

  fetch(`${API_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY }
  })
    .then(res => res.json())
    .then(data => {
      const list = data.record || [];
      list.push({ name: playerName, score });
      list.sort((a, b) => b.score - a.score);
      if (list.length > 10) list.length = 10;

      return fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(list)
      });
    })
    .then(() => loadOnlineLeaderboard())
    .catch(err => console.error("Gagal simpan skor:", err));
}

// ✅ SHARE SKOR
shareBtn.addEventListener("click", async () => {
  audioClick.play();
  const text = `Aku main Tebakin 3D dan skorku ${score}! Yuk coba juga gamenya!`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Tebakin 3D',
        text,
        url
      });
    } catch (err) {
      console.error("Share dibatalkan:", err);
    }
  } else {
    navigator.clipboard.writeText(`${text} ${url}`)
      .then(() => showPopup("✅ Link skor disalin ke clipboard!"))
      .catch(() => showPopup("❌ Gagal menyalin skor."));
  }
});

// EVENTS
popupClose.addEventListener("click", () => {
  popup.classList.add("hidden");
});

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
