// Header scroll effect
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const mobileOverlay = document.getElementById('mobileOverlay');

// Inserisce le 3 linee per l'animazione dell'hamburger
if (navToggle) {
  navToggle.innerHTML = '<span></span><span></span><span></span>';
}

const toggleMenu = () => {
  navToggle.classList.toggle('active');
  mobileOverlay.classList.toggle('active');
  document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
};

navToggle.addEventListener('click', toggleMenu);

// Profile Modal Toggle
const profileTrigger = document.getElementById('profileTrigger');
const mobileProfileTrigger = document.getElementById('mobileProfileTrigger');
const profileModal = document.getElementById('profileModal');
const closeProfile = document.getElementById('closeProfile');

if(profileTrigger) {
  profileTrigger.addEventListener('click', () => {
    profileModal.classList.add('active');
  });
}
if(mobileProfileTrigger) {
  mobileProfileTrigger.addEventListener('click', () => {
    toggleMenu(); // Chiude il menu hamburger
    profileModal.classList.add('active'); // Apre il modal profilo
  });
}
if(closeProfile) {
  closeProfile.addEventListener('click', () => {
    profileModal.classList.remove('active');
  });
}

// Close menu on link click
mobileOverlay.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });
});



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
