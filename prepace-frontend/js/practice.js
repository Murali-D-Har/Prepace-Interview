/* practice.js */

const Session = {
  id: null, questions: [], idx: 0, answers: [],
  timerInterval: null, timeLeft: 0, startTime: null, sessionStart: null,
  mode: 'timed',
};

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  initSidebar();
  buildCategoryPills();
});

/* ── Setup pills ─────────────────────────────── */
function buildCategoryPills() {
  const cats = ['Any', 'behavioral', 'technical', 'hr', 'situational', 'leadership', 'problem-solving'];
  $('#cat-pills').innerHTML = cats.map((c, i) =>
    `<div class="pill ${i === 0 ? 'active' : ''}" data-group="cat" onclick="togglePill(this,'cat')">${c}</div>`
  ).join('');
}

function togglePill(el, group) {
  $$('.pill[data-group="' + group + '"]').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function getSelected(group) {
  return $$(`.pill[data-group="${group}"].active`).map(p => p.textContent.trim());
}

function getOne(group) { return getSelected(group)[0] || ''; }

/* ── Start session ───────────────────────────── */
async function startSession() {
  const cat   = getOne('cat');
  const diff  = getOne('diff');
  const count = parseInt(getOne('count')) || 5;
  const mode  = getOne('mode').toLowerCase();

  Session.mode = mode;

  const catParam  = cat === 'Any' ? '' : `&category=${cat.toLowerCase()}`;
  const diffParam = diff === 'Mixed' ? '' : `&difficulty=${diff.toLowerCase()}`;

  try {
    $('#start-btn').disabled = true;
    $('#start-btn').textContent = 'Loading questions...';

    const qData = await api(`/questions/random?count=${count}${catParam}${diffParam}`);
    if (!qData.questions.length) {
      toast('No questions found for those filters.', 'error');
      $('#start-btn').disabled = false;
      $('#start-btn').textContent = '▷  Start Session';
      return;
    }

    const sess = await api('/sessions', 'POST', {
      mode, categories: [cat.toLowerCase()],
      difficulty: diff.toLowerCase(),
      questions: qData.questions.map(q => q._id)
    });

    Object.assign(Session, {
      id: sess.session._id, questions: qData.questions,
      idx: 0, answers: [], timerInterval: null,
      sessionStart: Date.now()
    });

    showView('session');
    renderQuestion();
  } catch (err) {
    toast(err.message, 'error');
    $('#start-btn').disabled = false;
    $('#start-btn').textContent = '▷  Start Session';
  }
}

/* ── Views ───────────────────────────────────── */
function showView(v) {
  ['setup','session','complete'].forEach(id =>
    document.getElementById(id + '-view').style.display = v === id ? 'block' : 'none'
  );
}

/* ── Render question ─────────────────────────── */
function renderQuestion() {
  const q = Session.questions[Session.idx];
  const total = Session.questions.length;
  const pct = ((Session.idx) / total) * 100;

  $('#q-counter').textContent = `Question ${Session.idx + 1} of ${total}`;
  $('#q-progress-fill').style.width = pct + '%';

  const isTimed = Session.mode === 'timed' || Session.mode === 'mock';
  const timeLimit = q.timeLimit || 120;

  if (isTimed) {
    $('#timer-box').style.display = 'block';
    startTimer(timeLimit);
  } else {
    $('#timer-box').style.display = 'none';
  }

  $('#question-area').innerHTML = `
    <div class="question-card">
      <div class="q-meta">
        <span class="badge ${categoryBadgeClass(q.category)}">${q.category}</span>
        <span class="badge badge-neutral">${q.difficulty}</span>
        <span class="q-number">Q${Session.idx + 1}</span>
      </div>
      <div class="q-text">${q.text}</div>
    </div>
    <div class="star-tip">
      💡 <strong>STAR Method:</strong> Situation → Task → Action → Result — works great for behavioral & situational questions
    </div>
    <textarea class="answer-area" id="answer-box"
      placeholder="Type your answer here..."></textarea>
    <div class="answer-actions">
      <button class="btn btn-lime btn-lg" onclick="submitAnswer()">Submit Answer →</button>
      <button class="btn btn-ghost" onclick="skipQuestion()">Skip</button>
      ${isTimed ? `<span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text3);margin-left:auto">${timeLimit}s limit</span>` : ''}
    </div>
  `;
}

/* ── Timer ───────────────────────────────────── */
function startTimer(seconds) {
  clearInterval(Session.timerInterval);
  Session.timeLeft = seconds;
  Session.startTime = Date.now();
  updateTimerDisplay();

  Session.timerInterval = setInterval(() => {
    Session.timeLeft--;
    updateTimerDisplay();
    if (Session.timeLeft <= 0) {
      clearInterval(Session.timerInterval);
      submitAnswer(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = $('#timer-box');
  if (!el) return;
  const m = Math.floor(Session.timeLeft / 60);
  const s = Session.timeLeft % 60;
  el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  el.className = 'timer-box' +
    (Session.timeLeft <= 30 && Session.timeLeft > 10 ? ' warn' : '') +
    (Session.timeLeft <= 10 ? ' crit' : '');
}

/* ── Submit ──────────────────────────────────── */
async function submitAnswer(timedOut = false) {
  clearInterval(Session.timerInterval);
  const q = Session.questions[Session.idx];
  const answerText = $('#answer-box')?.value || '';
  const timeTaken  = q.timeLimit - Session.timeLeft;

  // Show analyzing state
  $('#question-area').innerHTML = `
    <div class="question-card" style="border-color:rgba(200,241,53,0.2)">
      <div class="q-meta">
        <span class="badge ${categoryBadgeClass(q.category)}">${q.category}</span>
      </div>
      <div class="q-text">${q.text}</div>
    </div>
    <div class="loading-row" style="flex-direction:column;gap:0.5rem">
      <div class="spinner" style="width:28px;height:28px;border-width:3px"></div>
      <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text3)">Analyzing with AI...</span>
    </div>
  `;

  try {
    const data = await api('/answers', 'POST', {
      sessionId: Session.id, questionId: q._id,
      answerText, timeTaken, timeLimit: q.timeLimit, timedOut
    });
    Session.answers.push(data.answer);
    // Update streak silently
    api('/streak/check-in', 'POST').catch(() => {});
    renderFeedback(data.answer, q);
  } catch (err) {
    toast('AI feedback unavailable: ' + err.message, 'error');
    moveNext();
  }
}

/* ── Feedback ────────────────────────────────── */
function renderFeedback(answer, question) {
  const fb = answer.aiFeedback || {};
  const score = fb.score || 0;
  const sc = scoreClass(score);
  const sl = scoreLabel(score);

  $('#question-area').innerHTML = `
    <div class="question-card" style="margin-bottom:0.8rem">
      <div class="q-meta">
        <span class="badge ${categoryBadgeClass(question.category)}">${question.category}</span>
        <span class="q-number">Your Answer</span>
      </div>
      <div class="q-text">${question.text}</div>
    </div>
    <div class="feedback-wrap">
      <div class="feedback-hdr">
        <div class="score-ring ${sc}">
          <div class="score-num">${score}</div>
          <div class="score-denom">/ 10</div>
        </div>
        <div class="feedback-text">
          <h3>${sl}</h3>
          <p>${fb.summary || 'Analysis complete.'}</p>
        </div>
      </div>
      <div class="feedback-panels">
        <div class="fb-panel strengths">
          <div class="fb-panel-title">✓ Strengths</div>
          <div class="fb-list">
            ${(fb.strengths || ['No strengths detected']).map(s =>
              `<div class="fb-item"><div class="fi-dot"></div>${s}</div>`
            ).join('')}
          </div>
        </div>
        <div class="fb-panel improvements">
          <div class="fb-panel-title">↑ Improvements</div>
          <div class="fb-list">
            ${(fb.improvements || ['Keep practicing']).map(i =>
              `<div class="fb-item"><div class="fi-dot"></div>${i}</div>`
            ).join('')}
          </div>
        </div>
      </div>
      ${fb.keywords?.length ? `
        <div class="card" style="padding:1rem;margin-bottom:1rem">
          <div class="label" style="margin-bottom:0.6rem">Keywords Detected</div>
          <div class="keywords-row">
            ${fb.keywords.map(k => `<span class="kw-tag">${k}</span>`).join('')}
          </div>
        </div>` : ''}
      <button class="btn btn-lg" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text)" onclick="moveNext()">
        ${Session.idx + 1 < Session.questions.length ? '→ Next Question' : '✓ Finish Session'}
      </button>
    </div>
  `;
}

/* ── Skip / Next ─────────────────────────────── */
function skipQuestion() {
  clearInterval(Session.timerInterval);
  moveNext();
}

async function moveNext() {
  Session.idx++;
  if (Session.idx >= Session.questions.length) {
    await finishSession();
  } else {
    renderQuestion();
  }
}

/* ── Finish ──────────────────────────────────── */
async function finishSession() {
  const totalTime = Math.floor((Date.now() - Session.sessionStart) / 1000);
  try {
    await api(`/sessions/${Session.id}/complete`, 'PATCH', { totalTimeTaken: totalTime });
  } catch (_) {}

  const ans = Session.answers;
  const avg = ans.length
    ? (ans.reduce((s, a) => s + (a.aiFeedback?.score || 0), 0) / ans.length).toFixed(1)
    : '—';

  $('#complete-grid').innerHTML = `
    <div class="complete-stat"><div class="cs-val">${ans.length}</div><div class="cs-label">answered</div></div>
    <div class="complete-stat"><div class="cs-val">${avg}</div><div class="cs-label">avg score</div></div>
    <div class="complete-stat"><div class="cs-val">${Math.floor(totalTime / 60)}m</div><div class="cs-label">time spent</div></div>
  `;

  showView('complete');
  toast(`Session complete! Avg score: ${avg}/10`, 'success');

  // update sidebar streak
  setTimeout(() => {
    api('/streak').then(d => {
      const el = $('#sb-streak');
      if (el) el.textContent = `🔥 ${d.currentStreak} day streak`;
    }).catch(() => {});
  }, 600);
}

function resetToSetup() {
  Object.assign(Session, { id: null, questions: [], idx: 0, answers: [], timerInterval: null });
  $('#start-btn').disabled = false;
  $('#start-btn').textContent = '▷  Start Session';
  showView('setup');
}