// Shared FocusFlow helpers: settings storage, theme, formatting, sound/notifications.

const FF_SETTINGS_KEY = 'focusflow_settings';
const FF_STATE_KEY = 'focusflow_timer_state';

const FF_DEFAULT_SETTINGS = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakInterval: 4,
  autoStart: false,
  soundEnabled: true,
  notifyEnabled: false,
  theme: 'system',
};

function ffGetSettings() {
  try {
    const raw = localStorage.getItem(FF_SETTINGS_KEY);
    if (!raw) return { ...FF_DEFAULT_SETTINGS };
    return { ...FF_DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...FF_DEFAULT_SETTINGS };
  }
}

function ffSaveSettings(settings) {
  localStorage.setItem(FF_SETTINGS_KEY, JSON.stringify(settings));
}

function ffApplyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
  else if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
}

function ffFormatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = Math.floor(safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ffPlayChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [0, 0.18, 0.36].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 2 ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.2, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
  } catch (e) {
    /* Web Audio unavailable — skip sound */
  }
}

function ffNotify(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

// Apply theme as early as possible on every page.
ffApplyTheme(ffGetSettings().theme);
