/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  FITORA CHATBOT WIDGET  —  chatbot.js               ║
 * ╚══════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════════════════ */
  const CFG = Object.assign({
    siteName:       'FITORA',
    botName:        'Assistente FITORA',
    botAvatar:      '⚡',
    apiKey:         '',
    proxyUrl:       '',
    model:          'claude-sonnet-4-6',
    maxTokens:      512,
    welcomeMessage: 'Ciao! 👋 Sono l\'assistente di **FITORA**.\nPosso aiutarti a navigare il sito, conoscerti le funzionalità, metterti in contatto con i Personal Trainer e tanto altro. Come posso aiutarti?',
    cssFile:        null,
  }, window.ChatbotConfig || {});

  /* ══════════════════════════════════════════════════════
     DETECT PAGE  (index.html vs check-in.html/dashboard)
  ══════════════════════════════════════════════════════ */
  const IS_DASHBOARD = !!document.getElementById('page-home');

  /* ══════════════════════════════════════════════════════
     NAVIGAZIONE REALE
  ══════════════════════════════════════════════════════ */
  const NAV = IS_DASHBOARD ? {
    home:        { label: 'Home Dashboard',    icon: '🏠', action: () => switchTabSafe('home') },
    run:         { label: 'Corri / GPS',       icon: '🏃', action: () => switchTabSafe('run') },
    allenamento: { label: 'Allenamento Oggi',  icon: '⚡', action: () => goHref('workout.html') },
    nutrizione:  { label: 'Piano Alimentare',  icon: '🥗', action: () => goHref('nutrition.html') },
    sport:       { label: 'Il Tuo Sport',      icon: '🏆', action: () => goHref('sport-quiz.html') },
    storico:     { label: 'Storico Corse',     icon: '📜', action: () => switchTabSafe('history') },
    musica:      { label: 'Musica / Spotify',  icon: '🎵', action: () => switchTabSafe('music') },
    community:   { label: 'Community',         icon: '👥', action: () => switchTabSafe('community') },
    match:       { label: 'Trova Compagno',    icon: '💚', action: () => goHref('match.html') },
  } : {
    home:        { label: 'Home',              icon: '🏠', action: () => goHref('index.html#hero') },
    metodo:      { label: 'Il Metodo',         icon: '📋', action: () => goHref('index.html#beyond') },
    features:    { label: 'Funzionalità',      icon: '⚡', action: () => goHref('index.html#features') },
    tech:        { label: 'Tecnologia AI',     icon: '🤖', action: () => goHref('index.html#vision') },
    community:   { label: 'Community',         icon: '👥', action: () => goHref('index.html#community') },
    futuro:      { label: 'Futuro / Wearable', icon: '🚀', action: () => goHref('index.html#future') },
    dashboard:   { label: 'Dashboard ⚡',      icon: '📊', action: () => goHref('check-in.html') },
    registrati:  { label: 'Registrati',        icon: '✍️', action: () => goHref('register.html') },
    allenamento: { label: 'Allenamento',       icon: '⚡', action: () => goHref('workout.html') },
    nutrizione:  { label: 'Nutrizione',        icon: '🥗', action: () => goHref('nutrition.html') },
    sport:       { label: 'Quiz Sport',        icon: '🏆', action: () => goHref('sport-quiz.html') },
  };

  function goHref(url) { window.location.href = url; }
  function switchTabSafe(tab) {
    if (typeof window.switchTab === 'function') window.switchTab(tab);
  }

  /* ══════════════════════════════════════════════════════
     PERSONAL TRAINER
  ══════════════════════════════════════════════════════ */
  const PT_DATA = [
    {
      name:  'Marco Ferretti',
      role:  'Strength & Conditioning',
      photo: 'https://i.pravatar.cc/80?img=11',
      phone: '3901234567',
      bio:   'Specializzato in forza funzionale e bodybuilding. 8 anni di esperienza, certificato CSEN.',
      tags:  ['Forza', 'Ipertrofia', 'Postura', 'Funzionale'],
    },
    {
      name:  'Laura Conti',
      role:  'Cardio & Wellness Coach',
      photo: 'https://i.pravatar.cc/80?img=47',
      phone: '3917654321',
      bio:   'Coach di running, yoga e nutrizione sportiva. 6 anni di esperienza, laureata in Scienze Motorie.',
      tags:  ['Cardio', 'Yoga', 'Dimagrimento', 'Running'],
    },
    {
      name:  'Alessio Vitali',
      role:  'Crossfit & Functional Trainer',
      photo: 'https://i.pravatar.cc/80?img=12',
      phone: '3928889990',
      bio:   'Esperto in allenamenti ad alta intensità e preparazione atletica. 5 anni di gare Crossfit.',
      tags:  ['Crossfit', 'HIIT', 'Resistenza', 'Mobilità'],
    },
  ];

  /* ══════════════════════════════════════════════════════
     CHIP SETS
  ══════════════════════════════════════════════════════ */
  const CHIPS_DEFAULT = [
    'Come funziona FITORA?',
    'PT per allenarsi',
    'Dove trovo le funzioni?',
    'Cos\'è la Computer Vision?',
    'Community e sfide',
    'Allenamento con l\'AI',
  ];
  const CHIPS_AFTER_NAV = [
    'PT per allenarsi',
    'Come funziona il GPS?',
    'Nutrizione intelligente',
    'Community e sfide',
  ];
  const CHIPS_AFTER_PT = [
    'Come funziona FITORA?',
    'Dove trovo gli allenamenti?',
    'Cos\'è la Computer Vision?',
    'Community e sfide',
  ];
  const CHIPS_AFTER_FEATURES = [
    'PT per allenarsi',
    'Mostrami le sezioni del sito',
    'Come mi registro?',
    'Community e sfide',
  ];

  /* ══════════════════════════════════════════════════════
     INJECT CSS
  ══════════════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('cb-styles')) return;
    const script = document.currentScript || document.querySelector('script[src*="chatbot"]');
    const base   = script ? script.src.replace(/chatbot\.js[^/]*$/, '') : '';
    const href   = CFG.cssFile || (base + 'chatbot.css');
    const link   = document.createElement('link');
    link.id = 'cb-styles'; link.rel = 'stylesheet'; link.href = href;
    document.head.appendChild(link);
  })();

  /* ══════════════════════════════════════════════════════
     STATO
  ══════════════════════════════════════════════════════ */
  let isOpen  = false;
  let isBusy  = false;
  let history = [];
  let bmiState = { step: 0, weight: 0, height: 0 }; // Stato per il calcolatore BMI
  let chipSet = CHIPS_DEFAULT;

  /* ══════════════════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════════════════ */
  function el(tag, props, html) {
    const e = document.createElement(tag);
    if (props) Object.assign(e, props);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function md(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>');
  }
  function autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
  }
  function escHTML(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function waLink(phone) {
    return `https://wa.me/39${phone.replace(/\D/g,'')}`;
  }

  /* ══════════════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════════════ */
  function buildDOM() {
    const toggleBtn = el('button', { className: 'cb-toggle', id: 'cb-toggle' }, `
      <span class="cb-icon-chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </span>
      <span class="cb-icon-x">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
    `);
    const badge = el('span', { className: 'cb-badge', id: 'cb-badge' }, '1');
    toggleBtn.appendChild(badge);

    const win = el('div', { className: 'cb-win', id: 'cb-win' }, `
      <div class="cb-header">
        <div class="cb-avatar">${CFG.botAvatar}</div>
        <div class="cb-header-info">
          <div class="cb-header-name">${CFG.botName}</div>
          <div class="cb-header-status"><span class="cb-dot"></span>Online ora</div>
        </div>
        <button class="cb-reset" id="cb-reset" title="Pulisci chat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
        <button class="cb-close" id="cb-close" aria-label="Chiudi">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="cb-msgs" id="cb-msgs"></div>
      <div class="cb-bottom" aria-live="polite" aria-atomic="false">
        <div class="cb-chips" id="cb-chips"></div>
        <div class="cb-input-row">
          <textarea class="cb-input" id="cb-input"
            placeholder="Scrivi un messaggio…" rows="1" aria-label="Messaggio"></textarea>
          <button class="cb-send" id="cb-send" aria-label="Invia">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `);

    document.body.appendChild(toggleBtn);
    document.body.appendChild(win);
  }

  /* ══════════════════════════════════════════════════════
     CHIPS
  ══════════════════════════════════════════════════════ */
  function renderChips(set) {
    const container = document.getElementById('cb-chips');
    if (!container) return;
    container.innerHTML = '';
    (set || chipSet).forEach(text => {
      const chip = el('button', { className: 'cb-chip' }, escHTML(text));
      chip.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita che il click chiuda la finestra
        send(text);
      });
      container.appendChild(chip);
    });
  }
  function updateChips(set) {
    chipSet = set || CHIPS_DEFAULT;
    renderChips(chipSet);
  }

  /* ══════════════════════════════════════════════════════
     MESSAGGI
  ══════════════════════════════════════════════════════ */
  function addMsg(role, text, isError) {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs) return;
    const row = el('div', { className: `cb-msg cb-msg-${role}` });
    if (role === 'bot') {
      const cls = 'cb-bubble cb-bubble-bot' + (isError ? ' cb-err-bubble' : '');
      row.innerHTML = `<div class="cb-msg-av">${CFG.botAvatar}</div><div class="${cls}">${md(text)}</div>`;
    } else {
      row.innerHTML = `<div class="cb-bubble cb-bubble-user">${md(text)}</div>`;
    }
    msgs.appendChild(row);
    scrollBottom();
    saveChat();
  }
  function saveChat() {
    // Filtra i messaggi ricchi per salvare il loro contenuto HTML
    const serializableHistory = history.map(m => {
      if (m.type === 'rich') {
        return { role: m.role, content: m.content, type: m.type, nextChips: m.nextChips };
      }
      return { role: m.role, content: m.content };
    });
    localStorage.setItem('fitora_chat_history', JSON.stringify(serializableHistory));
  }
  function loadChat() {
    const saved = localStorage.getItem('fitora_chat_history');
    if (saved) {
      history = JSON.parse(saved);
      history.forEach(m => {
        if (m.type === 'rich') {
          addRichMsg(m.content, m.nextChips); // Re-render rich message
          setTimeout(bindNavClicks, 50); // Re-bind clicks for nav cards
        } else {
          addMsg(m.role, m.content);
        }
      });
      scrollBottom();
    }
  }
  function addRichMsg(html, nextChips) {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs) return;
    const row = el('div', { className: 'cb-msg cb-msg-bot' });
    row.innerHTML = `<div class="cb-msg-av">${CFG.botAvatar}</div><div class="cb-bubble cb-bubble-bot cb-rich">${html}</div>`;
    msgs.appendChild(row);
    scrollBottom();
    if (nextChips) updateChips(nextChips);
    saveChat();
  }
  function showTyping() {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs || document.getElementById('cb-typing')) return;
    const row = el('div', { className: 'cb-msg cb-msg-bot', id: 'cb-typing' }, `
      <div class="cb-msg-av">${CFG.botAvatar}</div>
      <div class="cb-bubble cb-bubble-bot cb-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `);
    msgs.appendChild(row);
    scrollBottom();
  }
  function removeTyping() { document.getElementById('cb-typing')?.remove(); }
  function scrollBottom() {
    const msgs = document.getElementById('cb-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  /* ══════════════════════════════════════════════════════
     PT CARDS
  ══════════════════════════════════════════════════════ */
  function buildPTCards() {
    const cards = PT_DATA.map(pt => `
      <div class="cb-pt-card">
        <img class="cb-pt-photo" src="${pt.photo}" alt="${escHTML(pt.name)}"
             onerror="this.style.display='none'">
        <div class="cb-pt-info">
          <div class="cb-pt-name">${escHTML(pt.name)}</div>
          <div class="cb-pt-role">${escHTML(pt.role)}</div>
          <div class="cb-pt-bio">${escHTML(pt.bio)}</div>
          <div class="cb-pt-tags">
            ${pt.tags.map(t=>`<span class="cb-pt-tag">${escHTML(t)}</span>`).join('')}
          </div>
          <a class="cb-pt-wa" href="${waLink(pt.phone)}" target="_blank" rel="noopener">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.143.564 4.148 1.546 5.877L0 24l6.293-1.526A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.87 9.87 0 0 1-5.042-1.382l-.361-.214-3.741.981.999-3.648-.235-.374A9.87 9.87 0 0 1 2.118 12C2.118 6.539 6.539 2.118 12 2.118S21.882 6.539 21.882 12 17.461 21.882 12 21.882z"/>
            </svg>
            Scrivi a ${escHTML(pt.name.split(' ')[0])} su WhatsApp
          </a>
        </div>
      </div>
    `).join('');
    return `<div class="cb-pt-intro">👥 I nostri <strong>Personal Trainer</strong> in palestra:</div>${cards}`;
  }

  /* ══════════════════════════════════════════════════════
     NAV CARDS  — pulsanti che navigano davvero
  ══════════════════════════════════════════════════════ */
  function buildNavCards(keys) {
    const items = (keys || Object.keys(NAV)).map(k => {
      const n = NAV[k];
      if (!n) return '';
      return `<button class="cb-nav-item" data-nav="${k}">
        <span class="cb-nav-icon">${n.icon}</span>
        <span class="cb-nav-label">${escHTML(n.label)}</span>
        <span class="cb-nav-arrow">→</span>
      </button>`;
    }).join('');
    return `<div class="cb-nav-intro">📍 Dove vuoi andare? Clicca per aprire:</div><div class="cb-nav-grid">${items}</div>`;
  }

  function bindNavClicks() {
    document.querySelectorAll('.cb-nav-item[data-nav]:not([data-bound])').forEach(btn => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const n = NAV[btn.dataset.nav];
        if (n && n.action) { closeChat(); setTimeout(() => n.action(), 200); }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     HELPER
  ══════════════════════════════════════════════════════ */
  function rich(html, nextChips) { return { __rich: true, html, nextChips }; }

  /* ══════════════════════════════════════════════════════
     SEND
  ══════════════════════════════════════════════════════ */
  async function send(text) {
    text = text.trim();
    if (!text || isBusy) return;

    const chipsEl = document.getElementById('cb-chips');
    if (chipsEl) chipsEl.innerHTML = '';

    addMsg('user', text);
    history.push({ role: 'user', content: text });

    const input = document.getElementById('cb-input');
    if (input) { input.value = ''; autoResize(input); }

    setBusy(true);
    showTyping();

    try {
      const result = await generateResponse(text);
      removeTyping();
      if (result && result.__rich) { // Handle rich messages
        history.push({ role: 'assistant', content: result.html, type: 'rich', nextChips: result.nextChips });
        addRichMsg(result.html, result.nextChips);
        setTimeout(bindNavClicks, 50);
      } else {
        history.push({ role: 'assistant', content: result });
        addMsg('bot', result);
        // updateChips(chipSet); // Chips are updated by addRichMsg or generateResponse
        updateChips(chipSet);
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', '⚠️ Si è verificato un errore. Riprova tra poco.', true);
      console.error('[FITORA Chatbot]', err);
      updateChips(chipSet);
    } finally {
      // A small delay to ensure UI updates properly, especially if there are rapid DOM changes.
      // This helps prevent the input from getting stuck in a disabled state.
      setTimeout(() => setBusy(false), 50);
    }
  }

  function setBusy(busy) {
    isBusy = busy;
    const sb = document.getElementById('cb-send');
    const inp = document.getElementById('cb-input');
    if (sb) sb.disabled = busy;
    if (inp) inp.disabled = busy;
  }

  /* ══════════════════════════════════════════════════════
     LOGICA RISPOSTE
  ══════════════════════════════════════════════════════ */
  async function generateResponse(userMessage) {
    await new Promise(r => setTimeout(r, Math.random() * 600 + 300));
    const msg = userMessage.toLowerCase();

    /* ── Logica BMI Flow ── */
    if (bmiState.step === 1) {
      const w = parseFloat(msg);
      if (isNaN(w) || w < 30 || w > 250) return "Per favore, inserisci un peso valido in kg (es: 75).";
      bmiState.weight = w;
      bmiState.step = 2;
      return "Ottimo. Ora inserisci la tua **altezza in cm** (es: 180):";
    }
    if (bmiState.step === 2) {
      const h = parseFloat(msg) / 100;
      if (isNaN(h) || h < 1 || h > 2.5) return "Per favore, inserisci un'altezza valida in cm (es: 175).";
      const bmi = (bmiState.weight / (h * h)).toFixed(1);
      bmiState.step = 0;
      let desc = bmi < 18.5 ? "Sottopeso" : bmi < 25 ? "Normopeso" : bmi < 30 ? "Sovrappeso" : "Obesità";
      return `Il tuo BMI calcolato è **${bmi}** (${desc}).\n\nRicorda che questo è un valore indicativo. Per un'analisi completa, consulta i nostri PT o la sezione Nutrizione! 💪`;
    }
    if (/calcola.*bmi|indice.*massa|voglio sapere il mio bmi/.test(msg)) {
      bmiState.step = 1;
      return "Certamente! Aiutami con il calcolo. Qual è il tuo **peso attuale in kg**?";
    }

    /* ── Saluti ── */
    if (/\b(ciao|salve|hey|buongiorno|buonasera|buonanotte|hello)\b/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      const hasChattedBefore = localStorage.getItem('fitora_has_chatted');
      if (hasChattedBefore) {
        return 'Bentornato! 👋 Sono di nuovo qui per aiutarti con **FITORA**. Come posso esserti utile oggi?';
      } else {
        localStorage.setItem('fitora_has_chatted', 'true');
        return 'Ciao! 👋 Sono l\'assistente di **FITORA**.\n\nPosso aiutarti su: funzionalità dell\'app, navigare il sito, Personal Trainer disponibili e tanto altro. Da dove vuoi iniziare?';
      }
    }

    /* ── Contatti / Supporto ── */
    if (/contatti|supporto|aiuto|email|telefono|assistenza/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Certo! Puoi contattarci via email a **supporto@fitora.com** o visitare la nostra pagina di **Contatti** sul sito. Siamo qui per aiutarti! 📧';
    }


    /* ── Chi sei ── */
    if (/chi sei|cosa fai|presentati|come ti chiami/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Sono l\'assistente virtuale di **FITORA** 🤖\n\nPosso:\n- Rispondere alle domande sull\'app e le funzionalità\n- Portarti direttamente alle sezioni del sito\n- Presentarti i nostri **Personal Trainer**\n- Supportarti nel tuo percorso fitness\n\nChiedimi pure qualsiasi cosa!';
    }

    /* ══ PERSONAL TRAINER - Come allenarsi con un PT ══ */
    if (/pt per allenarsi|come allenarsi con un personal trainer|allenamento con pt|voglio un pt/.test(msg)) {
      updateChips(CHIPS_AFTER_PT);
      return 'Allenarsi con un **Personal Trainer** di FITORA significa avere un esperto al tuo fianco per:\n\n- **Piani personalizzati**: Schede su misura per i tuoi obiettivi e condizioni fisiche.\n- **Correzione tecnica**: Feedback in tempo reale per massimizzare i risultati e prevenire infortuni.\n- **Motivazione costante**: Supporto e incoraggiamento per superare i tuoi limiti.\n- **Monitoraggio avanzato**: Analisi dettagliata dei progressi e aggiustamenti del programma.\n\nI nostri PT sono specializzati in diverse discipline. Vuoi conoscerli?';
    }

    /* ══ PERSONAL TRAINER - Mostra PT disponibili ══ */
    if (/personal trainer|pt\b|\bcoach\b|allenatore|preparatore|conoscerli/.test(msg)) {
      return rich(buildPTCards(), CHIPS_AFTER_PT);
    }

    /* ══ NAVIGAZIONE — tutte le sezioni ══ */
    if (/dove trovo|dove si trova|dove posso|come arrivo|come vado|tutte le sezioni|mappa del sito|mostrami.*sezion|sezioni del sito|cosa c'è nel sito/.test(msg)) {
      return rich(buildNavCards(), CHIPS_AFTER_NAV);
    }

    /* Sezioni specifiche */
    if (/\b(dashboard|check.?in|pannello|home)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['home','allenamento','nutrizione','sport'] : ['dashboard','features','metodo']), CHIPS_AFTER_NAV);
    }
    if (/\b(workout|allenament|eserciz|scheda)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['allenamento','sport', IS_DASHBOARD?'run':'tech']), CHIPS_AFTER_NAV);
    }
    if (/\b(nutrizi|dieta|calorie|alimentaz|pasto|cibo)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['nutrizione', IS_DASHBOARD?'home':'dashboard']), CHIPS_AFTER_NAV);
    }
    if (/\b(community|amici|sfid|classifica|badge)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['community', IS_DASHBOARD?'match':'futuro']), CHIPS_AFTER_NAV);
    }
    if (/\b(storico|storia|corse passate)\b/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['storico','run','home'] : ['dashboard']), CHIPS_AFTER_NAV);
    }
    if (/\b(musica|spotify|playlist)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['musica','run'] : ['dashboard']), CHIPS_AFTER_NAV);
    }
    if (/\b(gps|corri|corsa|percorso)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['run','storico'] : ['dashboard','tech']), CHIPS_AFTER_NAV);
    }
    if (/registr|iscri|sign.?up/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['registrati', IS_DASHBOARD?'home':'dashboard']), CHIPS_AFTER_NAV);
    }

    /* ══ FUNZIONALITÀ ══ */

    /* Come funziona */
    if (/come funziona|funzionalit|cosa offre|cosa fa fitora|spiegami|dimmi di fitora/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return 'FITORA è un\'app fitness all-in-one basata su **AI** 🤖\n\n**01 Lo Sport Perfetto** — Analizza i tuoi dati clinici e suggerisce lo sport ideale per te.\n\n**02 Personal Trainer AI** — Corregge postura, conta reps, previene infortuni — solo col tuo telefono.\n\n**03 Computer Vision** — La fotocamera analizza i tuoi movimenti in tempo reale.\n\n**04 Adattabilità Quotidiana** — Il piano cambia ogni giorno in base al tuo umore e stanchezza.\n\n**05 Nutrizione Intelligente** — Piano alimentare su misura basato sui parametri reali.\n\n**06 Community & Gamification** — Sfide, badge, compagni di allenamento.\n\nVuoi sapere di più su una funzione specifica?';
    }

    /* Computer Vision */
    if (/computer vision|telecamera|fotocamera|postura|ripetizioni|\brep\b|movimento.*reale|reale.*movimento/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Computer Vision di FITORA** 📷\n\nUsa la fotocamera del tuo smartphone per:\n\n- **Analizzare i movimenti** in tempo reale\n- **Correggere la postura** con feedback visivo immediato\n- **Contare le ripetizioni** automaticamente\n- **Rilevare rischi di infortuni** *prima* che accadano\n\nNon servono sensori o device aggiuntivi — basta il tuo telefono appoggiato davanti a te 📱\n\nVuoi che ti porti nella sezione Tech del sito?';
    }

    /* GPS / Corsa */
    if (/\bgps\b|traccia.*corsa|percorso gps|correre|running|km.*corsa|distanza.*corsa/.test(msg)) {
      updateChips(['Dove trovo la sezione Corri?', 'Storico corse', 'Cos\'è la Computer Vision?', 'Personal Trainer 💪']);
      return '**Tracking GPS di FITORA** 🛰️\n\nDalla sezione **Corri** puoi:\n\n- Tracciare il percorso in **tempo reale** su mappa interattiva\n- Vedere distanza, velocità, calorie e ritmo (min/km)\n- Visualizzare il **grafico del ritmo** nel tempo\n- Salvare la sessione nello **Storico Corse**\n- Mettere in pausa e riprendere la sessione\n\nIl GPS si attiva quando premi *Avvia*. Basta permettere l\'accesso alla posizione 📍\n\nVuoi aprire la schermata Corri?';
    }

    /* Adattabilità / Check-in */
    if (/adattab|check.?in|umore|stanchezza|giorn|quotidian|stato.*oggi|come mi sento/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Adattabilità Quotidiana** 🔄\n\nOgni giorno FITORA ti chiede come stai tramite un breve **check-in**:\n\n- Come ti senti fisicamente?\n- Livello di stanchezza e stress\n- Qualità del sonno\n\nIn base alle risposte, l\'AI **modifica il piano di allenamento**:\n\n- 🟢 Forma top → allenamento intenso\n- 🟡 Moderato → workout ridotto\n- 🔴 Stanco → recupero attivo\n\nIn questo modo non ti alleni mai in modo controproducente!';
    }

    /* Sport perfetto / Quiz */
    if (/sport perfetto|sport ideal|quale sport|che sport|mi consiglia.*sport|quiz.*sport|sport.*quiz/.test(msg)) {
      updateChips(['Dove trovo il Quiz Sport?', 'Come funziona FITORA?', 'Personal Trainer 💪', 'Community e sfide']);
      return '**"Il Tuo Sport Perfetto"** 🏆\n\nFITORA incrocia:\n- I tuoi **dati clinici** (peso, altezza, pressione, glicemia)\n- Le tue **preferenze personali**\n- Le tue **capacità fisiche reali**\n\nIn 6 domande ti suggerisce i **3 sport più adatti a te**, spiegando i benefici specifici per la tua salute.\n\nVuoi aprire il quiz adesso?';
    }

    /* Allenamento con AI */
    if (/allenament.*ai|ai.*allenament|scheda.*ai|ai.*scheda|workout.*inteligent/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Allenamento con l\'AI** ⚡\n\nFITORA genera schede di allenamento personalizzate basate su:\n\n- Il tuo **profilo clinico** (peso, altezza, parametri medici)\n- Il **check-in giornaliero** (come stai oggi)\n- I tuoi **obiettivi** (forza, dimagrimento, resistenza...)\n- Lo **sport che pratichi**\n\nLa scheda si adatta automaticamente ogni giorno — mai lo stesso workout generico!\n\nVuoi aprire l\'allenamento di oggi?';
    }

    /* Nutrizione */
    if (/nutrizi|calorie|caloric|macro|dieta|alimentaz|pasto|cibo|bmr|tdee|fabbisogno/.test(msg)) {
      updateChips(['Dove trovo il Piano Alimentare?', 'Come funziona FITORA?', 'Allenamento con l\'AI', 'Personal Trainer 💪']);
      return '**Nutrizione Intelligente** 🥗\n\nFITORA calcola:\n\n- **BMR** (metabolismo basale) + **TDEE** (fabbisogno totale)\n- Suddivisione ottimale in **macronutrienti** (proteine, carbo, grassi)\n- **Piano pasti giornaliero** su misura\n\nTutto basato sui tuoi parametri reali — non una dieta generica, ma una dieta *tua*.\n\nVuoi aprire il Piano Alimentare?';
    }

    /* Community / Badge */
    if (/community|amici|sfid|classifica|social|gruppo|badge|gamification|matching|compagno/.test(msg)) {
      updateChips(['Dove trovo la Community?', 'Come funzionano i badge?', 'Personal Trainer 💪', 'Come mi registro?']);
      return '**Community FITORA** 👥\n\n- **Matching Intelligente** — Trova compagni con lo stesso sport e livello 💚\n- **Sfide di Gruppo** — Compete in challenge settimanali\n- **Badge & Classifiche** — Guadagna badge: Prima Corsa, 5 km, 50 km...\n- **Condivisione WhatsApp** — Invita amici e sfidali\n- **Trova Compagno** — Scorri profili di atleti vicini a te\n\nVuoi aprire la Community?';
    }

    /* Storico corse */
    if (/storico|storia.*corse|corse.*salvate|sessioni.*salvate|le mie corse/.test(msg)) {
      updateChips(['Dove trovo lo Storico?', 'Come funziona il GPS?', 'Community e sfide', 'Personal Trainer 💪']);
      return '**Storico Corse** 📜\n\nIn questa sezione trovi tutte le tue sessioni salvate con:\n\n- **Data e ora** della corsa\n- **Distanza** percorsa in km\n- **Tempo** totale\n- **Calorie** bruciate\n- **Waypoint GPS** registrati\n\nPuoi anche cancellare lo storico o condividere i risultati con la community!\n\nVuoi aprire lo Storico?';
    }

    /* Musica / Spotify */
    if (/\b(musica|spotify|playlist|brano|canzone|song)\b/.test(msg)) {
      updateChips(['Dove trovo la sezione Musica?', 'Come funziona il GPS?', 'Community e sfide', 'Come funziona FITORA?']);
      return '**Musica su FITORA** 🎵\n\nNella sezione **Musica** della Dashboard puoi:\n\n- Ascoltare una **playlist predefinita** per l\'allenamento\n- Incollare qualsiasi link **Spotify** (brano, album o playlist)\n- Il player rimane attivo **durante la corsa GPS**\n- Il link viene **salvato automaticamente** per le prossime sessioni\n\nPerfetto per allenarsi con la tua musica preferita!';
    }

    /* Wearable */
    if (/wearable|smartwatch|apple watch|garmin|fitbit|orologio.*smart/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Integrazione Wearable** ⌚\n\nFITORA sta sviluppando l\'integrazione con:\n\n- **Apple Watch**\n- **Garmin**\n- **Fitbit**\n\nI dati si sincronizzeranno automaticamente — senza inserimenti manuali.\n\nQuesta funzione arriva con **FITORA 2.0** 🚀 insieme a partnership mediche e telemedicina!';
    }

    /* Futuro / FITORA 2.0 */
    if (/futuro|prossimamente|2\.0|telemedicina|partnership|in arrivo|novit/.test(msg)) {
      updateChips(['Come funziona FITORA?', 'Wearable e integrazioni', 'Personal Trainer 💪', 'Community e sfide']);
      return '**Il Futuro di FITORA** 🚀\n\n**⌚ Integrazione Wearable** — Sync automatico con Apple Watch, Fitbit, Garmin.\n\n**🏥 Partnership Mediche** — Collaborazioni con palestre, centri medici e assicurazioni.\n\n**👨‍⚕️ Telemedicina** — I medici potranno monitorare i progressi dei pazienti a distanza.\n\nFITORA è una piattaforma in continua evoluzione — restate sintonizzati!';
    }

    /* App mobile */
    if (/app mobile|scarica|download|android|ios|iphone|google play|app store/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**App FITORA** 📲\n\nDisponibile su:\n- **App Store** (iOS / iPhone)\n- **Google Play** (Android)\n\nScaricala gratuitamente! Puoi anche usare FITORA direttamente dal **browser** senza installare nulla — prova subito la Dashboard!';
    }

    /* Registrazione */
    if (/registr|iscri|creare.*account|sign.?up|nuovo.*account/.test(msg)) {
      updateChips(['Dove mi registro?', 'Come funziona FITORA?', 'Personal Trainer 💪', 'Community e sfide']);
      return 'Per registrarti a **FITORA** e iniziare il tuo percorso, clicca qui: Registrati su FITORA 📝\n\nÈ semplice e veloce!';
    }

    /* Login */
    if (/login|accedi|entrare|password|accesso|dimenticato.*password/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Per accedere a **FITORA** usa il pulsante **Dashboard ⚡** nel menu in alto.\n\nSe hai dimenticato la password, dalla pagina di login trovi il link *"Password dimenticata?"* per resettarla via email 🔐';
    }

    /* Notifiche */
    if (/notifich|reminder|avvisi|promemoria/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return 'FITORA invia **notifiche intelligenti** 🔔\n\n- Reminder per gli allenamenti programmati\n- Aggiornamenti sui progressi settimanali\n- Avvisi sulle sfide della community\n- Messaggi motivazionali personalizzati\n\nGestisci le preferenze da **Profilo → Impostazioni Notifiche**.';
    }

    /* Infortuni / sicurezza */
    if (/infortun|dolore|fisioterapia|recupero|sicurezza|male.*eserciz/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return 'La **sicurezza** è al centro di FITORA ⚠️\n\nL\'app monitora il carico di lavoro e ti avvisa quando rischi il sovrallenamento. La **Computer Vision** analizza la postura in tempo reale per prevenire movimenti scorretti.\n\nIn caso di dolori o infortuni, consulta sempre un medico o fisioterapista prima di riprendere.\n\nHai bisogno di un **Personal Trainer** per una scheda su misura?';
    }

    /* Grazie */
    if (/\b(grazie|perfetto|ottimo|bravo|ok grazie|capito|benissimo)\b/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Prego! 😊 Sono qui se hai altre domande su FITORA. Buon allenamento! 💪';
    }

    /* Off-topic */
    if (/politic|notizie|matematica|storia|meteo|covid|guerra|film|ricette di cucina/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Mi dispiace, posso aiutarti solo con argomenti inerenti a **FITORA** e al fitness 🏋️\n\nHai domande sull\'app, le funzionalità o i nostri Personal Trainer?';
    }

    /* Fallback */
    updateChips(CHIPS_DEFAULT);
    return 'Non ho capito bene 🤔 Ecco cosa posso fare per te:\n\n- Spiegarti le **funzionalità** di FITORA\n- Portarti nelle **sezioni** del sito con un click\n- Presentarti i **Personal Trainer**\n- Rispondere su **allenamento, nutrizione, GPS e community**\n\nProva a riformulare o scegli un argomento qui sotto!';
  }

  /* ══════════════════════════════════════════════════════
     OPEN / CLOSE
  ══════════════════════════════════════════════════════ */
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    const win = document.getElementById('cb-win');
    const btn = document.getElementById('cb-toggle');
    win.style.zIndex  = '99999';
    win.style.display = 'flex';
    void win.offsetHeight;
    win.classList.add('cb-open');
    btn.classList.add('cb-open');
    hideBadge();
    setTimeout(() => document.getElementById('cb-input')?.focus(), 320);
  }
  function closeChat() {
    if (!isOpen) return;
    isOpen = false;
    const win = document.getElementById('cb-win');
    const btn = document.getElementById('cb-toggle');
    win.classList.remove('cb-open');
    win.classList.add('cb-closing');
    btn.classList.remove('cb-open');
    setTimeout(() => { win.style.display = 'none'; win.classList.remove('cb-closing'); }, 250);
  }
  function hideBadge() {
    const b = document.getElementById('cb-badge');
    if (b) b.style.display = 'none';
  }
  function showBadge(n) {
    const b = document.getElementById('cb-badge');
    if (b) { b.textContent = n; b.style.display = 'flex'; }
  }

  /* ══════════════════════════════════════════════════════
     EXTRA STYLES
  ══════════════════════════════════════════════════════ */
  function injectExtraStyles() {
    if (document.getElementById('cb-extra-styles')) return;
    const style = document.createElement('style');
    style.id = 'cb-extra-styles';
    style.textContent = `
      .cb-rich { padding: 10px 12px !important; max-width: 96% !important; }

      /* PT Cards */
      .cb-pt-intro { font-size: 12px; color: #aaa; margin-bottom: 10px; }
      .cb-pt-card {
        display: flex; gap: 10px; align-items: flex-start;
        background: rgba(0,255,136,0.04); border: 1px solid rgba(0,255,136,0.12);
        border-radius: 12px; padding: 10px 11px; margin-bottom: 8px;
      }
      .cb-pt-card:last-child { margin-bottom: 0; }
      .cb-pt-photo {
        width: 54px; height: 54px; border-radius: 50%; object-fit: cover;
        border: 2px solid rgba(0,255,136,0.35); flex-shrink: 0;
      }
      .cb-pt-info { flex: 1; min-width: 0; }
      .cb-pt-name { font-size: 13px; font-weight: 700; color: #e8e8e8; }
      .cb-pt-role { font-size: 10.5px; color: #00e676; margin: 2px 0 4px; }
      .cb-pt-bio  { font-size: 11px; color: #aaa; line-height: 1.45; margin-bottom: 6px; }
      .cb-pt-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
      .cb-pt-tag {
        font-size: 9.5px; padding: 2px 7px; border-radius: 20px;
        background: rgba(0,230,118,0.09); border: 1px solid rgba(0,230,118,0.22); color: #00e676;
      }
      .cb-pt-wa {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11.5px; font-weight: 600; color: #25D366; text-decoration: none;
        background: rgba(37,211,102,0.1); border: 1px solid rgba(37,211,102,0.28);
        padding: 5px 10px; border-radius: 20px; transition: background 0.18s;
      }
      .cb-pt-wa:hover { background: rgba(37,211,102,0.2); }

      /* Nav cards */
      .cb-nav-intro { font-size: 12px; color: #aaa; margin-bottom: 9px; }
      .cb-nav-grid { display: flex; flex-direction: column; gap: 5px; }
      .cb-nav-item {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        border-radius: 9px; padding: 9px 11px;
        cursor: pointer; width: 100%; text-align: left; color: #d8e8d8;
        font-family: inherit; transition: background 0.15s, border-color 0.15s;
      }
      .cb-nav-item:hover { background: rgba(0,255,136,0.07); border-color: rgba(0,255,136,0.22); }
      .cb-nav-icon  { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
      .cb-nav-label { flex: 1; font-size: 12.5px; font-weight: 600; }
      .cb-nav-arrow { color: #00e676; font-size: 13px; }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════
     DRAGGABLE TOGGLE
  ══════════════════════════════════════════════════════ */
  function makeDraggable(el) {
    let isDragging = false;
    let moved = false;
    let startX, startY, initialRight, initialBottom;
    const dragThreshold = 5;
    const win = document.getElementById('cb-win');

    // Carica posizione salvata
    const saved = localStorage.getItem('fitora_cb_pos');
    if (saved) {
      const pos = JSON.parse(saved);
      el.style.right = pos.right;
      el.style.bottom = pos.bottom;
      if (win && window.innerWidth > 440) {
        win.style.right = pos.right;
        const bVal = parseInt(pos.bottom);
        if (!isNaN(bVal)) win.style.bottom = (bVal + 72) + 'px';
      }
    }

    const onStart = (e) => {
      isDragging = true;
      moved = false;
      const t = e.type === 'touchstart' ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
      const rect = el.getBoundingClientRect();
      initialRight = window.innerWidth - rect.right;
      initialBottom = window.innerHeight - rect.bottom;
      el.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const t = e.type === 'touchmove' ? e.touches[0] : e;
      const dx = startX - t.clientX;
      const dy = startY - t.clientY;

      if (!moved && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) moved = true;

      if (moved) {
        if (e.cancelable) e.preventDefault();
        let r = initialRight + dx;
        let b = initialBottom + dy;
        const p = 15;
        r = Math.max(p, Math.min(r, window.innerWidth - el.offsetWidth - p));
        b = Math.max(p, Math.min(b, window.innerHeight - el.offsetHeight - p));
        
        el.style.right = r + 'px';
        el.style.bottom = b + 'px';
        if (win && window.innerWidth > 440) {
          win.style.right = r + 'px';
          win.style.bottom = (b + 72) + 'px';
        }
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.transition = '';
      if (moved) {
        localStorage.setItem('fitora_cb_pos', JSON.stringify({ right: el.style.right, bottom: el.style.bottom }));
      }
    };

    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    // Blocca l'apertura se l'icona è stata trascinata
    el.addEventListener('click', (e) => {
      if (moved) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    buildDOM();
    injectExtraStyles();
    makeDraggable(document.getElementById('cb-toggle'));
    renderChips(CHIPS_DEFAULT);

    setTimeout(() => {
      const hasChattedBefore = localStorage.getItem('fitora_has_chatted');
      let msg = CFG.welcomeMessage;
      if (hasChattedBefore) {
        msg = 'Bentornato! 👋 Sono di nuovo qui per aiutarti con **FITORA**. Come posso esserti utile oggi?';
      } else {
        localStorage.setItem('fitora_has_chatted', 'true');
      }
      addMsg('bot', msg);
      if (!isOpen) showBadge(1);
    }, 900);

    document.getElementById('cb-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen ? closeChat() : openChat();
    });
    document.getElementById('cb-reset').addEventListener('click', (e) => {
      e.stopPropagation();
      if(confirm("Vuoi cancellare la cronologia della chat?")) {
        localStorage.removeItem('fitora_chat_history');
        location.reload();
      }
    });
    document.getElementById('cb-close').addEventListener('click', closeChat);
    document.getElementById('cb-send').addEventListener('click', (e) => {
      e.stopPropagation();
      const v = document.getElementById('cb-input')?.value;
      if (v?.trim()) send(v);
    });
    document.getElementById('cb-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = e.target.value; if (v.trim()) send(v); }
    });
    document.getElementById('cb-input').addEventListener('input', e => autoResize(e.target));
    document.addEventListener('click', e => {
      if (!isOpen) return;
      const win = document.getElementById('cb-win');
      const btn = document.getElementById('cb-toggle');
      
      // Se l'elemento cliccato è stato rimosso (come i chip) o è fuori dalla finestra, chiudi
      if (document.contains(e.target) && win && !win.contains(e.target) && !btn.contains(e.target)) {
        closeChat();
      }
    });
    loadChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();