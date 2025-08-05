let questions = [];
let currentLevel = 0;
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let timer = 15;
let timerInterval;
let coins = 0;
let currentHintIndex = 0;

const imageElement = document.getElementById("game-image");
const input = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-answer");
const hintBtn = document.getElementById("hint");
const nextBtn = document.getElementById("next");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");

const audioClick = document.getElementById("audio-click");
const audioWrong = document.getElementById("audio-wrong");
const audioCorrect = document.getElementById("audio-correct");
const audioPopup = document.getElementById("audio-popup");
const audioTimer = document.getElementById("audio-timer");
const audioLevelup = document.getElementById("audio-levelup");
const bgm = document.getElementById("bgm");

const clueText = document.getElementById("clue");
const optionsContainer = document.getElementById("options");

const updateStats = () => {
  document.getElementById("lives").textContent = lives;
  document.getElementById("timer").textContent = timer;
  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = currentLevel + 1;
  document.getElementById("coins").textContent = coins;
};

function showPopup(msg) {
  popupText.textContent = msg;
  popup.classList.remove("hidden");
  audioPopup.play();
}

popupClose.addEventListener("click", () => {
  popup.classList.add("hidden");
});

function startTimer() {
  clearInterval(timerInterval);
  timer = 15;
  updateStats();
  timerInterval = setInterval(() => {
    timer--;
    updateStats();
    audioTimer.play();
    if (timer <= 0) {
      clearInterval(timerInterval);
      lives--;
      updateStats();
      audioWrong.play();
      showPopup("Waktu habis! Kamu kehilangan 1 nyawa.");
      if (lives === 0) {
        showPopup("Game Over! Skor akhir: " + score);
      }
    }
  }, 1000);
}

function showQuestion() {
  const question = questions[currentLevel][currentQuestionIndex];
  imageElement.src = question.image;
  clueText.textContent = "💡 " + question.hints[0];
  currentHintIndex = 0;
  input.value = "";
  input.focus();
  imageElement.classList.add("blur");
  startTimer();
  updateStats();
}

submitBtn.addEventListener("click", () => {
  const answer = input.value.trim().toLowerCase();
  const correctAnswer = questions[currentLevel][currentQuestionIndex].answer.toLowerCase();
  if (answer === correctAnswer) {
    clearInterval(timerInterval);
    score += 10;
    coins += 2;
    audioCorrect.play();
    imageElement.classList.remove("blur");
    showPopup("Benar! 🎉\n" + questions[currentLevel][currentQuestionIndex].fact);
  } else {
    lives--;
    updateStats();
    audioWrong.play();
    showPopup("Salah. Coba lagi!");
  }
});

hintBtn.addEventListener("click", () => {
  audioClick.play();
  coins = Math.max(0, coins - 1);
  currentHintIndex++;
  const hints = questions[currentLevel][currentQuestionIndex].hints;
  if (currentHintIndex < hints.length) {
    clueText.textContent = " " + hints[currentHintIndex];
  } else {
    clueText.textContent = "Semua hint sudah ditampilkan.";
  }
  updateStats();
});

nextBtn.addEventListener("click", () => {
  audioClick.play();
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions[currentLevel].length) {
    currentLevel++;
    currentQuestionIndex = 0;
    if (currentLevel >= questions.length) {
      showPopup("Selamat! Kamu telah menyelesaikan semua level.");
      return;
    }
    audioLevelup.play();
    showPopup("Level Up! 🎉");
  }
  showQuestion();
});

// Toggle Sound
document.getElementById("toggle-sound").addEventListener("click", () => {
  const toggle = !bgm.muted;
  bgm.muted = toggle;
  audioClick.muted = toggle;
  audioWrong.muted = toggle;
  audioCorrect.muted = toggle;
  audioPopup.muted = toggle;
  audioTimer.muted = toggle;
  audioLevelup.muted = toggle;
});

// Splash screen logic with fail-safe//
window.addEventListener("load", () => {
  fetch("soal.json")
    .then((res) => res.json())
    .then((data) => {
      questions = data;
      showQuestion();
      bgm.play();
    })
    .catch(() => {
      showPopup("Gagal memuat soal");
    })
    .finally(() => {
      // Selalu sembunyikan splash screen setelah 3 detik//
      setTimeout(() => {
        document.getElementById("splash-screen")?.classList.add("hide");
      }, 3000);
    });
});
