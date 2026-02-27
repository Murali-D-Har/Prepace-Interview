/* history.js */

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();
  loadHistory();
});

async function loadHistory(status = '') {
  const el = $('#history-grid');
  setLoading(el, 'Loading sessions...');

  try {
    const url = status && status !== 'all' ? `/sessions?limit=30&status=${status}` : `/sessions?limit=30`;
    const data = await api(url);

    if (!data.sessions.length) {
      empty(el, '📋', 'No sessions yet', 'Start a practice session to see your history');
      return;
    }

    el.innerHTML = data.sessions.map((s, i) => `
      <div class="history-card anim-fade-up" style="animation-delay:${i * 0.04}s">
        <div class="hc-score">
          <div class="hc-score-val">${s.averageScore || '—'}</div>
          <div class="hc-score-denom">/ 10</div>
        </div>
        <div class="hc-info">
          <div class="hc-mode">${s.mode} Mode &mdash; ${s.answered || 0} questions</div>
          <div class="hc-detail">
            ${s.categories?.length ? s.categories.join(', ') : 'mixed'} · 
            ${formatSeconds(s.totalTimeTaken || 0)}
          </div>
        </div>
        <div class="hc-right">
          <div class="hc-date">${formatDate(s.createdAt)}</div>
          <span class="badge ${s.status === 'completed' ? 'badge-lime' : s.status === 'abandoned' ? 'badge-red' : 'badge-neutral'}">
            ${s.status}
          </span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    setError(el, err.message);
  }
}

function filterHistory(status) {
  currentFilter = status;
  $$('.filter-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  loadHistory(status);
}