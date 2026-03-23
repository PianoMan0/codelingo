// ---------------- Data ----------------

const TRACKS = [
  {
    id: "js",
    name: "JavaScript Basics",
    lessons: [
      {
        id: "js-vars",
        title: "Variables & Types",
        xp: 10,
        content: `
<h2>What is a variable?</h2>
<p>A variable stores a value. In modern JavaScript you usually use <code>let</code> or <code>const</code>.</p>
<pre>let age = 20;
const name = "Ava";</pre>
<p><code>let</code> can be reassigned, <code>const</code> cannot.</p>
<h2>Primitive types</h2>
<p>Common primitive types are: <code>string</code>, <code>number</code>, <code>boolean</code>, <code>null</code>, <code>undefined</code>.</p>
<pre>let done = false;      // boolean
let score = 42;        // number
let title = "Hello";   // string</pre>
      `,
        starterCode: `let name = "Ada";
let age = 30;
console.log("Name:", name);
console.log("Age:", age);`,
        quiz: [
          {
            q: "Which keyword creates a variable that can be reassigned?",
            options: ["const", "let", "static"],
            correct: 1
          },
          {
            q: "What type is the value true?",
            options: ["string", "boolean", "number"],
            correct: 1
          }
        ]
      },
      {
        id: "js-if",
        title: "Conditionals",
        xp: 10,
        content: `
<h2>if statements</h2>
<p>Use <code>if</code> to run code only when a condition is true.</p>
<pre>let age = 18;
if (age >= 18) {
  console.log("Adult");
}</pre>
<h2>else and else if</h2>
<pre>if (score > 90) {
  console.log("A");
} else if (score > 80) {
  console.log("B");
} else {
  console.log("C or below");
}</pre>
      `,
        starterCode: `let score = 87;
if (score > 90) {
  console.log("A");
} else if (score > 80) {
  console.log("B");
} else {
  console.log("C or below");
}`,
        quiz: [
          {
            q: "Which operator checks both value AND type?",
            options: ["==", "===", "="],
            correct: 1
          },
          {
            q: "What does this print? if (5 > 2) console.log('yes');",
            options: ["yes", "no", "nothing"],
            correct: 0
          }
        ]
      }
    ]
  },
  {
    id: "html",
    name: "HTML Fundamentals",
    lessons: [
      {
        id: "html-structure",
        title: "Page Structure",
        xp: 10,
        content: `
<h2>Basic HTML document</h2>
<pre>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</pre>
<p><code>&lt;head&gt;</code> holds metadata, <code>&lt;body&gt;</code> holds visible content.</p>
      `,
        starterCode: `<!DOCTYPE html>
<html>
  <head>
    <title>Practice</title>
  </head>
  <body>
    <h1>Hello from CodeLingo</h1>
  </body>
</html>`,
        quiz: [
          {
            q: "Which tag is the root of an HTML document?",
            options: ["<body>", "<html>", "<head>"],
            correct: 1
          },
          {
            q: "Where does the page title live?",
            options: ["head", "body", "footer"],
            correct: 0
          }
        ]
      }
    ]
  },
  {
    id: "css",
    name: "CSS Essentials",
    lessons: [
      {
        id: "css-selectors",
        title: "Selectors",
        xp: 10,
        content: `
<h2>Class selector</h2>
<p>Use a dot (<code>.</code>) followed by the class name.</p>
<pre>.btn {
  background: blue;
}</pre>
<h2>ID selector</h2>
<p>Use a hash (<code>#</code>) followed by the id.</p>
<pre>#main {
  padding: 20px;
}</pre>
      `,
        starterCode: `/* Try changing the color */
.btn {
  background: tomato;
  color: white;
}`,
        quiz: [
          {
            q: "How do you select an element with class 'card'?",
            options: ["card {}", ".card {}", "#card {}"],
            correct: 1
          }
        ]
      }
    ]
  }
];

