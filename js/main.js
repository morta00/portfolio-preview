(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  applySiteUrl();

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const hash = href.slice(href.indexOf('#'));
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      const samePage = !href.includes('.html') || href.startsWith('#') || href.startsWith(location.pathname);
      if (!samePage && !href.startsWith('#')) return;
      if (anchor.pathname && anchor.pathname !== location.pathname) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  initHeroMedia();
  initProjectMedia();
  initResumeLinks();
  initEmailButtons();
  initCounts();
  initBars();
  initFilters();
  initOpportunity();
  initNavSpy();
  initSkillTabs();
  initExperienceReveal();
})();

function initNavSpy() {
  const header = document.querySelector('.nav');
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const items = links
    .map((link) => ({ link, el: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.el);
  const mark = () => {
    let current = null;
    const activationLine = Math.min(window.innerHeight * 0.38, 300);
    items.forEach((item) => {
      if (item.el.getBoundingClientRect().top < activationLine) current = item;
    });
    links.forEach((link) => link.classList.toggle('is-current', current && link === current.link));
  };
  const band = document.getElementById('research');
  const syncNavTone = () => {
    if (!band || !header) return;
    const rect = band.getBoundingClientRect();
    const navH = header.offsetHeight;
    header.classList.toggle('is-research', rect.top <= navH + 1 && rect.bottom > navH + 12);
  };
  mark();
  syncNavTone();
  window.addEventListener('scroll', () => { mark(); syncNavTone(); }, { passive: true });
}


function initExperienceReveal() {
  const section = document.querySelector('.clean-experience');
  const cards = [...document.querySelectorAll('.experience-card')];
  if (!section || !cards.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }
  section.classList.add('has-motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  cards.forEach((card, index) => {
    card.style.setProperty('--experience-order', String(index));
    observer.observe(card);
  });
}

function initOpportunity() {
  const el = document.querySelector('[data-opportunity]');
  if (!el || !window.SITE || !window.SITE.showOpportunityStatus) return;
  el.hidden = false;
}

function initFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  const work = document.getElementById('work');
  const items = work ? work.querySelectorAll('[data-focus]') : document.querySelectorAll('[data-focus]');
  if (!buttons.length) return;
    buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.filter;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      items.forEach((item) => {
        const tags = (item.dataset.focus || '').split(/\s+/);
        item.classList.toggle('is-hidden', key !== 'all' && !tags.includes(key));
      });
      const more = document.getElementById('more-projects');
      if (more) {
        const cards = document.querySelectorAll('.clean-more-card, .cards .card');
        const any = [...cards].some((card) => !card.classList.contains('is-hidden'));
        more.classList.toggle('is-hidden', !any);
      }
    });
  });
}

function depthPrefix() {
  return location.pathname.includes('/work/') ? '../' : '';
}

function applySiteUrl() {
  const configured = window.SITE && window.SITE.siteUrl;
  const preview = location.pathname.includes('/portfolio-preview');
  const base = configured || (location.origin + (preview ? '/portfolio-preview' : ''));
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = base.replace(/\/$/, '') + '/';
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', base.replace(/\/$/, '') + '/');
  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
    const value = meta.getAttribute('content') || '';
    if (value && !value.startsWith('http')) {
      meta.setAttribute('content', base.replace(/\/$/, '') + '/' + value.replace(/^\//, ''));
    }
  });
}

function initHeroMedia() {
  const root = document.querySelector('[data-hero-media]');
  if (!root) return;
  const img = document.getElementById('hero-portrait');
  const fallback = root.querySelector('.hero-fallback');
  const play = root.querySelector('.intro-play');
  const dialog = document.getElementById('intro-modal');
  const video = document.getElementById('intro-video');
  const prefix = depthPrefix();
  const videoUrl = prefix + (root.dataset.video || 'assets/media/hero-intro.mp4');

  if (img && fallback) {
    img.addEventListener('error', () => {
      img.hidden = true;
      fallback.hidden = false;
    });
  }

  if (!play || !dialog || !video) return;
  if (!window.SITE || !window.SITE.heroIntro) return;
  fetch(videoUrl, { method: 'HEAD' })
    .then((res) => {
      const type = res.headers.get('content-type') || '';
      if (!res.ok || type.includes('text/html')) return;
      play.hidden = false;
      play.addEventListener('click', () => {
        if (!video.getAttribute('src')) video.src = videoUrl;
        if (typeof dialog.showModal === 'function') dialog.showModal();
        video.play();
      });
      dialog.addEventListener('close', () => video.pause());
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    })
    .catch(() => {});
}

function initProjectMedia() {
  document.querySelectorAll('[data-future-asset]').forEach((frame) => {
    const prefix = depthPrefix();
    const src = prefix + frame.dataset.futureAsset;
    const img = new Image();
    img.onload = () => {
      const el = document.createElement('img');
      el.src = src;
      el.alt = frame.dataset.alt || frame.dataset.title || 'Project image';
      frame.querySelector('.media-copy')?.setAttribute('hidden', '');
      frame.appendChild(el);
    };
    img.src = src;
  });
}

function initResumeLinks() {
  if (!window.SITE || !window.SITE.resumePdf) return;
  const prefix = depthPrefix();
  const pdf = prefix + 'assets/Mortadha_Ghnimi_Resume.pdf';
  fetch(pdf, { method: 'HEAD' })
    .then((res) => {
      const type = res.headers.get('content-type') || '';
      if (!res.ok || type.includes('text/html')) return;
      document.querySelectorAll('[data-resume-link]').forEach((link) => {
        link.href = pdf;
        link.setAttribute('download', 'Mortadha_Ghnimi_Resume.pdf');
      });
    })
    .catch(() => {});
}

function initEmailButtons() {
  document.querySelectorAll('[data-email]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const email = btn.dataset.email;
      if (!email || !navigator.clipboard) return;
      event.preventDefault();
      navigator.clipboard.writeText(email).finally(() => {
        window.location.href = 'mailto:' + email;
      });
    });
  });
}

function initCounts() {
  const nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const run = (el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduce) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 700);
      const value = target * (1 - Math.pow(1 - t, 3));
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) {
    nodes.forEach(run);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  nodes.forEach((node) => io.observe(node));
}

function initBars() {
  const tracks = document.querySelectorAll('.track.accent');
  if (!tracks.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grow = (track) => track.classList.add('is-grown');
  if (reduce || !('IntersectionObserver' in window)) {
    tracks.forEach(grow);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      grow(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  tracks.forEach((track) => io.observe(track));
}


function initSkillTabs() {
  const tabs = [...document.querySelectorAll('[data-skill-tab]')];
  const panels = [...document.querySelectorAll('[data-skill-panel]')];
  if (!tabs.length || !panels.length) return;

  const activate = (key) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.skillTab === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.skillPanel === key;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.skillTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activate(tabs[next].dataset.skillTab);
      tabs[next].focus();
    });
  });

  activate((tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0]).dataset.skillTab);
}
