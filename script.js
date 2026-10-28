/* DFIR project page — vanilla JS, no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      setNav(false);
      toggle.focus();
    }
  });

  /* ---------- Active nav link + reveal on scroll ---------- */
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    if (!reduceMotion) {
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            revealObs.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      reveals.forEach(function (el) { revealObs.observe(el); });
    }

    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navAnchors.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navAnchors.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) sectionObs.observe(s);
    });
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Missing images → captioned placeholder ---------- */
  function toPlaceholder(img) {
    var btn = img.closest('.shot-btn');
    if (!btn || btn.dataset.missing) return;
    btn.dataset.missing = '1';
    var src = img.getAttribute('src');
    var ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', 'Screenshot not yet available: ' + img.alt);
    ph.innerHTML = '<div><strong>Screenshot pending</strong><br>Add <code></code></div>';
    ph.querySelector('code').textContent = src;
    btn.replaceWith(ph);
  }
  document.querySelectorAll('.shot-btn img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) {
      toPlaceholder(img);
    } else {
      img.addEventListener('error', function () { toPlaceholder(img); });
    }
  });

  /* ---------- Lightbox (native <dialog>: focus trap + Esc built in) ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbCap = document.getElementById('lightbox-cap');
  var lastTrigger = null;

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.shot-btn');
    if (!btn) return;
    var img = btn.querySelector('img');
    var cap = btn.closest('figure').querySelector('figcaption');
    lastTrigger = btn;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
    if (typeof lb.showModal === 'function') {
      lb.showModal();
      document.body.classList.add('no-scroll');
      lb.querySelector('.lightbox-close').focus();
    } else {
      window.open(lbImg.src, '_blank', 'noopener');
    }
  });
  lb.querySelector('.lightbox-close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) {
    // click on backdrop (the dialog box itself, outside the figure) closes
    if (e.target === lb) lb.close();
  });
  lb.addEventListener('close', function () {
    document.body.classList.remove('no-scroll');
    lbImg.removeAttribute('src');
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  });

  /* ---------- Coverage matrix tooltips ---------- */
  var tip = document.getElementById('matrix-tip');
  var chips = document.querySelectorAll('#matrix button.chip');
  var activeChip = null;
  var cols = Array.prototype.map.call(
    document.querySelectorAll('#matrix thead th'),
    function (th) { return th.firstChild.textContent.trim(); }
  );

  function showTip(chip) {
    if (activeChip && activeChip !== chip) activeChip.classList.remove('is-active');
    activeChip = chip;
    chip.classList.add('is-active');

    var cell = chip.closest('td');
    var row = chip.closest('tr');
    var tid = row.querySelector('th .mono').textContent;
    var col = cols[cell.cellIndex] || '';

    tip.innerHTML = '<span class="tooltip-head"></span><span class="tooltip-body"></span>';
    tip.querySelector('.tooltip-head').textContent = tid + ' · ' + col;
    tip.querySelector('.tooltip-body').textContent = chip.getAttribute('data-tip');
    tip.hidden = false;
    chip.setAttribute('aria-describedby', 'matrix-tip');

    // Position relative to the document, flip below if no room above
    var r = chip.getBoundingClientRect();
    var t = tip.getBoundingClientRect();
    var margin = 12;
    var left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - t.width - margin));
    var side = r.top - t.height - 12 > margin ? 'top' : 'bottom';
    var top = side === 'top' ? r.top - t.height - 10 : r.bottom + 10;
    var host = tip.offsetParent || document.body;
    var hr = host.getBoundingClientRect();
    tip.style.left = (left - hr.left) + 'px';
    tip.style.top = (top - hr.top) + 'px';
    tip.dataset.side = side;
    tip.style.setProperty('--arrow-x', (r.left + r.width / 2 - left) + 'px');
  }
  function hideTip() {
    if (activeChip) {
      activeChip.classList.remove('is-active');
      activeChip.removeAttribute('aria-describedby');
    }
    activeChip = null;
    tip.hidden = true;
  }

  // Tooltip is positioned within the coverage section
  tip.parentElement.style.position = 'relative';

  chips.forEach(function (chip) {
    chip.addEventListener('mouseenter', function () { showTip(chip); });
    chip.addEventListener('mouseleave', function () { if (document.activeElement !== chip) hideTip(); });
    chip.addEventListener('focus', function () { showTip(chip); });
    chip.addEventListener('blur', hideTip);
    chip.addEventListener('click', function () {
      // tap toggles on touch devices
      if (activeChip === chip && !tip.hidden && document.activeElement !== chip) hideTip();
      else showTip(chip);
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !tip.hidden) hideTip(); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#matrix button.chip')) hideTip(); });
  window.addEventListener('resize', hideTip);
  var matrixWrap = document.querySelector('#matrix').closest('.table-wrap');
  matrixWrap.addEventListener('scroll', hideTip, { passive: true });

  /* ---------- Tabs (WAI-ARIA pattern, manual activation by click/arrows) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  if (tabs.length) selectTab(tabs[0], false);
})();