// ---------------- Persistence ----------------

const STORAGE_KEY = "codelingo-path-v2";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        xp: 0,
        streak: 0,
        lastDay: null,
        completedLessons: {},
        dailyDone: null,
        dark: false
      };
    const parsed = JSON.parse(raw);
    return {
      xp: parsed.xp ?? 0,
      streak: parsed.streak ?? 0,
      lastDay: parsed.lastDay ?? null,
      completedLessons: parsed.completedLessons ?? {},
      dailyDone: parsed.dailyDone ?? null,
      dark: parsed.dark ?? false
    };
  } catch {
    return {
      xp: 0,
      streak: 0,
      lastDay: null,
      completedLessons: {},
      dailyDone: null,
      dark: false
    };
  }
}

let progress = loadProgress();

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ---------------- State ----------------

let currentTrack = null;
let currentLesson = null;
let quizIndex = 0;
let selectedIndex = null;

// ---------------- DOM helpers ----------------

const $ = (id) => document.getElementById(id);

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function bumpStreak() {
  const today = todayKey();
  if (!progress.lastDay) {
    progress.streak = 1;
  } else if (progress.lastDay === today) {
    // same day
  } else {
    const last = new Date(progress.lastDay);
    const now = new Date(today);
    const diff = Math.round((now - last) / (1000 * 60 * 60 * 24));
    if (diff === 1) progress.streak += 1;
    else if (diff > 1) progress.streak = 1;
  }
  progress.lastDay = today;
}

function updateHeader() {
  $("xp-label").textContent = `${progress.xp} XP`;
  $("streak-label").textContent = `🔥 ${progress.streak}-day streak`;
  const pct = computeOverallPercent();
  $("progress-label").textContent = `${pct}% complete`;
  $("overall-progress-fill").style.width = `${pct}%`;

  const today = todayKey();
  const dailyBtn = $("daily-challenge-btn");
  if (progress.dailyDone === today) {
    dailyBtn.disabled = true;
    dailyBtn.textContent = "Daily done ✓";
  } else {
    dailyBtn.disabled = false;
    dailyBtn.textContent = "Daily challenge";
  }

  document.body.classList.toggle("dark", !!progress.dark);
  $("dark-toggle").textContent = progress.dark ? "Light mode" : "Dark mode";
}

// ---------------- Progress helpers ----------------

function isLessonCompleted(trackId, lessonId) {
  return !!progress.completedLessons[`${trackId}:${lessonId}`];
}

