document.addEventListener('DOMContentLoaded', () => {
  const gameImage = document.getElementById('game-image');
  const answerInput = document.getElementById('answer-input');
  const submitBtn = document.getElementById('submit-answer');
  const hintBtn = document.getElementById('hint');
  const nextBtn = document.getElementById('next');
  const optionsDiv = document.getElementById('options');
  const livesDisplay = document.getElementById('lives');
  const timerDisplay = document.getElementById('timer');
  const levelDisplay = document.getElementById('level');
  const scoreDisplay = document.getElementById('score');
  const highscoreDisplay = document.getElementById('highscore');
  const totalPlayedDisplay = document.getElementById('totalPlayed');
  const accuracyDisplay = document.getElementById('accuracy');
  const popup = document.getElementById('popup');
  const popupText = document.getElementById('popup-text');
  const popupClose = document.getElementById('popup-close');

  let allLevels = [];
  let currentLevel = 0;
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let lives = 3;
  let correct = 0;
  let total = 0;
  let timer;

  function showPopup(message) {
    popupText.textContent = message;
    popup.classList.remove('hidden');
  }

  popupClose.addEventListener('click', () => {
    popup.classList.add('hidden');
  });

  function startTimer() {
    clearInterval(timer);
    let time = 15;
    timerDisplay.textContent = time;
    timer = setInterval(() => {
      time--;
      timerDisplay.textContent = time;
      if (time <= 0) {
        clearInterval(timer);
        loseLife("⏱️ Waktu habis!");
      }
    }, 1000);
  }

  function loseLife(message) {
    lives--;
    updateStatus();
    if (lives <= 0) {
      showPopup("💀 Game Over! Skor kamu: " + score);
    } else {
      showPopup(message);
      setTimeout(() => loadQuestion(), 1000);
    }
  }

  function updateStatus() {
    livesDisplay.textContent = lives;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = currentLevel + 1;
    highscoreDisplay.textContent = Math.max(score, Number(highscoreDisplay.textContent));
    totalPlayedDisplay.textContent = total;
    accuracyDisplay.textContent = total ? Math.round((correct / total) * 100) : 0;
  }

  function handleAnswer(answer, btn, q) {
    clearInterval(timer);
    total++;
    const isCorrect = answer.toLowerCase() === q.answer.toLowerCase();
    if (isCorrect) {
      score += 10;
      correct++;
      if (btn) btn.classList.add("correct");
      showPopup(`✅ Benar! Jawabannya: ${q.answer}\n\n📘 Fakta: ${q.fact}`);
    } else {
      if (btn) btn.classList.add("wrong");
      loseLife("❌ Salah! Jawabannya: " + q.answer);
      return;
    }
    currentIndex++;
    updateStatus();
    setTimeout(() => loadQuestion(), 1500);
  }

  function loadQuestion() {
    if (currentIndex >= questions.length) {
      showPopup("✔️ Level selesai! Skor akhir: " + score);
      return;
    }

    const q = questions[currentIndex];
    gameImage.src = q.image;
    answerInput.value = "";
    optionsDiv.innerHTML = "";

    const opts = shuffleArray([...q.hints.map(h => ""), q.answer, ...generateFakes(q.answer)]);
    const finalOptions = shuffleArray(q.options || opts.slice(0, 4));

    finalOptions.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(opt, btn, q);
      optionsDiv.appendChild(btn);
    });

    startTimer();
    updateStatus();
  }

  function generateFakes(correct) {
    const all = ["apel", "jeruk", "pisang", "semangka", "anggur", "ikan", "ular", "burung", "gajah", "harimau"];
    return shuffleArray(all.filter(item => item !== correct)).slice(0, 3);
  }

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  submitBtn.addEventListener('click', () => {
    const input = answerInput.value.trim();
    if (!input) return;
    const q = questions[currentIndex];
    handleAnswer(input, null, q);
  });

  hintBtn.addEventListener('click', () => {
    const q = questions[currentIndex];
    if (q && q.hints) {
      showPopup("💡 Hint:\n" + q.hints.join(" ➜ "));
    }
  });

  nextBtn.addEventListener('click', () => {
    currentIndex++;
    loadQuestion();
  });

  // START: Fetch soal.json
  fetch('soal.json')
    .then(res => res.json())
    .then(data => {
      allLevels = data;
      questions = [...allLevels[currentLevel]];
      loadQuestion();
    })
    .catch(err => {
      console.error("Gagal memuat soal.json", err);
      showPopup("❌ Gagal memuat soal. Pastikan file soal.json tersedia.");
    });
});