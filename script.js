// Nav scroll
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Hamburger / mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function openMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

document.addEventListener('click', e => {
  if (mobileMenu.classList.contains('open') &&
      !nav.contains(e.target) && !mobileMenu.contains(e.target)) closeMenu();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  if (mobileMenu.classList.contains('open') && Math.abs(window.scrollY - lastScrollY) > 60) closeMenu();
  lastScrollY = window.scrollY;
}, { passive: true });

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .stat-item, .feat-card, .tl-step, .comm-card').forEach(el => {
  observer.observe(el);
});

// Stagger feat cards
document.querySelectorAll('.feat-card').forEach((c, i) => {
  c.style.transitionDelay = `${i * 0.07}s`;
});
