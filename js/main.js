(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

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
  initFilters();
  initOpportunity();
})();

function initOpportunity() {
  const el = document.querySelector('[data-opportunity]');
  if (!el || !window.SITE || !window.SITE.showOpportunityStatus) return;
  el.hidden = false;
}

function initFilters() {
  const buttons = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('[data-focus]');
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
        const cards = document.querySelectorAll('.cards .card');
        const any = [...cards].some((card) => !card.classList.contains('is-hidden'));
        more.classList.toggle('is-hidden', !any);
      }
    });
  });
}

function depthPrefix() {
  return location.pathname.includes('/work/') ? '../' : '';
}

function initHeroMedia() {
  const root = document.querySelector('[data-hero-media]');
  if (!root) return;
  const stage = root.querySelector('.hero-stage');
  const fallback = root.querySelector('.hero-fallback');
  const play = root.querySelector('.play');
  const live = root.querySelector('.hero-status');
  const prefix = depthPrefix();
  const videoList = (root.dataset.video || 'assets/media/hero-intro.mp4')
    .split(',')
    .map((item) => prefix + item.trim());
  const posters = (root.dataset.posters || 'assets/hero/portrait.jpg,assets/hero/portrait.png,assets/hero/portrait.webp')
    .split(',')
    .map((item) => prefix + item.trim());

  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Mortadha Ghnimi';
    stage.insertBefore(img, fallback);
    fallback.hidden = true;
    if (play) play.hidden = true;
  }

  function showVideo(src) {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', 'Muted preview of Mortadha Ghnimi introduction');
    stage.insertBefore(video, fallback);
    fallback.hidden = true;
    if (motionOK) video.play().catch(() => {});
    if (play) {
      play.hidden = false;
      play.disabled = false;
      play.addEventListener('click', () => {
        video.muted = false;
        video.controls = true;
        video.play();
        if (live) live.textContent = 'Playing introduction with sound.';
      });
    }
  }

  function tryVideo(index) {
    if (index >= videoList.length) {
      tryPosters(0);
      return;
    }
    fetch(videoList[index], { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') || '';
        if (res.ok && (type.includes('video') || videoList[index].endsWith('.mp4'))) {
          showVideo(videoList[index]);
          return;
        }
        tryVideo(index + 1);
      })
      .catch(() => tryVideo(index + 1));
  }

  tryVideo(0);

  function tryPosters(index) {
    if (index >= posters.length) {
      if (play) {
        play.disabled = true;
        play.setAttribute('aria-label', 'Introduction video is not added yet');
      }
      return;
    }
    const img = new Image();
    img.onload = () => showImage(posters[index]);
    img.onerror = () => tryPosters(index + 1);
    img.src = posters[index];
  }
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
