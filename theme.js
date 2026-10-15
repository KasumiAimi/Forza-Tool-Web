// Run in <head> so a saved choice is applied before the first paint.
(() => {
 const key = 'horizon_web_v2_theme';
 const root = document.documentElement;
 let theme = 'dark';
 try { const saved = localStorage.getItem(key); if (saved === 'light' || saved === 'dark') theme = saved; } catch {}
 function apply(value) {
  root.dataset.theme = value;
  const button = document.getElementById('themeToggle');
  if (!button) return;
  const light = value === 'light';
  button.setAttribute('aria-label', light ? '切换到深色主题' : '切换到浅色主题');
  button.title = button.getAttribute('aria-label');
  button.querySelector('.theme-icon').textContent = light ? '☾' : '☀';
  button.querySelector('.theme-label').textContent = light ? '深色' : '浅色';
 }
 apply(theme);
 document.addEventListener('DOMContentLoaded', () => {
  apply(root.dataset.theme);
  document.getElementById('themeToggle').addEventListener('click', () => {
   const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
   apply(next);
   try { localStorage.setItem(key, next); } catch {}
  });
 });
 window.addEventListener('storage', event => {
  if (event.key === key) apply(event.newValue === 'light' ? 'light' : 'dark');
 });
})();
