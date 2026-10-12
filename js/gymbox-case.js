(() => {
  const video = document.getElementById('gym-demo-video');
  const buttons = [...document.querySelectorAll('[data-demo]')];
  if (!video) return;
  buttons.forEach(button => button.addEventListener('click', () => {
    video.pause();
    video.src = '../assets/gymbox/videos/' + button.dataset.demo + '.mp4';
    video.poster = '../assets/gymbox/screens/' + button.dataset.poster + '.png';
    video.load();
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }));
})();
