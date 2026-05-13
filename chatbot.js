/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  FITORA CHATBOT WIDGET  —  chatbot.js               ║
 * ║  Integrazione: <script src="chatbot.js"></script>   ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * CONFIGURAZIONE (opzionale, prima di questo <script>):
 *
 *   <script>
 *     window.ChatbotConfig = {
 *       siteName:         'Il Mio Sito',
 *       botName:          'Assistente Nome',
 *       apiKey:           'sk-ant-...',    // ⚠ Solo per test – usa proxyUrl in produzione
 *       proxyUrl:         '/api/chat',     // Raccomandato (nasconde la chiave)
 *       systemPrompt:     'Sei l\'assistente di ...',
 *       welcomeMessage:   'Ciao! Come posso aiutarti?',
 *       quickSuggestions: ['Domanda 1', 'Domanda 2'],
 *     };
 *   </script>
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONFIG — personalizza qui o tramite window.ChatbotConfig
  ══════════════════════════════════════════════════════ */
  const CFG = Object.assign({
    siteName:         'FITORA',
    botName:          'Assistente FITORA',
    botAvatar:        '⚡',

    /* API — imposta UNO dei due: */
    apiKey:    '',
    proxyUrl:  '',

    model:     'claude-sonnet-4-6',
    maxTokens: 512,

    systemPrompt: `Sei l'assistente virtuale di FITORA, un'app fitness potenziata dall'intelligenza artificiale.`,

    welcomeMessage:   'Ciao! 👋 Sono l\'assistente di **FITORA**. Posso aiutarti con domande sull\'app, i piani di allenamento, i nostri Personal Trainer e molto altro. Come posso aiutarti oggi?',
    quickSuggestions: ['Come funziona?', 'Personal Trainer', 'Dove trovo...', 'PT per allenarsi'],

    cssFile: null,
  }, window.ChatbotConfig || {});

  /* ══════════════════════════════════════════════════════
     DATI PERSONAL TRAINER
  ══════════════════════════════════════════════════════ */
  const PT_DATA = [
    {
      name:       'Marco Ferretti',
      role:       'Strength & Conditioning',
      emoji:      '💪',
      // Sostituisci con URL reale dell'immagine
      photo:      'https://i.pravatar.cc/80?img=11',
      phone:      '3901234567',
      bio:        'Specializzato in forza funzionale e bodybuilding. 8 anni di esperienza, certificato CSEN.',
      tags:       ['Forza', 'Ipertrofia', 'Postura'],
    },
    {
      name:       'Laura Conti',
      role:       'Cardio & Wellness',
      emoji:      '🏃‍♀️',
      // Sostituisci con URL reale dell'immagine
      photo:      'https://i.pravatar.cc/80?img=47',
      phone:      '3917654321',
      bio:        'Coach di running, yoga e nutrizione sportiva. 6 anni di esperienza, laurea in Scienze Motorie.',
      tags:       ['Cardio', 'Yoga', 'Dimagrimento'],
    },
  ];

  /* ══════════════════════════════════════════════════════
     INJECT CSS automaticamente
  ══════════════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('cb-styles')) return;
    const script = document.currentScript || document.querySelector('script[src*="chatbot"]');
    const base   = script ? script.src.replace(/chatbot\.js[^/]*$/, '') : '';
    const href   = CFG.cssFile || (base + 'chatbot.css');
    const link   = document.createElement('link');
    link.id      = 'cb-styles';
    link.rel     = 'stylesheet';
    link.href    = href;
    document.head.appendChild(link);
  })();

  /* ══════════════════════════════════════════════════════
     STATO
  ══════════════════════════════════════════════════════ */
  let isOpen  = false;
  let isBusy  = false;
  let history = [];


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
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/`([^`]+)`/g,     '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function waLink(phone) {
    const num = phone.replace(/\D/g, '');
    return `https://wa.me/39${num}`;
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
          <div class="cb-header-status">
            <span class="cb-dot"></span>Online ora
          </div>
        </div>
        <button class="cb-close" id="cb-close" aria-label="Chiudi">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="cb-msgs" id="cb-msgs"></div>
      <div class="cb-bottom">
        <div class="cb-chips" id="cb-chips"></div>
        <div class="cb-input-row">
          <textarea
            class="cb-input" id="cb-input"
            placeholder="Scrivi un messaggio…"
            rows="1"
            aria-label="Messaggio"
          ></textarea>
          <button class="cb-send" id="cb-send" aria-label="Invia messaggio">
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
     CHIPS / SUGGERIMENTI RAPIDI
  ══════════════════════════════════════════════════════ */
  function renderChips() {
    const container = document.getElementById('cb-chips');
    if (!container) return;
    container.innerHTML = '';
    if (history.length > 0) return;
    CFG.quickSuggestions.forEach(text => {
      const chip = el('button', { className: 'cb-chip' }, escapeHTML(text));
      chip.addEventListener('click', () => send(text));
      container.appendChild(chip);
    });
  }


  /* ══════════════════════════════════════════════════════
     MESSAGGI
  ══════════════════════════════════════════════════════ */
  function addMsg(role, text, isError) {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs) return;
    const row = el('div', { className: `cb-msg cb-msg-${role}` });
    if (role === 'bot') {
      const bubbleClass = 'cb-bubble cb-bubble-bot' + (isError ? ' cb-err-bubble' : '');
      row.innerHTML = `
        <div class="cb-msg-av">${CFG.botAvatar}</div>
        <div class="${bubbleClass}">${md(text)}</div>
      `;
    } else {
      row.innerHTML = `<div class="cb-bubble cb-bubble-user">${md(text)}</div>`;
    }
    msgs.appendChild(row);
    scrollBottom();
    renderChips();
  }

  /** Inserisce un messaggio con HTML personalizzato (card PT, mappa sezioni, ecc.) */
  function addRichMsg(htmlContent) {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs) return;
    const row = el('div', { className: 'cb-msg cb-msg-bot' });
    row.innerHTML = `
      <div class="cb-msg-av">${CFG.botAvatar}</div>
      <div class="cb-bubble cb-bubble-bot cb-rich">${htmlContent}</div>
    `;
    msgs.appendChild(row);
    scrollBottom();
    renderChips();
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

  function removeTyping() {
    document.getElementById('cb-typing')?.remove();
  }

  function scrollBottom() {
    const msgs = document.getElementById('cb-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }


  /* ══════════════════════════════════════════════════════
     CARD PERSONAL TRAINER
  ══════════════════════════════════════════════════════ */
  function buildPTCards() {
    const cards = PT_DATA.map(pt => `
      <div class="cb-pt-card">
        <img class="cb-pt-photo" src="${pt.photo}" alt="Foto ${escapeHTML(pt.name)}" onerror="this.style.display='none'">
        <div class="cb-pt-info">
          <div class="cb-pt-name">${escapeHTML(pt.name)}</div>
          <div class="cb-pt-role">${escapeHTML(pt.role)}</div>
          <div class="cb-pt-bio">${escapeHTML(pt.bio)}</div>
          <div class="cb-pt-tags">${pt.tags.map(t=>`<span class="cb-pt-tag">${escapeHTML(t)}</span>`).join('')}</div>
          <a class="cb-pt-wa" href="${waLink(pt.phone)}" target="_blank" rel="noopener">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.143.564 4.148 1.546 5.877L0 24l6.293-1.526A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.87 9.87 0 0 1-5.042-1.382l-.361-.214-3.741.981.999-3.648-.235-.374A9.87 9.87 0 0 1 2.118 12C2.118 6.539 6.539 2.118 12 2.118S21.882 6.539 21.882 12 17.461 21.882 12 21.882z"/>
            </svg>
            Scrivi a ${escapeHTML(pt.name.split(' ')[0])} su WhatsApp
          </a>
        </div>
      </div>
    `).join('');
    return `<div class="cb-pt-intro">👥 Ecco i nostri <strong>Personal Trainer</strong> disponibili in palestra:</div>${cards}`;
  }


  /* ══════════════════════════════════════════════════════
     MAPPA SEZIONI SITO
  ══════════════════════════════════════════════════════ */
  function buildSiteMap(section) {
    const sections = {
      home:          { icon: '🏠', label: 'Home',           url: '/',                desc: 'Pagina principale con panoramica di FITORA' },
      allenamenti:   { icon: '🏋️', label: 'Allenamenti',   url: '/allenamenti',     desc: 'Libreria esercizi e piani personalizzati' },
      nutrizione:    { icon: '🥗', label: 'Nutrizione',     url: '/nutrizione',      desc: 'Piani alimentari e calcolo calorie' },
      progress:      { icon: '📈', label: 'Progressi',      url: '/progressi',       desc: 'Dashboard per monitorare i tuoi risultati' },
      community:     { icon: '👥', label: 'Community',      url: '/community',       desc: 'Sfide, amici e classifiche' },
      profilo:       { icon: '👤', label: 'Profilo',        url: '/profilo',         desc: 'Gestione account e impostazioni' },
      registrazione: { icon: '✍️', label: 'Registrati',    url: '/registrati',      desc: 'Crea il tuo account FITORA gratuitamente' },
      contatti:      { icon: '📞', label: 'Contatti',       url: '/contatti',        desc: 'Supporto e assistenza clienti' },
      pt:            { icon: '🏃', label: 'Personal Trainer', url: '/personal-trainer', desc: 'Trova il tuo coach in palestra' },
    };

    // Se richiesta sezione specifica, mostra solo quella
    if (section && sections[section]) {
      const s = sections[section];
      return `${s.icon} Puoi trovare <strong>${s.label}</strong> qui: <a class="cb-link" href="${s.url}" target="_blank">${s.url}</a><br><small style="color:#888">${s.desc}</small>`;
    }

    // Altrimenti mostra tutte
    const items = Object.values(sections).map(s =>
      `<a class="cb-section-item" href="${s.url}" target="_blank">
        <span class="cb-section-icon">${s.icon}</span>
        <span>
          <strong>${s.label}</strong>
          <small>${s.desc}</small>
        </span>
      </a>`
    ).join('');
    return `<div style="margin-bottom:8px">📍 Ecco dove trovare tutto su FITORA:</div><div class="cb-sections">${items}</div>`;
  }


  /* ══════════════════════════════════════════════════════
     INVIA MESSAGGIO
  ══════════════════════════════════════════════════════ */
  async function send(text) {
    text = text.trim();
    if (!text || isBusy) return;

    addMsg('user', text);
    history.push({ role: 'user', content: text });

    const input = document.getElementById('cb-input');
    if (input) { input.value = ''; autoResize(input); }

    setBusy(true);
    showTyping();

    try {
      const result = await generateInternalResponse(text);
      removeTyping();
      history.push({ role: 'assistant', content: typeof result === 'string' ? result : '[rich]' });
      if (result && result.__rich) {
        addRichMsg(result.html);
      } else {
        addMsg('bot', result);
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', '⚠️ Si è verificato un errore. Riprova tra poco.', true);
      console.error('[FITORA Chatbot]', err);
    } finally {
      setBusy(false);
    }
  }

  function setBusy(busy) {
    isBusy = busy;
    const sendBtn = document.getElementById('cb-send');
    const inp     = document.getElementById('cb-input');
    if (sendBtn) sendBtn.disabled = busy;
    if (inp)     inp.disabled     = busy;
  }

  function rich(html) { return { __rich: true, html }; }


  /* ══════════════════════════════════════════════════════
     LOGICA CHATBOT
  ══════════════════════════════════════════════════════ */
  async function generateInternalResponse(userMessage) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 700 + 350));
    const msg = userMessage.toLowerCase();

    /* ── Saluti ── */
    if (/\b(ciao|salve|hey|buongiorno|buonasera)\b/.test(msg)) {
      return 'Ciao! 👋 Sono l\'assistente di FITORA. Puoi chiedermi come funziona l\'app, dove trovare le varie sezioni del sito, conoscere i nostri Personal Trainer e molto altro!';
    }

    /* ── Chi sei ── */
    if (/chi sei|cosa fai|come ti chiami/.test(msg)) {
      return 'Sono l\'assistente virtuale di **FITORA** 🤖 Posso aiutarti a navigare il sito, rispondere a domande sull\'app, metterti in contatto con i Personal Trainer e supportarti nel tuo percorso fitness!';
    }

    /* ══════════════════════════
       PERSONAL TRAINER
    ══════════════════════════ */
    if (/personal trainer|pt\b|coach|allenatore|preparatore|palestra|trainer/.test(msg)) {
      return rich(buildPTCards());
    }

    /* ══════════════════════════
       NAVIGAZIONE SITO
    ══════════════════════════ */
    if (/dove trovo|dove si trova|dove posso trovare|come arrivo a|come vado su|pagina|sezione/.test(msg)) {
      // Sezioni specifiche
      if (/allename|workout|eserciz/.test(msg))          return rich(buildSiteMap('allenamenti'));
      if (/nutrizi|diet|calorie|aliment/.test(msg))      return rich(buildSiteMap('nutrizione'));
      if (/progress|risultat|statistic/.test(msg))       return rich(buildSiteMap('progress'));
      if (/community|amici|sfid|classifica/.test(msg))   return rich(buildSiteMap('community'));
      if (/profil|account|impostazion/.test(msg))        return rich(buildSiteMap('profilo'));
      if (/registr|iscri|sign up|sign-up/.test(msg))     return rich(buildSiteMap('registrazione'));
      if (/contat|support|aiuto|assistenz/.test(msg))    return rich(buildSiteMap('contatti'));
      if (/home|inizio|principale/.test(msg))            return rich(buildSiteMap('home'));
      // Mappa completa
      return rich(buildSiteMap());
    }

    /* ── Mappa completa esplicita ── */
    if (/mappa|tutte le pagine|tutto il sito|menu|nav/.test(msg)) {
      return rich(buildSiteMap());
    }

    /* ══════════════════════════
       FUNZIONALITÀ FITORA
    ══════════════════════════ */
    if (/come funziona|funzionalit|cosa offre|cosa fa fitora/.test(msg)) {
      return 'FITORA è un\'app fitness all-in-one: crea **piani di allenamento personalizzati** tramite AI, corregge la **postura in tempo reale** con Computer Vision, gestisce la **nutrizione** e ti connette con la **community**. Tutto adattato ai tuoi obiettivi e al tuo stato fisico giornaliero.';
    }

    if (/allename|workout|eserciz|scheda/.test(msg)) {
      return 'I piani di allenamento di FITORA sono generati dall\'AI in base ai tuoi parametri fisici, obiettivi e disponibilità. Si adattano automaticamente giorno per giorno, correggendo anche la postura tramite la fotocamera 📱\n\nVuoi che ti mostri dove trovare gli allenamenti sul sito?';
    }

    if (/nutrizi|calorie|macros|dieta|alimentaz|cibo|mangio/.test(msg)) {
      return 'Il modulo nutrizione di FITORA calcola il tuo **fabbisogno calorico** e la suddivisione in macronutrienti (proteine, carboidrati, grassi) in base ai tuoi obiettivi. Puoi loggare i pasti, scansionare i codici a barre e ricevere suggerimenti personalizzati 🥗';
    }

    if (/computer vision|telecamera|fotocamera|postura|ripetizioni|rep\b/.test(msg)) {
      return 'La funzione **Computer Vision** usa la fotocamera del tuo smartphone per analizzare i movimenti in tempo reale: corregge la postura, conta le ripetizioni automaticamente e ti avvisa se rischi un infortunio 🎯 È sufficiente posizionare il telefono di fronte a te durante l\'allenamento.';
    }

    if (/community|amici|sfid|classifica|social|gruppo/.test(msg)) {
      return 'Nella **Community FITORA** puoi connetterti con altri atleti, partecipare a sfide settimanali, condividere i tuoi progressi e scalare le classifiche. Allenarsi insieme motiva molto di più! 🏆';
    }

    if (/progress|risultat|statistic|grafico|dashboard/.test(msg)) {
      return 'La sezione **Progressi** ti mostra grafici dettagliati su peso, misure corporee, performance degli esercizi e calorie nel tempo. Puoi impostare obiettivi e ricevere notifiche quando li raggiungi 📈';
    }

    if (/registr|iscri|account|creare un account|sign up/.test(msg)) {
      return rich(buildSiteMap('registrazione'));
    }

    if (/login|accedi|entrare|password|accesso/.test(msg)) {
      return 'Per accedere al tuo account FITORA, vai su **/login** dal menu in alto. Se hai dimenticato la password, puoi resettarla tramite email dalla stessa pagina 🔐';
    }

    if (/notifich|reminder|avvisi/.test(msg)) {
      return 'FITORA ti invia **notifiche intelligenti** per ricordarti gli allenamenti, aggiornare i progressi e motivarti con messaggi personalizzati. Puoi gestire le preferenze nella sezione Profilo > Notifiche 🔔';
    }

    if (/infortun|dolore|fisioterapia|medico|recupero/.test(msg)) {
      return 'FITORA monitora il tuo carico di lavoro e ti avvisa quando stai rischiando il sovrallenamento. In caso di dolori o infortuni, ti consigliamo di consultare un medico o fisioterapista prima di riprendere. La nostra tecnologia Computer Vision aiuta a prevenire posture scorrette ⚠️';
    }

    if (/app mobile|scaricare|download|android|ios|iphone/.test(msg)) {
      return 'L\'app FITORA è disponibile su **App Store** (iOS) e **Google Play** (Android). Scaricala gratuitamente e inizia il tuo percorso! Tutte le funzionalità premium si attivano con l\'abbonamento 📲';
    }

    if (/wearable|smartwatch|apple watch|garmin|fitbit/.test(msg)) {
      return 'FITORA si integra con i principali dispositivi wearable: **Apple Watch**, **Garmin** e altri tracker fitness. I dati si sincronizzano automaticamente per un\'analisi ancora più precisa ⌚';
    }

    if (/supporto|contatt|aiuto|assistenza|email|telefono/.test(msg)) {
      return rich(buildSiteMap('contatti'));
    }

    if (/grazie|perfetto|ottimo|bravo|bene/.test(msg)) {
      return 'Prego! 😊 Sono qui se hai altre domande su FITORA. Buon allenamento! 💪';
    }

    /* ── Off-topic ── */
    if (/politic|notizie|calcio|sport\b|matematica|storia|meteo|medicina|covid|guerra|film|musica/.test(msg)) {
      return 'Mi dispiace, posso aiutarti solo con argomenti inerenti a **FITORA** e al fitness 🏋️ Hai domande sull\'app, sui nostri servizi o sui Personal Trainer?';
    }

    /* ── Fallback ── */
    return 'Non ho capito bene la domanda 🤔 Posso aiutarti con:\n- **Funzionalità** dell\'app FITORA\n- **Dove trovare** le sezioni del sito\n- **Personal Trainer** disponibili\n- **Prezzi** e abbonamenti\n\nCome posso aiutarti?';
  }


  /* ══════════════════════════════════════════════════════
     APRI / CHIUDI
  ══════════════════════════════════════════════════════ */
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    const win = document.getElementById('cb-win');
    const btn = document.getElementById('cb-toggle');
    win.style.zIndex = '99999';
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
    setTimeout(() => {
      win.style.display = 'none';
      win.classList.remove('cb-closing');
    }, 250);
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
     INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    buildDOM();
    injectExtraStyles();
    renderChips();

    setTimeout(() => {
      addMsg('bot', CFG.welcomeMessage);
      if (!isOpen) showBadge(1);
    }, 900);

    document.getElementById('cb-toggle').addEventListener('click', () => {
      isOpen ? closeChat() : openChat();
    });
    document.getElementById('cb-close').addEventListener('click', closeChat);
    document.getElementById('cb-send').addEventListener('click', () => {
      const v = document.getElementById('cb-input')?.value;
      if (v?.trim()) send(v);
    });
    document.getElementById('cb-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = e.target.value;
        if (v.trim()) send(v);
      }
    });
    document.getElementById('cb-input').addEventListener('input', e => {
      autoResize(e.target);
    });
    document.addEventListener('click', e => {
      if (!isOpen) return;
      const win = document.getElementById('cb-win');
      const btn = document.getElementById('cb-toggle');
      if (win && !win.contains(e.target) && !btn.contains(e.target)) closeChat();
    });
  }


  /* ══════════════════════════════════════════════════════
     STILI AGGIUNTIVI (PT card, sezioni sito, link)
     Iniettati via <style> per non richiedere modifiche al CSS
  ══════════════════════════════════════════════════════ */
  function injectExtraStyles() {
    if (document.getElementById('cb-extra-styles')) return;
    const style = document.createElement('style');
    style.id = 'cb-extra-styles';
    style.textContent = `
      /* Rich bubble */
      .cb-rich { padding: 10px 12px !important; max-width: 92% !important; }

      /* PT Cards */
      .cb-pt-intro { font-size: 12.5px; color: #aaa; margin-bottom: 10px; }
      .cb-pt-card {
        display: flex; gap: 10px; align-items: flex-start;
        background: rgba(0,255,136,0.04);
        border: 1px solid rgba(0,255,136,0.12);
        border-radius: 12px;
        padding: 10px;
        margin-bottom: 8px;
      }
      .cb-pt-card:last-child { margin-bottom: 0; }
      .cb-pt-photo {
        width: 52px; height: 52px; border-radius: 50%; object-fit: cover;
        border: 2px solid rgba(0,255,136,0.3); flex-shrink: 0;
      }
      .cb-pt-info { flex: 1; min-width: 0; }
      .cb-pt-name { font-size: 13px; font-weight: 700; color: #e8e8e8; }
      .cb-pt-role { font-size: 11px; color: #00e676; margin: 1px 0 4px; }
      .cb-pt-bio  { font-size: 11.5px; color: #aaa; line-height: 1.45; margin-bottom: 5px; }
      .cb-pt-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 7px; }
      .cb-pt-tag {
        font-size: 10px; padding: 2px 7px; border-radius: 20px;
        background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.25); color: #00e676;
      }
      .cb-pt-wa {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11.5px; font-weight: 600;
        color: #25D366; text-decoration: none;
        background: rgba(37,211,102,0.1); border: 1px solid rgba(37,211,102,0.3);
        padding: 5px 10px; border-radius: 20px;
        transition: background 0.18s, border-color 0.18s;
      }
      .cb-pt-wa:hover {
        background: rgba(37,211,102,0.2); border-color: rgba(37,211,102,0.5);
      }

      /* Site sections map */
      .cb-sections { display: flex; flex-direction: column; gap: 5px; }
      .cb-section-item {
        display: flex; align-items: center; gap: 9px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 9px; padding: 7px 10px;
        text-decoration: none; color: #d8e8d8;
        transition: background 0.18s, border-color 0.18s;
      }
      .cb-section-item:hover {
        background: rgba(0,255,136,0.07); border-color: rgba(0,255,136,0.2);
      }
      .cb-section-item span:last-child { display: flex; flex-direction: column; }
      .cb-section-item strong { font-size: 12.5px; color: #e8e8e8; }
      .cb-section-item small  { font-size: 10.5px; color: #666; margin-top: 1px; }
      .cb-section-icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }

      /* Generic link */
      .cb-link {
        color: #00e676; text-decoration: underline;
        text-underline-offset: 2px;
      }
      .cb-link:hover { color: #00ff88; }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();