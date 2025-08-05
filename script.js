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

// START MUSIC on first interaction (fix autoplay)
document.addEventListener('click', () => {
  if (bgm.paused) {
    bgm.volume = 0.3;
    bgm.play().catch(err => console.warn("Autoplay blocked", err));
  }
}, { once: true });

// SPLASH SCREEN
window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.remove("show");
    splashScreen.style.display = "none";
  }, 3000);
});

// LOAD SOAL
fetch("soal.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
    startTimer();
  })
  .catch(err => {
    showPopup("Gagal memuat soal!");
    console.error(err);
  });

function showQuestion() {
  const question = questions[currentLevel][currentQuestionIndex];
  imageElement.src = question.image;
  clueText.textContent = "-";
  answerInput.value = "";
  imageElement.classList.add("blur");
  timer = 15;
  timerText.textContent = timer;
  livesText.textContent = lives;
  levelText.textContent = currentLevel + 1;
  scoreText.textContent = score;
  coinsText.textContent = coins;
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
  const correct = questions[currentLevel][currentQuestionIndex].answer.toLowerCase();

  if (userAnswer === correct) {
    imageElement.classList.remove("blur");
    audioCorrect.play();
    score += 10;
    coins += 5;
    scoreText.textContent = score;
    coinsText.textContent = coins;
    showPopup("🎉 Benar! " + questions[currentLevel][currentQuestionIndex].fact);
    nextBtn.disabled = false;
    clearInterval(timerInterval);
  } else {
    audioWrong.play();
    showPopup("❌ Jawaban salah!");
    loseLife();
  }
}

function loseLife() {
  lives--;
  livesText.textContent = lives;
  if (lives <= 0) {
    showPopup("💀 Game Over! Skor kamu: " + score);
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
    audioLevelup.play();
    showPopup("🔥 Level Naik!");
    if (currentLevel >= questions.length) {
      showPopup("🏁 Kamu sudah menyelesaikan semua level!");
      return;
    }
  }
  showQuestion();
  startTimer();
  nextBtn.disabled = true;
}

function showHint() {
  const hints = questions[currentLevel][currentQuestionIndex].hints;
  const hintIndex = Math.floor(Math.random() * hints.length);
  clueText.textContent = hints[hintIndex];
  score = Math.max(0, score - 2);
  scoreText.textContent = score;
  audioPopup.play();
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
