const vocabulary = [
  { en: "Assessment",    de: "Bewertung / Einschätzung" },
  { en: "Delay",         de: "Verzögerung" },
  { en: "Meanwhile",     de: "In der Zwischenzeit" },
  { en: "Schedule",      de: "Zeitplan" },
  { en: "Attending",     de: "Teilnahme / anwesend sein" },
  { en: "Equipment",     de: "Ausrüstung" },
  { en: "Execution",     de: "Ausführung" },
  { en: "Confirmation",  de: "Bestätigung" },
  { en: "Immediately",   de: "Sofort" },
  { en: "Commencement",  de: "Beginn" },
  { en: "Aware",         de: "bewusst / informiert" },
  { en: "Referring",     de: "sich beziehen auf" },
  { en: "Initial",       de: "anfänglich / initial" },
  { en: "Proposed",      de: "vorgeschlagen" },
  { en: "Offer",         de: "Angebot" },
  { en: "Requesting",    de: "anfordern / beantragen" },
  { en: "Inquiry",       de: "Anfrage" },
  { en: "Concerned",     de: "betroffen / besorgt" },
  { en: "Successful",    de: "erfolgreich" },
  { en: "Deducted",      de: "abgezogen" },
  { en: "Claimed",       de: "beansprucht / geltend gemacht" },
  { en: "Purchase",      de: "Kauf" },
  { en: "Issue",         de: "Problem / Ausgabe / Thema" },
  { en: "Supervision",   de: "Aufsicht" },
  { en: "Participate",   de: "teilnehmen" },
  { en: "Doubts",        de: "Zweifel" },
  { en: "Sudden",        de: "plötzlich" },
];

// --- State ---
let mode = 'de-en'; // 'de-en' | 'en-de' | 'quiz'
let deck = [];
let currentIndex = 0;
let correctCount = 0;
let wrongItems = [];
let answered = false;

// --- Helpers ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(str) {
  return str.toLowerCase().trim();
}

function isCorrect(userAnswer, correctAnswer) {
  const user = normalize(userAnswer);
  return correctAnswer.split('/').map(s => normalize(s)).some(alt => alt === user);
}

function getCurrentCorrectAnswer() {
  const item = deck[currentIndex];
  if (mode === 'de-en') return item.en;
  if (mode === 'en-de') return item.de;
  return item.de; // quiz: EN shown, DE is answer
}

// --- Mode ---
function setMode(newMode) {
  mode = newMode;
  document.getElementById('btn-de-en').classList.toggle('active', mode === 'de-en');
  document.getElementById('btn-en-de').classList.toggle('active', mode === 'en-de');
  document.getElementById('btn-quiz').classList.toggle('active', mode === 'quiz');
  restart();
}

// --- Lifecycle ---
function restart() {
  // Deduplicate by EN word before building deck
  const seen = new Set();
  const unique = vocabulary.filter(v => {
    if (seen.has(v.en)) return false;
    seen.add(v.en);
    return true;
  });
  deck = shuffle(unique);
  currentIndex = 0;
  correctCount = 0;
  wrongItems = [];
  answered = false;

  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('card').classList.remove('hidden');
  showCard();
}

function showCard() {
  answered = false;
  const item = deck[currentIndex];
  const isQuiz = mode === 'quiz';

  let questionText, label;
  if (mode === 'de-en') {
    questionText = item.de;
    label = 'Deutsch → Englisch';
  } else if (mode === 'en-de') {
    questionText = item.en;
    label = 'Englisch → Deutsch';
  } else {
    questionText = item.en;
    label = 'Welche Übersetzung ist richtig?';
  }

  document.getElementById('question-label').textContent = label;
  document.getElementById('question').textContent = questionText;

  // Show correct section
  document.getElementById('type-section').classList.toggle('hidden', isQuiz);
  document.getElementById('quiz-section').classList.toggle('hidden', !isQuiz);

  if (isQuiz) {
    renderQuizOptions(item);
  } else {
    const input = document.getElementById('answer-input');
    input.value = '';
    input.className = 'answer-input';
    input.disabled = false;
    document.getElementById('check-btn').disabled = false;
    input.focus();
  }

  // Reset shared elements
  document.getElementById('feedback').className = 'feedback hidden';
  document.getElementById('correct-answer').classList.add('hidden');
  document.getElementById('retry-section').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');

  const retryInput = document.getElementById('retry-input');
  retryInput.value = '';
  retryInput.className = 'answer-input';

  updateProgress();
}