function computeOverallPercent() {
  let total = 0;
  let done = 0;
  TRACKS.forEach((t) => {
    t.lessons.forEach((l) => {
      total += 1;
      if (isLessonCompleted(t.id, l.id)) done += 1;
    });
  });
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

// ---------------- Skill path UI ----------------

function renderTracks() {
  const list = $("track-list");
  list.innerHTML = "";

  TRACKS.forEach((track) => {
    const li = document.createElement("li");
    li.className = "track-item";

    const title = document.createElement("div");
    title.className = "track-title";
    title.textContent = track.name;
    li.appendChild(title);

    const ul = document.createElement("ul");
    ul.className = "track-lessons";

    track.lessons.forEach((lesson, index) => {
      const node = document.createElement("li");
      node.className = "lesson-node";

      const completed = isLessonCompleted(track.id, lesson.id);
      const locked =
        index > 0 && !isLessonCompleted(track.id, track.lessons[index - 1].id);

      if (completed) node.classList.add("completed");
      if (locked) node.classList.add("locked");

      const span = document.createElement("span");
      span.textContent = locked ? `🔒 ${lesson.title}` : lesson.title;

      const xp = document.createElement("span");
      xp.className = "lesson-xp";
      xp.textContent = `${lesson.xp} XP`;

      node.appendChild(span);
      node.appendChild(xp);

      node.onclick = () => {
        if (locked) return;
        currentTrack = track;
        currentLesson = lesson;
        openLesson();
      };

      ul.appendChild(node);
    });

    li.appendChild(ul);
    list.appendChild(li);
  });
}

function renderHome() {
  $("home-title").textContent = currentTrack ? currentTrack.name : "Choose a track";
  $("home-subtitle").textContent = "Tap a lesson in the path or pick one below.";

  const list = $("lesson-list");
  list.innerHTML = "";

  const tracksToShow = currentTrack ? [currentTrack] : TRACKS;

  tracksToShow.forEach((track) => {
    track.lessons.forEach((lesson, index) => {
      const item = document.createElement("li");
      item.className = "lesson-node";

      const completed = isLessonCompleted(track.id, lesson.id);
      const locked =
        index > 0 && !isLessonCompleted(track.id, track.lessons[index - 1].id);

      if (completed) item.classList.add("completed");
      if (locked) item.classList.add("locked");

      const span = document.createElement("span");
      span.textContent = `${locked ? "🔒 " : ""}${track.name} · ${lesson.title}`;

      const xp = document.createElement("span");
      xp.className = "lesson-xp";
      xp.textContent = `${lesson.xp} XP`;

      item.appendChild(span);
      item.appendChild(xp);

      item.onclick = () => {
        if (locked) return;
        currentTrack = track;
        currentLesson = lesson;
        openLesson();
      };

      list.appendChild(item);
    });
  });
}

// ---------------- Lesson view ----------------

function openLesson() {
  $("lesson-title").textContent = currentLesson.title;
  $("lesson-meta").textContent = `${currentTrack.name} • ${currentLesson.xp} XP`;
  $("lesson-body").innerHTML = currentLesson.content;
  $("runner-input").value = currentLesson.starterCode || "";
  $("runner-output").textContent = "";
  showView("view-lesson");
}

// ---------------- Code runner ----------------

$("run-code").addEventListener("click", () => {
  const code = $("runner-input").value;
  let output = "";
  const originalLog = console.log;
  try {
    console.log = (...args) => {
      output += args.join(" ") + "\n";
    };
    // eslint-disable-next-line no-eval
    eval(code);
  } catch (e) {
    output += "Error: " + e.message;
  } finally {
    console.log = originalLog;
  }
  $("runner-output").textContent = output.trim();
});

$("clear-output").addEventListener("click", () => {
  $("runner-output").textContent = "";
});

// ---------------- Quiz view ----------------

function startPractice() {
  quizIndex = 0;
  selectedIndex = null;
  renderQuizQuestion();
  showView("view-quiz");
}

function renderQuizQuestion() {
  const q = currentLesson.quiz[quizIndex];
  $("quiz-title").textContent = currentLesson.title + " • Practice";
  $("quiz-progress").textContent = `Question ${quizIndex + 1} of ${currentLesson.quiz.length}`;
  $("quiz-question").textContent = q.q;

  const opts = $("quiz-options");
  opts.innerHTML = "";
  selectedIndex = null;
  $("submit-answer").disabled = true;
  $("quiz-feedback").textContent = "";
  $("next-question").classList.add("hidden");
  $("submit-answer").classList.remove("hidden");

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      selectedIndex = i;
      document
        .querySelectorAll("#quiz-options button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      $("submit-answer").disabled = false;
    });
    opts.appendChild(btn);
  });
}

$("submit-answer").addEventListener("click", () => {
  const q = currentLesson.quiz[quizIndex];
  const fb = $("quiz-feedback");
  if (selectedIndex === q.correct) {
    fb.textContent = "Correct!";
    fb.style.color = "green";
  } else {
    fb.textContent = "Incorrect.";
    fb.style.color = "red";
  }
  $("next-question").classList.remove("hidden");
});

$("next-question").addEventListener("click", () => {
  quizIndex++;
  if (quizIndex >= currentLesson.quiz.length) {
    finishLesson();
  } else {
    renderQuizQuestion();
  }
});

