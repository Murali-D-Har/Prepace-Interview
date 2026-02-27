/* leaderboard.js */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  initSidebar();
  loadLeaderboard('week');
});

async function loadLeaderboard(period) {
  $$('.lb-tab').forEach(t => t.classList.toggle('active', t.dataset.period === period));

  const scoreEl  = $('#lb-score-list');
  const streakEl = $('#lb-streak-list');
  setLoading(scoreEl);
  setLoading(streakEl);

  try {
    const [scoreData, streakData] = await Promise.all([
      api(`/leaderboard?period=${period}`),
      api('/leaderboard/streaks')
    ]);

    renderLbList(scoreEl, scoreData.leaderboard, 'score');
    renderLbList(streakEl, streakData.leaderboard, 'streak');
  } catch (err) {
    setError(scoreEl, err.message);
    setError(streakEl, err.message);
  }
}

function renderLbList(el, items, type) {
  if (!items.length) {
    empty(el, '🏆', 'No data yet', 'Complete sessions to appear on the board!');
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  el.innerHTML = items.map((item, i) => {
    const rankClass = i < 3 ? `rank-${i + 1}` : '';
    const name = item.user?.name || item.name || 'Anonymous';
    const val  = type === 'score'
      ? `${item.avgScore}/10 (${item.count} ans)`
      : `${item.currentStreak} days`;

    return `
      <div class="lb-item ${rankClass} anim-fade-up" style="animation-delay:${i * 0.05}s">
        <div class="lb-rank">${medals[i] || i + 1}</div>
        <div class="lb-av">${name.charAt(0).toUpperCase()}</div>
        <div class="lb-name">${name}</div>
        <div class="lb-score">${val}</div>
      </div>
    `;
  }).join('');
}