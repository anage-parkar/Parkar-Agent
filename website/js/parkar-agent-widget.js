/* =============================================
   PARKAR.IN — Floating AI Assistant Widget
   js/parkar-agent-widget.js

   A self-contained chat widget that talks to the Parkar RAG Agent API.
   Loaded automatically on every page by js/components.js.

   API base URL resolution (first match wins):
     1. window.PARKAR_AGENT_API           (set before this script loads)
     2. <script ... data-api="http://...">  attribute on this tag
     3. http://localhost:8000              (local dev default)
   ============================================= */
(function () {
  'use strict';
  if (window.__parkarAgentLoaded) return;        // guard against double-injection
  window.__parkarAgentLoaded = true;

  /* ── Resolve API base ─────────────────────────────────── */
  var thisScript = document.currentScript;
  var API_BASE =
    window.PARKAR_AGENT_API ||
    (thisScript && thisScript.getAttribute('data-api')) ||
    'http://localhost:8000';
  API_BASE = API_BASE.replace(/\/$/, '');

  var ASSISTANT_NAME = 'Parkar Assistant';

  var SUGGESTIONS = [
    'What does Parkar do?',
    'Tell me about AIONIQ and Vector',
    'What is the leave policy?',
    'Which industries do you serve?'
  ];

  /* ── Icons ────────────────────────────────────────────── */
  var ICON_CHAT =
    '<svg class="pa-icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9H6V9h12v2zm-4 3H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
  var ICON_CLOSE =
    '<svg class="pa-icon-close" viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  var ICON_BOT =
    '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h3a3 3 0 0 1 3 3v2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-2a3 3 0 0 1 3-3h3V5.72A2 2 0 0 1 12 2zM9 13a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 9 13zm6 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  /* ── Build DOM ────────────────────────────────────────── */
  var launcher = document.createElement('button');
  launcher.className = 'pa-launcher';
  launcher.setAttribute('aria-label', 'Open ' + ASSISTANT_NAME);
  launcher.innerHTML = ICON_CHAT + ICON_CLOSE;

  var panel = document.createElement('div');
  panel.className = 'pa-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', ASSISTANT_NAME);
  panel.innerHTML =
    '<div class="pa-header">' +
      '<div class="pa-header-avatar">' + ICON_BOT + '</div>' +
      '<div class="pa-header-text">' +
        '<div class="pa-header-title">' + ASSISTANT_NAME + '</div>' +
        '<div class="pa-header-sub"><span class="pa-status-dot" id="paStatus"></span><span id="paStatusText">Online</span></div>' +
      '</div>' +
      '<button class="pa-header-close" aria-label="Close">&times;</button>' +
    '</div>' +
    '<div class="pa-messages" id="paMessages"></div>' +
    '<div class="pa-composer">' +
      '<textarea class="pa-input" id="paInput" rows="1" placeholder="Ask me about Parkar…" maxlength="2000"></textarea>' +
      '<button class="pa-send" id="paSend" aria-label="Send">' + ICON_SEND + '</button>' +
    '</div>' +
    '<div class="pa-footnote">AI assistant · may make mistakes · verify important info</div>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector('#paMessages');
  var inputEl = panel.querySelector('#paInput');
  var sendEl = panel.querySelector('#paSend');
  var statusDot = panel.querySelector('#paStatus');
  var statusText = panel.querySelector('#paStatusText');

  var busy = false;
  var greeted = false;

  /* ── Open / close ─────────────────────────────────────── */
  function togglePanel() {
    var open = panel.classList.toggle('pa-open');
    launcher.classList.toggle('pa-open', open);
    if (open) {
      if (!greeted) { greet(); greeted = true; checkHealth(); }
      setTimeout(function () { inputEl.focus(); }, 250);
    }
  }
  launcher.addEventListener('click', togglePanel);
  panel.querySelector('.pa-header-close').addEventListener('click', togglePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('pa-open')) togglePanel();
  });

  /* ── Health check (status dot) ────────────────────────── */
  function checkHealth() {
    fetch(API_BASE + '/health')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var ok = d && d.status === 'ok';
        statusDot.classList.toggle('pa-offline', !ok);
        statusText.textContent = ok ? 'Online' : 'Limited';
      })
      .catch(function () {
        statusDot.classList.add('pa-offline');
        statusText.textContent = 'Offline';
      });
  }

  /* ── Greeting + suggestions ───────────────────────────── */
  function greet() {
    addBot(
      "Hi! I'm the Parkar Assistant. Ask me about our platforms, solutions, " +
      'industries, careers, policies and more.'
    );
    var wrap = document.createElement('div');
    wrap.className = 'pa-suggestions';
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement('button');
      b.className = 'pa-suggestion';
      b.textContent = s;
      b.addEventListener('click', function () {
        if (busy) return;
        wrap.remove();
        send(s);
      });
      wrap.appendChild(b);
    });
    messagesEl.appendChild(wrap);
    scrollDown();
  }

  /* ── Message rendering ────────────────────────────────── */
  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'pa-msg pa-msg-user';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollDown();
  }

  function addBot(text) {
    var el = document.createElement('div');
    el.className = 'pa-msg pa-msg-bot';
    el.innerHTML = renderMarkdown(text);
    messagesEl.appendChild(el);
    scrollDown();
    return el;
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'pa-msg pa-msg-bot';
    el.innerHTML = '<div class="pa-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(el);
    scrollDown();
    return el;
  }

  function addSources(el, sources) {
    if (!sources || !sources.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'pa-sources';
    sources.slice(0, 4).forEach(function (s) {
      var chip = document.createElement('span');
      chip.className = 'pa-source-chip';
      chip.textContent = s.title || s.source;
      wrap.appendChild(chip);
    });
    el.appendChild(wrap);
    scrollDown();
  }

  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  /* Minimal, safe markdown: escape first, then add bold / bullets / links. */
  function renderMarkdown(text) {
    var html = String(text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(https?:\/\/[^\s<]+|parkar\.in\/[^\s<]+)/g, function (m) {
      var href = m.indexOf('http') === 0 ? m : 'https://' + m;
      return '<a href="' + href + '" target="_blank" rel="noopener">' + m + '</a>';
    });
    var lines = html.split('\n');
    var out = '', inList = false;
    lines.forEach(function (line) {
      var t = line.trim();
      if (/^[-*•]\s+/.test(t)) {
        if (!inList) { out += '<ul>'; inList = true; }
        out += '<li>' + t.replace(/^[-*•]\s+/, '') + '</li>';
      } else {
        if (inList) { out += '</ul>'; inList = false; }
        if (t) out += '<p>' + t + '</p>';
      }
    });
    if (inList) out += '</ul>';
    return out || '<p></p>';
  }

  /* ── Send / stream ────────────────────────────────────── */
  function setBusy(state) {
    busy = state;
    sendEl.disabled = state;
    inputEl.disabled = state;
  }

  function send(text) {
    text = (text || inputEl.value).trim();
    if (!text || busy) return;
    inputEl.value = '';
    autoGrow();
    addUser(text);
    setBusy(true);
    var typing = addTyping();
    streamAnswer(text, typing);
  }

  function streamAnswer(text, typingEl) {
    var sources = [];
    var answerEl = null;
    var acc = '';

    fetch(API_BASE + '/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
      .then(function (resp) {
        if (!resp.ok || !resp.body) throw new Error('No stream');
        var reader = resp.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';

        function pump() {
          return reader.read().then(function (res) {
            if (res.done) return finish();
            buffer += decoder.decode(res.value, { stream: true });
            var events = buffer.split('\n\n');
            buffer = events.pop();             // keep incomplete tail
            events.forEach(function (block) { handleEvent(block); });
            return pump();
          });
        }

        function handleEvent(block) {
          var ev = 'message', data = '';
          block.split('\n').forEach(function (l) {
            if (l.indexOf('event:') === 0) ev = l.slice(6).trim();
            else if (l.indexOf('data:') === 0) data += l.slice(5).trim();
          });
          if (!data) return;
          var parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }

          if (ev === 'sources') {
            sources = parsed || [];
          } else if (ev === 'token') {
            if (!answerEl) { typingEl.remove(); answerEl = addBot(''); }
            acc += parsed;
            answerEl.innerHTML = renderMarkdown(acc);
            scrollDown();
          } else if (ev === 'error') {
            if (!answerEl) { typingEl.remove(); answerEl = addBot(''); }
            acc += '\n\n_(There was a problem generating the full answer.)_';
            answerEl.innerHTML = renderMarkdown(acc);
          }
        }

        function finish() {
          if (!answerEl) { typingEl.remove(); answerEl = addBot(acc || '…'); }
          addSources(answerEl, sources);
          setBusy(false);
        }

        return pump();
      })
      .catch(function () {
        // Fallback to the non-streaming endpoint.
        fetch(API_BASE + '/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            typingEl.remove();
            var el = addBot(d.answer || 'Sorry, I could not answer that.');
            addSources(el, d.sources);
          })
          .catch(function () {
            typingEl.remove();
            addBot(
              "I can't reach the assistant service right now. Please make sure " +
              'the Parkar Agent API is running, or try again shortly.'
            );
          })
          .finally(function () { setBusy(false); });
      });
  }

  /* ── Input behaviour ──────────────────────────────────── */
  function autoGrow() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 96) + 'px';
  }
  inputEl.addEventListener('input', autoGrow);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendEl.addEventListener('click', function () { send(); });
})();