function finishLesson() {
  const key = `${currentTrack.id}:${currentLesson.id}`;
  if (!progress.completedLessons[key]) {
    progress.completedLessons[key] = true;
    progress.xp += currentLesson.xp;
    bumpStreak();
    saveProgress();
    updateHeader();
    renderTracks();
  }

  $("quiz-title").textContent = "Lesson complete!";
  $("quiz-progress").textContent = `${currentLesson.xp} XP earned`;
  $("quiz-question").textContent = "Nice work. You can replay this lesson anytime to review.";
  $("quiz-options").innerHTML = "";
  $("quiz-feedback").textContent = "";
  $("submit-answer").classList.add("hidden");
  $("next-question").classList.add("hidden");
}

// ---------------- Daily challenge ----------------

function allQuestions() {
  const arr = [];
  TRACKS.forEach((track) => {
    track.lessons.forEach((lesson) => {
      lesson.quiz.forEach((q) => {
        arr.push({ track, lesson, q });
      });
    });
  });
  return arr;
}

function startDailyChallenge() {
  const today = todayKey();
  if (progress.dailyDone === today) {
    showView("view-daily");
    $("daily-subtitle").textContent = "You already completed today's challenge. Come back tomorrow.";
    $("daily-question").textContent = "";
    $("daily-options").innerHTML = "";
    $("daily-submit").disabled = true;
    $("daily-feedback").textContent = "";
    return;
  }

  const questions = allQuestions();
  const random = questions[Math.floor(Math.random() * questions.length)];

  $("daily-subtitle").textContent = "One random question from anywhere in your path.";
  $("daily-question").textContent = `${random.lesson.title} • ${random.q.q}`;
  const opts = $("daily-options");
  opts.innerHTML = "";
  selectedIndex = null;
  $("daily-feedback").textContent = "";
  $("daily-submit").disabled = true;

  random.q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      selectedIndex = i;
      document
        .querySelectorAll("#daily-options button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      $("daily-submit").disabled = false;
    });
    opts.appendChild(btn);
  });

  $("daily-submit").onclick = () => {
    if (selectedIndex === random.q.correct) {
      $("daily-feedback").textContent = "Correct! +5 XP";
      $("daily-feedback").style.color = "green";
      progress.xp += 5;
      bumpStreak();
      progress.dailyDone = todayKey();
      saveProgress();
      updateHeader();
    } else {
      $("daily-feedback").textContent = "Incorrect. Try again tomorrow.";
      $("daily-feedback").style.color = "red";
      progress.dailyDone = todayKey();
      saveProgress();
      updateHeader();
    }
    $("daily-submit").disabled = true;
  };

  showView("view-daily");
}

// ---------------- Navigation & settings ----------------

$("start-practice").addEventListener("click", startPractice);

$("back-to-home").addEventListener("click", () => {
  renderHome();
  showView("view-home");
});

$("quit-quiz").addEventListener("click", () => {
  renderHome();
  showView("view-home");
});

$("daily-challenge-btn").addEventListener("click", startDailyChallenge);

$("back-from-daily").addEventListener("click", () => {
  renderHome();
  showView("view-home");
});

$("dark-toggle").addEventListener("click", () => {
  progress.dark = !progress.dark;
  saveProgress();
  updateHeader();
});

$("reset-progress").addEventListener("click", () => {
  if (!confirm("Reset all progress? This cannot be undone.")) return;
  progress = {
    xp: 0,
    streak: 0,
    lastDay: null,
    completedLessons: {},
    dailyDone: null,
    dark: progress.dark
  };
  saveProgress();
  renderTracks();
  renderHome();
  updateHeader();
});

// ---------------- Init ----------------

function init() {
  updateHeader();
  renderTracks();
  renderHome();
  showView("view-home");
}

document.addEventListener("DOMContentLoaded", init);
