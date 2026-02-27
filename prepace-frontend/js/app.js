/* app.js — core module: API, auth, shared utilities */

const API_BASE = 'https://prepace-backend.vercel.app/api';

/* ── State ───────────────────────────────────── */
const State = {
  token: localStorage.getItem('pa_token'),
  user:  JSON.parse(localStorage.getItem('pa_user') || 'null'),

  set(token, user) {
    this.token = token; this.user = user;
    localStorage.setItem('pa_token', token);
    localStorage.setItem('pa_user', JSON.stringify(user));
  },

  clear() {
    this.token = null; this.user = null;
    localStorage.removeItem('pa_token');
    localStorage.removeItem('pa_user');
  },

  isLoggedIn() { return !!this.token && !!this.user; }
};

/* ── API helper ──────────────────────────────── */
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(State.token ? { Authorization: `Bearer ${State.token}` } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);

  progress(30);
  try {
    const res  = await fetch(API_BASE + path, opts);
    const data = await res.json();
    progress(100);
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  } catch (err) {
    progress(0);
    throw err;
  }
}

/* ── Progress bar ────────────────────────────── */
let _progressTimeout;
function progress(pct) {
  const bar = document.getElementById('nprogress');
  if (!bar) return;
  clearTimeout(_progressTimeout);
  bar.style.transform = `scaleX(${pct / 100})`;
  if (pct >= 100) {
    _progressTimeout = setTimeout(() => { bar.style.transform = 'scaleX(0)'; }, 350);
  }
}

/* ── Toast ───────────────────────────────────── */
function toast(msg, type = 'success', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon"></span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* ── DOM helpers ─────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function html(str) {
  const t = document.createElement('template');
  t.innerHTML = str.trim();
  return t.content.firstChild;
}

function setLoading(el, msg = 'Loading...') {
  el.innerHTML = `<div class="loading-row"><div class="spinner"></div>${msg}</div>`;
}

function setError(el, msg) {
  el.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠</div><div class="empty-title">${msg}</div></div>`;
}

function empty(el, icon, title, sub = '') {
  el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon}</div><div class="empty-title">${title}</div>${sub ? `<div class="empty-sub">${sub}</div>` : ''}</div>`;
}

/* ── Auth guard ──────────────────────────────── */
function requireAuth() {
  if (!State.isLoggedIn()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function redirectIfAuthed() {
  if (State.isLoggedIn()) {
    window.location.href = 'pages/dashboard.html';
  }
}

/* ── Sidebar init (called on every app page) ── */
function initSidebar() {
  if (!State.user) return;

  const name = State.user.name || 'User';
  const initial = name.charAt(0).toUpperCase();

  const avatarEl  = document.getElementById('sb-avatar');
  const nameEl    = document.getElementById('sb-name');
  const streakEl  = document.getElementById('sb-streak');

  if (avatarEl)  avatarEl.textContent  = initial;
  if (nameEl)    nameEl.textContent    = name;
  if (streakEl)  streakEl.textContent  = '🔥 Loading...';

  // fetch streak async
  api('/streak').then(d => {
    if (streakEl) streakEl.textContent = `🔥 ${d.currentStreak} day streak`;
  }).catch(() => {});

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop();
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === currentPage) link.classList.add('active');
  });
}

/* ── Logout ──────────────────────────────────── */
function logout() {
  State.clear();
  window.location.href = '../index.html';
}

/* ── Format helpers ──────────────────────────── */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function scoreClass(score) {
  return score >= 7 ? 'hi' : score >= 5 ? 'mid' : 'lo';
}

function scoreLabel(score) {
  return score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Needs work' : 'Keep practicing';
}

function categoryBadgeClass(cat) {
  const map = {
    behavioral: 'badge-blue', technical: 'badge-lime', hr: 'badge-teal',
    situational: 'badge-orange', leadership: 'badge-neutral', 'problem-solving': 'badge-red'
  };
  return map[cat] || 'badge-neutral';
}