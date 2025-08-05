// script.js FINAL UNTUK TEBKIN SINGLE-FOLDER

// ELEMENT const gameImage = document.getElementById('game-image'); const answerInput = document.getElementById('answer-input'); const submitAnswer = document.getElementById('submit-answer'); const optionsContainer = document.getElementById('options'); const livesDisplay = document.getElementById('lives'); const timerDisplay = document.getElementById('timer'); const levelDisplay = document.getElementById('level'); const scoreDisplay = document.getElementById('score'); const coinsDisplay = document.getElementById('coins'); const popup = document.getElementById('popup'); const popupText = document.getElementById('popup-text'); const popupClose = document.getElementById('popup-close');

// AUDIO const audioClick = document.getElementById('audio-click'); const audioWrong = document.getElementById('audio-wrong'); const audioCorrect = document.getElementById('audio-correct'); const audioTimer = document.getElementById('audio-timer'); const audioLevelup = document.getElementById('audio-levelup'); const audioPopup = document.getElementById('audio-popup'); const bgm = document.getElementById('bgm');

let soundEnabled = true; let currentLevel = 0; let currentQuestion = 0; let lives = 3; let timer; let timeLeft = 15; let score = 0; let coins = 0; let totalPlayed = 0; let correctAnswers = 0; let wrongAnswers = 0;

let soal = []; fetch('soal.json') .then(res => res.json()) .then(data => { soal = data; loadQuestion(); });

function loadQuestion() { const data = soal[currentLevel][currentQuestion]; gameImage.src = data.image; gameImage.classList.add('blur'); answerInput.value = ''; optionsContainer.innerHTML = ''; timeLeft = 15; startTimer(); updateStatus(); if (soundEnabled) audioLevelup.play(); }

function startTimer() { clearInterval(timer); timer = setInterval(() => { timeLeft--; timerDisplay.textContent = timeLeft; if (timeLeft === 5 && soundEnabled) audioTimer.play(); if (timeLeft <= 0) { clearInterval(timer); lives--; wrongAnswers++; if (soundEnabled) audioWrong.play(); showPopup('⏰ Waktu habis!'); if (lives <= 0) { showPopup('💀 Game Over!'); resetGame(); } else { nextQuestion(); } } }, 1000); }

function showPopup(message) { popupText.textContent = message; popup.classList.remove('hidden'); if (soundEnabled) audioPopup.play(); }

popupClose.addEventListener('click', () => { popup.classList.add('hidden'); });

submitAnswer.addEventListener('click', () => { const jawaban = answerInput.value.trim().toLowerCase(); const benar = soal[currentLevel][currentQuestion].answer; if (jawaban === benar) { score += 10; coins += 5; correctAnswers++; gameImage.classList.remove('blur'); if (soundEnabled) audioCorrect.play(); showPopup('✅ Benar!'); } else { lives--; wrongAnswers++; if (soundEnabled) audioWrong.play(); showPopup('❌ Salah!'); if (lives <= 0) { showPopup('💀 Game Over!'); resetGame(); return; } } clearInterval(timer); totalPlayed++; updateStatus(); });

document.getElementById('next').addEventListener('click', () => { nextQuestion(); });

document.getElementById('hint').addEventListener('click', () => { const hints = soal[currentLevel][currentQuestion].hints; const randomHint = hints[Math.floor(Math.random() * hints.length)]; showPopup('💡 Hint: ' + randomHint); });

document.getElementById('toggle-sound').addEventListener('click', () => { soundEnabled = !soundEnabled; if (soundEnabled) { bgm.play(); document.getElementById('toggle-sound').textContent = '🔊'; } else { bgm.pause(); document.getElementById('toggle-sound').textContent = '🔇'; } });

function nextQuestion() { currentQuestion++; if (currentQuestion >= soal[currentLevel].length) { currentQuestion = 0; currentLevel++; showPopup('🏆 Level Naik!'); } if (currentLevel >= soal.length) { showPopup('🎉 Selamat! Kamu telah menyelesaikan semua level.'); resetGame(); return; } loadQuestion(); }

function updateStatus() { livesDisplay.textContent = lives; timerDisplay.textContent = timeLeft; levelDisplay.textContent = currentLevel + 1; scoreDisplay.textContent = score; coinsDisplay.textContent = coins;

document.getElementById('highscore').textContent = score; document.getElementById('totalPlayed').textContent = totalPlayed; const accuracy = totalPlayed > 0 ? ((correctAnswers / totalPlayed) * 100).toFixed(0) : 0; document.getElementById('accuracy').textContent = accuracy; document.getElementById('stat-played').textContent = totalPlayed; document.getElementById('stat-correct').textContent = correctAnswers; document.getElementById('stat-wrong').textContent = wrongAnswers; document.getElementById('stat-accuracy').textContent = accuracy; }

function resetGame() { currentLevel = 0; currentQuestion = 0; lives = 3; score = 0; coins = 0; totalPlayed = 0; correctAnswers = 0; wrongAnswers = 0; loadQuestion(); }

// Auto play bgm on load if sound enabled window.addEventListener('load', () => { if (soundEnabled) { bgm.play().catch(() => { // autoplay might be blocked on some browsers console.warn('Autoplay audio diblokir browser. Menunggu interaksi pengguna.'); }); } });

