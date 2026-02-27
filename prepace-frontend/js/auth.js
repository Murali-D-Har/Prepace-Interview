/* auth.js */

document.addEventListener('DOMContentLoaded', () => {
  redirectIfAuthed();
  bindEnterKey();
});

/* ── Tab switching ───────────────────────────── */
let activeTab = 'login';

function switchTab(tab) {
  activeTab = tab;
  $$('.auth-tab').forEach((b, i) => b.classList.toggle('active', (tab === 'login') === (i === 0)));
  $('#login-form').style.display    = tab === 'login'    ? 'flex' : 'none';
  $('#register-form').style.display = tab === 'register' ? 'flex' : 'none';
  clearError();
}

/* ── Error display ───────────────────────────── */
function showError(msg) {
  const el = $('#auth-error');
  el.textContent = msg;
  el.classList.add('show');
}

function clearError() {
  const el = $('#auth-error');
  el.textContent = '';
  el.classList.remove('show');
}

/* ── Login ───────────────────────────────────── */
async function handleLogin() {
  const email    = $('#login-email').value.trim();
  const password = $('#login-password').value;

  clearError();
  if (!email || !password) return showError('Please fill in all fields.');

  const btn = $('#login-btn');
  btn.disabled = true; btn.textContent = 'Signing in...';

  try {
    const data = await api('/auth/login', 'POST', { email, password });
    State.set(data.token, data.user);
    toast('Welcome back, ' + data.user.name.split(' ')[0] + '!', 'success', 1500);
    setTimeout(() => window.location.href = 'pages/dashboard.html', 500);
  } catch (err) {
    showError(err.message);
    btn.disabled = false; btn.textContent = 'Sign In →';
  }
}

/* ── Register ────────────────────────────────── */
async function handleRegister() {
  const name     = $('#reg-name').value.trim();
  const email    = $('#reg-email').value.trim();
  const password = $('#reg-password').value;

  clearError();
  if (!name || !email || !password) return showError('Please fill in all fields.');
  if (password.length < 6) return showError('Password must be at least 6 characters.');

  const btn = $('#register-btn');
  btn.disabled = true; btn.textContent = 'Creating account...';

  try {
    const data = await api('/auth/register', 'POST', { name, email, password });
    State.set(data.token, data.user);
    toast('Account created! Welcome, ' + data.user.name.split(' ')[0] + '!', 'success', 1500);
    setTimeout(() => window.location.href = 'pages/dashboard.html', 500);
  } catch (err) {
    showError(err.message);
    btn.disabled = false; btn.textContent = 'Create Account →';
  }
}

/* ── Enter key ───────────────────────────────── */
function bindEnterKey() {
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (activeTab === 'login')    handleLogin();
    if (activeTab === 'register') handleRegister();
  });
}