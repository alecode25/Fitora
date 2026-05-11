// =============================================
//  STEP NAVIGATION
// =============================================
let currentStep = 1;

function goToStep(n) {
  const current = document.getElementById('step' + currentStep);
  const next    = document.getElementById('step' + n);
  if (!next) return;

  current.classList.add('exit');
  setTimeout(() => {
    current.classList.remove('active', 'exit');
    current.style.display = 'none';
    next.style.display = 'flex';
    // force reflow before adding active so animation fires
    void next.offsetHeight;
    next.classList.add('active');
  }, 300);

  updateStepper(currentStep, n);
  currentStep = n;
}

function updateStepper(from, to) {
  const steps = document.querySelectorAll('.step');
  const lines  = document.querySelectorAll('.step-line');

  steps.forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n < to)  s.classList.add('done');
    if (n === to) s.classList.add('active');
  });

  lines.forEach((l, i) => {
    l.classList.toggle('done', i + 1 < to);
  });
}

// NEXT buttons
document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = parseInt(btn.dataset.next);
    if (validate(currentStep)) goToStep(next);
  });
});

// BACK buttons
document.querySelectorAll('.btn-back').forEach(btn => {
  btn.addEventListener('click', () => {
    goToStep(parseInt(btn.dataset.prev));
  });
});

// =============================================
//  VALIDATION
// =============================================
function validate(step) {
  if (step === 1) {
    const nome     = document.getElementById('nome').value.trim();
    const cognome  = document.getElementById('cognome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!nome)     return shake('nome'),    false;
    if (!cognome)  return shake('cognome'), false;
    if (!email || !email.includes('@')) return shake('email'), false;
    if (password.length < 8) return shake('password'), false;
  }
  if (step === 2) {
    const eta     = parseInt(document.getElementById('eta').value);
    const peso    = parseFloat(document.getElementById('peso').value);
    const altezza = parseInt(document.getElementById('altezza').value);
    if (!eta || eta < 10 || eta > 99)      return shake('eta'),     false;
    if (!peso || peso < 30 || peso > 250)   return shake('peso'),    false;
    if (!altezza || altezza < 100 || altezza > 250) return shake('altezza'), false;
  }
  return true;
}

function shake(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
  el.focus();
}

// =============================================
//  PASSWORD STRENGTH
// =============================================
document.getElementById('password').addEventListener('input', function () {
  const val  = this.value;
  const bars = document.querySelectorAll('.pw-bar');
  let score  = 0;
  if (val.length >= 8)            score++;
  if (/[A-Z]/.test(val))          score++;
  if (/[0-9]/.test(val))          score++;
  if (/[^A-Za-z0-9]/.test(val))   score++;

  const colors = ['#ff4444', '#ff8800', '#ffdd00', '#7fff00'];
  bars.forEach((bar, i) => {
    bar.style.background = i < score ? colors[score - 1] : 'rgba(255,255,255,0.1)';
    bar.style.transform  = i < score ? 'scaleX(1)' : 'scaleX(0.3)';
    bar.style.transition = 'background 0.3s, transform 0.3s';
  });
});

// Toggle password visibility
document.querySelector('.pw-toggle').addEventListener('click', function () {
  const input = document.getElementById('password');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  this.style.color = isHidden ? 'var(--cyan)' : 'rgba(255,255,255,0.3)';
});

// =============================================
//  NUMBER INPUTS (± buttons)
// =============================================
document.querySelectorAll('.num-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const dir   = parseFloat(btn.dataset.dir);
    const step  = parseFloat(input.step) || 1;
    const min   = parseFloat(input.min);
    const max   = parseFloat(input.max);
    let val = parseFloat(input.value) + dir * step;
    val = Math.min(max, Math.max(min, parseFloat(val.toFixed(1))));
    input.value = val;
    input.dispatchEvent(new Event('input'));

    // bounce animation
    input.style.transform = dir > 0 ? 'translateY(-3px)' : 'translateY(3px)';
    setTimeout(() => { input.style.transform = ''; input.style.transition = 'transform 0.2s'; }, 150);
  });
});

// =============================================
//  BMI LIVE CALCULATOR
// =============================================
function calcBMI() {
  const peso    = parseFloat(document.getElementById('peso').value);
  const altezza = parseFloat(document.getElementById('altezza').value) / 100;
  if (!peso || !altezza) return;

  const bmi = peso / (altezza * altezza);
  document.getElementById('bmiValue').textContent = bmi.toFixed(1);

  let status, pct;
  if      (bmi < 18.5) { status = 'Sottopeso';    pct = (bmi / 18.5) * 20; }
  else if (bmi < 25)   { status = 'Normopeso';     pct = 20 + ((bmi - 18.5) / 6.5) * 30; }
  else if (bmi < 30)   { status = 'Sovrappeso';    pct = 50 + ((bmi - 25) / 5) * 25; }
  else                 { status = 'Obesità';        pct = Math.min(95, 75 + ((bmi - 30) / 10) * 20); }

  document.getElementById('bmiStatus').textContent = status;
  document.getElementById('bmiBarFill').style.width = pct + '%';
}

['peso', 'altezza'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcBMI);
});
calcBMI();

// =============================================
//  MOVEMENT CARDS
// =============================================
let selectedMovement = null;

document.querySelectorAll('.mov-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mov-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedMovement = card.dataset.value;

    // ripple
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;width:6px;height:6px;background:rgba(0,212,212,0.4);
      border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
      animation:ripple 0.5s ease;pointer-events:none;
    `;
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// Add ripple keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple { to { transform: translate(-50%,-50%) scale(30); opacity: 0; } }
  .shake { animation: shake 0.4s ease; }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-6px); }
    80%      { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);

// =============================================
//  SUBMIT
// =============================================
document.getElementById('btnSubmit').addEventListener('click', () => {
  if (!validate(3)) return;
  if (!selectedMovement) {
    document.querySelector('.movement-grid').style.animation = 'shake 0.4s ease';
    setTimeout(() => document.querySelector('.movement-grid').style.animation = '', 400);
    return;
  }

  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-submit-text">Creazione in corso...</span>';

  setTimeout(() => {
    const step3 = document.getElementById('step3');
    step3.classList.add('exit');
    setTimeout(() => {
      step3.classList.remove('active', 'exit');
      step3.style.display = 'none';

      // mark all steps done
      document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active');
        s.classList.add('done');
      });
      document.querySelectorAll('.step-line').forEach(l => l.classList.add('done'));

      const success = document.getElementById('successScreen');
      const nome = document.getElementById('nome').value.trim();
      document.getElementById('successName').textContent = 'Ciao, ' + nome + '!';
      success.classList.add('visible');
    }, 300);
  }, 1200);
});