function updateProgress() {
  const total = deck.length;
  const pct = total === 0 ? 0 : (currentIndex / total) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${currentIndex} / ${total}`;
}

// --- Type mode ---
function checkAnswer() {
  if (answered) return;
  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();
  if (!userAnswer) return;

  answered = true;
  input.disabled = true;
  document.getElementById('check-btn').disabled = true;

  const correctAnswer = getCurrentCorrectAnswer();
  const correct = isCorrect(userAnswer, correctAnswer);

  const feedback = document.getElementById('feedback');
  input.classList.remove('correct', 'wrong');

  if (correct) {
    correctCount++;
    input.classList.add('correct');
    feedback.textContent = 'Richtig! ✓';
    feedback.className = 'feedback correct';
    document.getElementById('next-btn').classList.remove('hidden');
  } else {
    wrongItems.push(deck[currentIndex]);
    input.classList.add('wrong');
    feedback.textContent = 'Falsch ✗';
    feedback.className = 'feedback wrong';

    const correctAnswerEl = document.getElementById('correct-answer');
    correctAnswerEl.innerHTML = `Richtige Antwort: <span>${correctAnswer}</span>`;
    correctAnswerEl.classList.remove('hidden');

    // Show retry section — "Weiter" only unlocks after correct retry
    document.getElementById('retry-section').classList.remove('hidden');
    document.getElementById('retry-input').focus();
  }
}

// Retry input: unlock "Weiter" when correctly typed
document.getElementById('retry-input').addEventListener('input', () => {
  const retryInput = document.getElementById('retry-input');
  const correctAnswer = getCurrentCorrectAnswer();
  if (isCorrect(retryInput.value, correctAnswer)) {
    retryInput.classList.add('correct');
    retryInput.classList.remove('wrong');
    document.getElementById('next-btn').classList.remove('hidden');
  } else {
    retryInput.classList.remove('correct');
  }
});

document.getElementById('retry-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && isCorrect(e.target.value, getCurrentCorrectAnswer())) {
    nextCard();
  }
});

// Enter on main input
document.getElementById('answer-input').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (!answered) {
    checkAnswer();
  } else if (!document.getElementById('next-btn').classList.contains('hidden')) {
    nextCard();
  }
});

// --- Quiz mode ---
function renderQuizOptions(item) {
  const correctAnswer = item.de;
  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = '';

  // 3 unique wrong answers (no duplicate DE values)
  const seen = new Set([correctAnswer]);
  const wrongPool = shuffle(vocabulary.filter(v => v !== item && !seen.has(v.de) && !seen.add(v.de)));
  const options = shuffle([correctAnswer, ...wrongPool.slice(0, 3).map(v => v.de)]);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectQuizOption(btn, opt, correctAnswer));
    optionsEl.appendChild(btn);
  });
}

function selectQuizOption(clickedBtn, selected, correctAnswer) {
  if (answered) return;
  answered = true;

  // Mark all buttons
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) btn.classList.add('correct');
  });

  const feedback = document.getElementById('feedback');
  if (selected === correctAnswer) {
    correctCount++;
    clickedBtn.classList.add('correct');
    feedback.textContent = 'Richtig! ✓';
    feedback.className = 'feedback correct';
  } else {
    clickedBtn.classList.add('wrong');
    wrongItems.push(deck[currentIndex]);
    feedback.textContent = 'Falsch ✗';
    feedback.className = 'feedback wrong';
  }

  document.getElementById('next-btn').classList.remove('hidden');
}

// --- Navigation ---
function nextCard() {
  currentIndex++;
  if (currentIndex >= deck.length) {
    showResult();
  } else {
    showCard();
  }
}

function showResult() {
  document.getElementById('card').classList.add('hidden');
  const result = document.getElementById('result-screen');
  result.classList.remove('hidden');

  const total = deck.length;
  document.getElementById('score-text').textContent =
    `${correctCount} von ${total} richtig (${Math.round((correctCount / total) * 100)} %)`;

  const wrongContainer = document.getElementById('wrong-list-container');
  const wrongList = document.getElementById('wrong-list');
  wrongList.innerHTML = '';

  if (wrongItems.length > 0) {
    wrongContainer.classList.remove('hidden');
    // Deduplicate wrong items for display
    const shownEn = new Set();
    wrongItems.forEach(item => {
      if (shownEn.has(item.en)) return;
      shownEn.add(item.en);
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.en}</strong> → ${item.de}`;
      wrongList.appendChild(li);
    });
  } else {
    wrongContainer.classList.add('hidden');
  }

  document.getElementById('progress-bar').style.width = '100%';
  document.getElementById('progress-text').textContent = `${total} / ${total}`;
}

// Start
restart();
