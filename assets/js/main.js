/* ==========================================================================
   Abdan Zam Zam Ramadhan — portfolio interactions
   Terminal typing · scroll reveal · header state · mobile nav
   Vanilla JS, no dependencies. Reduced-motion safe.
   ========================================================================== */

(function () {
  'use strict';

  // Gate CSS-hidden states (reveal + terminal) behind JS being active.
  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Header scroll state
     ---------------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------------
     Mobile nav toggle
     ---------------------------------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('site-nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navList.classList.toggle('is-open', !open);
    });

    // Close the panel when a link is chosen (mobile)
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
        navToggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     Terminal typing effect
     Orchestrated sequence: type each command, then reveal its output.
     ---------------------------------------------------------------------- */
  const terminal = document.getElementById('terminal');

  function runTerminal() {
    if (!terminal) return;

    const typingLines = Array.from(terminal.querySelectorAll('[data-typing]'));
    const revealables = Array.from(terminal.querySelectorAll('[data-reveal-after]'));

    // Progressive enhancement: if anything fails, show everything.
    const showAll = () => {
      typingLines.forEach((l) => l.classList.remove('term-line--hidden'));
      revealables.forEach((el) => el.classList.remove('term-out--hidden'));
    };

    if (reduceMotion) { showAll(); return; }

    const TYPE_MS = 32;
    const PAUSE_MS = 260;

    // Hide outputs & command lines before starting.
    typingLines.forEach((l) => l.classList.add('term-line--hidden'));
    revealables.forEach((el) => el.classList.add('term-out--hidden'));

    const cursorLine = terminal.querySelector('[data-cursor-line]');
    const cursor = document.createElement('span');
    cursor.className = 'term-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    // One reusable blinking cursor, moved between command lines as they type,
    // ending on its own dedicated line.
    let cursorHost = cursorLine;
    const placeCursor = (host) => {
      if (cursorHost && cursorHost !== host && cursorHost.contains(cursor)) {
        cursorHost.removeChild(cursor);
      }
      cursorHost = host;
      if (host) {
        // Remove the static no-JS fallback cursor so it never duplicates.
        host.querySelectorAll(':scope > .term-cursor').forEach((c) => {
          if (c !== cursor) c.remove();
        });
        host.appendChild(cursor);
      }
    };

    let revealIndex = 0;

    function revealNextOutput() {
      if (revealIndex < revealables.length) {
        const el = revealables[revealIndex];
        el.classList.remove('term-out--hidden');
        revealIndex += 1;
        window.setTimeout(revealNextOutput, PAUSE_MS);
      } else if (cursorLine) {
        cursorLine.classList.remove('term-line--hidden');
        placeCursor(cursorLine);
      }
    }

    function typeLine(line, done) {
      const cmdEl = line.querySelector('[data-typed-text]');
      if (!cmdEl) { done(); return; }

      const full = cmdEl.textContent || '';
      cmdEl.textContent = '';
      placeCursor(line);

      let i = 0;
      const step = () => {
        if (i <= full.length) {
          cmdEl.textContent = full.slice(0, i);
          i += 1;
          window.setTimeout(step, TYPE_MS);
        } else {
          done();
        }
      };
      step();
    }

    let idx = 0;
    function nextLine() {
      if (idx < typingLines.length) {
        const line = typingLines[idx];
        line.classList.remove('term-line--hidden');
        typeLine(line, () => {
          idx += 1;
          window.setTimeout(nextLine, PAUSE_MS);
        });
      } else {
        revealNextOutput();
      }
    }

    window.setTimeout(nextLine, 350);
  }

  runTerminal();

  /* ----------------------------------------------------------------------
     Scroll reveal — IntersectionObserver
     ---------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }
})();
