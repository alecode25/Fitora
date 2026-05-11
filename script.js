// Nav scroll
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
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
