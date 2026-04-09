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
let mode = 'de-en'; // 'de-en' | 'en-de'
let deck = [];
let currentIndex = 0;
let correctCount = 0;
let wrongItems = [];
let answered = false;

// --- Init ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setMode(newMode) {
  mode = newMode;
  document.getElementById('btn-de-en').classList.toggle('active', mode === 'de-en');
  document.getElementById('btn-en-de').classList.toggle('active', mode === 'en-de');
  restart();
}

function restart() {
  deck = shuffle(vocabulary);
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

  const questionText = mode === 'de-en' ? item.de : item.en;
  const label = mode === 'de-en' ? 'Deutsch → Englisch' : 'Englisch → Deutsch';

  document.getElementById('question-label').textContent = label;
  document.getElementById('question').textContent = questionText;

  const input = document.getElementById('answer-input');
  input.value = '';
  input.className = 'answer-input';
  input.disabled = false;
  input.focus();

  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('correct-answer').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('check-btn').disabled = false;

  updateProgress();
}

function updateProgress() {
  const total = deck.length;
  const done = currentIndex;
  const pct = total === 0 ? 0 : (done / total) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${done} / ${total}`;
}

// Normalize: lowercase, trim, collapse multiple slashes/alternatives for comparison
function normalize(str) {
  return str.toLowerCase().trim();
}

// Accept answer if it matches ANY of the slash-separated alternatives
function isCorrect(userAnswer, correctAnswer) {
  const user = normalize(userAnswer);
  const alternatives = correctAnswer.split('/').map(s => normalize(s));
  return alternatives.some(alt => alt === user);
}

function checkAnswer() {
  if (answered) return;

  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();
  if (!userAnswer) return;

  answered = true;
  input.disabled = true;
  document.getElementById('check-btn').disabled = true;

  const item = deck[currentIndex];
  const correctAnswer = mode === 'de-en' ? item.en : item.de;
  const correct = isCorrect(userAnswer, correctAnswer);

  const feedback = document.getElementById('feedback');
  feedback.classList.remove('hidden', 'correct', 'wrong');
  input.classList.remove('correct', 'wrong');

  if (correct) {
    correctCount++;
    feedback.textContent = 'Richtig! ✓';
    feedback.classList.add('correct');
    input.classList.add('correct');
    document.getElementById('correct-answer').classList.add('hidden');
  } else {
    wrongItems.push(item);
    feedback.textContent = 'Falsch ✗';
    feedback.classList.add('wrong');
    input.classList.add('wrong');

    const correctAnswerEl = document.getElementById('correct-answer');
    correctAnswerEl.innerHTML = `Richtige Antwort: <span>${correctAnswer}</span>`;
    correctAnswerEl.classList.remove('hidden');
  }

  document.getElementById('next-btn').classList.remove('hidden');
}

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
    wrongItems.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.en}</strong> → ${item.de}`;
      wrongList.appendChild(li);
    });
  } else {
    wrongContainer.classList.add('hidden');
  }

  updateProgress();
  document.getElementById('progress-bar').style.width = '100%';
  document.getElementById('progress-text').textContent = `${total} / ${total}`;
}

// Allow Enter key to submit
document.getElementById('answer-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!answered) {
      checkAnswer();
    } else {
      nextCard();
    }
  }
});

// Start
restart();
