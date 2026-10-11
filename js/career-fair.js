(() => {
  // Accessible accordion: one detailed role at a time.
  const roles = [...document.querySelectorAll('.experience-accordion')];
  roles.forEach(role => role.addEventListener('toggle', () => {
    if (role.open) roles.forEach(other => { if (other !== role) other.open = false; });
  }));

  const descriptions = {
    ai: 'I build and deploy AI applications that connect language models, retrieval, and APIs to real workflows—from commerce automation to mobile AI experiences.',
    research: 'I study vegetation stress with multisensor satellite time series, temporal representations, and held-out evaluation.',
    systems: 'I build backend services and optimize ML workloads with C++, SIMD, and OpenMP.'
  };
  document.querySelectorAll('[data-focus-output]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-focus-output]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      document.getElementById('focus-output').textContent = descriptions[button.dataset.focusOutput];
    });
  });

  const video = document.getElementById('gym-demo-video');
  document.querySelectorAll('[data-demo]').forEach(button => {
    button.addEventListener('click', () => {
      if (!video) return;
      video.pause();
      video.src = '../assets/gymbox/videos/' + button.dataset.demo + '.mp4';
      video.poster = '../assets/gymbox/screens/' + button.dataset.poster + '.png';
      video.load();
      document.querySelectorAll('[data-demo]').forEach(item => item.classList.toggle('is-active', item === button));
    });
  });

  const button = document.getElementById('precision-button');
  if (!button) return;
  const clock = document.getElementById('precision-clock');
  const reset = document.getElementById('precision-reset');
  const instruction = document.getElementById('precision-instruction');
  const outcome = document.getElementById('precision-outcome');
  const humanError = document.getElementById('human-error');
  const botError = document.getElementById('bot-error');
  let running = false;
  let startedAt = 0;
  let frame = 0;
  let benchmark = 0;
  const display = seconds => {
    clock.replaceChildren(document.createTextNode(seconds.toFixed(2)));
    const suffix = document.createElement('span'); suffix.textContent = 's'; clock.append(suffix);
  };
  const showOutcome = (headline, text) => {
    outcome.replaceChildren();
    const p = document.createElement('p');
    const strong = document.createElement('strong'); strong.textContent = headline + ' ';
    p.append(strong, document.createTextNode(text));
    const a = document.createElement('a'); a.href = '#contact'; a.textContent = 'Let’s talk →';
    outcome.append(p, a);
  };
  const finish = () => {
    if (!running) return;
    const seconds = (performance.now() - startedAt) / 1000;
    running = false; cancelAnimationFrame(frame);
    const error = Math.abs(seconds - 3);
    display(seconds);
    humanError.textContent = (error * 1000).toFixed(0) + ' ms';
    botError.textContent = (benchmark * 1000).toFixed(0) + ' ms';
    if (Math.abs(error - benchmark) < .005) showOutcome('A perfect partnership?', 'We tied. Let’s build something together.');
    else if (error < benchmark) showOutcome('You beat the bot.', 'You’ve got the timing. Let’s build intelligent systems together.');
    else showOutcome('The bot takes this round.', 'I’ll count that as one vote for hiring Mortadha. Rematch?');
    instruction.textContent = 'Your time: ' + seconds.toFixed(2) + ' seconds.';
    button.textContent = 'Play again';
    button.classList.remove('is-running'); clock.classList.remove('is-running');
  };
  const tick = () => {
    if (!running) return;
    const elapsed = (performance.now() - startedAt) / 1000;
    display(elapsed);
    if (elapsed >= 10) { finish(); return; }
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    benchmark = .04 + Math.random() * .14;
    running = true; startedAt = performance.now();
    humanError.textContent = '—'; botError.textContent = '—';
    outcome.innerHTML = '<p>Focus on 3.00 seconds. Stop when you’re ready.</p>';
    instruction.textContent = 'Stop the clock at 3.00 seconds.';
    button.textContent = 'Stop the clock';
    button.classList.add('is-running'); clock.classList.add('is-running');
    tick();
  };
  button.addEventListener('click', () => running ? finish() : start());
  reset.addEventListener('click', () => {
    cancelAnimationFrame(frame); running = false;
    display(0); humanError.textContent = '—'; botError.textContent = '—';
    instruction.textContent = 'One button. One shot. Ready?';
    button.textContent = 'Start challenge';button.classList.remove('is-running');clock.classList.remove('is-running');
    outcome.innerHTML = '<p>A little friendly competition. A good conversation starter.</p>';
  });
  // A backgrounded tab cancels the round rather than reporting a misleading time.
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) reset.click(); });
})();
