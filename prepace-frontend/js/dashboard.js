/* dashboard.js */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();
  setGreeting();
  await Promise.all([loadStats(), loadDailyQuestion(), loadRecentSessions()]);
});

function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const first = State.user?.name?.split(' ')[0] || 'there';
  $('#greeting-text').textContent = `${g}, ${first}`;
}

/* ── Stats overview ──────────────────────────── */
async function loadStats() {
  try {
    const [overview, byCategory, weak] = await Promise.all([
      api('/stats/overview'),
      api('/stats/by-category'),
      api('/stats/weak-areas')
    ]);

    // Stat cards
    const sg = $('#stats-grid');
    sg.innerHTML = `
      <div class="stat-card anim-fade-up delay-1" style="--accent-color:var(--lime)">
        <div class="stat-icon">📝</div>
        <div class="stat-value">${overview.totalAnswers}</div>
        <div class="stat-label">Answers Given</div>
      </div>
      <div class="stat-card anim-fade-up delay-2" style="--accent-color:var(--blue)">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${overview.averageScore || 0}</div>
        <div class="stat-label">Avg Score /10</div>
      </div>
      <div class="stat-card anim-fade-up delay-3" style="--accent-color:var(--orange)">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${overview.currentStreak}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card anim-fade-up delay-4" style="--accent-color:var(--teal)">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">${overview.totalSessions}</div>
        <div class="stat-label">Sessions Done</div>
      </div>
    `;

    // Category bars
    const cb = $('#cat-bars');
    if (byCategory.breakdown.length === 0) {
      empty(cb, '📊', 'No data yet', 'Complete a session to see your breakdown');
    } else {
      cb.innerHTML = byCategory.breakdown.map(c => `
        <div class="cat-bar-row">
          <div class="cat-bar-name">${c._id}</div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width:${(c.avgScore / 10) * 100}%"></div>
          </div>
          <div class="cat-bar-val">${(c.avgScore || 0).toFixed(1)}</div>
        </div>
      `).join('');
    }

    // Weak areas
    const wa = $('#weak-areas');
    if (weak.weakAreas.length === 0) {
      wa.innerHTML = `<div class="empty-state" style="padding:1.5rem"><div class="empty-icon">✅</div><div class="empty-title">No weak areas!</div><div class="empty-sub">All categories scoring above 6</div></div>`;
    } else {
      wa.innerHTML = weak.weakAreas.map(w => `
        <div class="cat-bar-row">
          <div class="cat-bar-name" style="color:var(--red)">${w._id}</div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width:${(w.avgScore / 10) * 100}%;background:linear-gradient(90deg,var(--red),var(--orange))"></div>
          </div>
          <div class="cat-bar-val" style="color:var(--red)">${(w.avgScore || 0).toFixed(1)}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    setError($('#stats-grid'), err.message);
  }
}

/* ── Daily question ──────────────────────────── */
async function loadDailyQuestion() {
  try {
    const data = await api('/questions/daily');
    const q = data.question;
    if (!q) return;
    $('#daily-q').textContent = q.text;
    $('#daily-cat').textContent = q.category;
    $('#daily-diff').textContent = q.difficulty;
    $('#daily-practice-btn').onclick = () => {
      window.location.href = 'practice.html';
    };
  } catch (err) {
    $('#daily-q').textContent = 'Could not load today\'s question.';
  }
}

/* ── Recent sessions ─────────────────────────── */
async function loadRecentSessions() {
  const el = $('#recent-list');
  setLoading(el);
  try {
    const data = await api('/sessions?limit=5&status=completed');
    if (!data.sessions.length) {
      empty(el, '🎯', 'No sessions yet', 'Start practicing to see your history here');
      return;
    }
    el.innerHTML = data.sessions.map(s => `
      <div class="recent-item">
        <div class="recent-score">${s.averageScore || '—'}</div>
        <div class="recent-info">
          <div class="recent-mode">${s.mode} · ${s.answered || 0} questions</div>
          <div class="recent-meta">${formatDate(s.createdAt)} · ${formatSeconds(s.totalTimeTaken || 0)}</div>
        </div>
        <div class="recent-badge">
          <span class="badge badge-lime">${s.status}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    setError(el, err.message);
  }
}