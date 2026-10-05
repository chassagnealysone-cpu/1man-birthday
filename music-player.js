(() => {
  const audio = document.querySelector('#background-music');
  const player = document.querySelector('#music-player');
  const toggle = document.querySelector('#music-toggle');
  const record = document.querySelector('#music-record');
  const fold = document.querySelector('#music-fold');
  const volume = document.querySelector('#music-volume');
  const mute = document.querySelector('#music-mute');
  const status = document.querySelector('#music-status');
  let userPaused = false;
  let waitingForGesture = true;
  audio.volume = .3;

  function sync() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    toggle.textContent = playing ? 'Ⅱ' : '▶';
    toggle.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
    record.setAttribute('aria-label', player.classList.contains('is-collapsed') ? '展开音乐播放器' : toggle.getAttribute('aria-label'));
    const silent = audio.muted || audio.volume === 0;
    mute.textContent = silent ? '×' : '♪';
    mute.setAttribute('aria-label', silent ? '恢复声音' : '静音');
    mute.setAttribute('aria-pressed', String(silent));
  }
  async function play() {
    try {
      await audio.play();
      waitingForGesture = false;
    } catch (error) {
      status.textContent = error.name === 'NotAllowedError' ? '轻轻点一下，让音乐开始' : '音乐暂时无法播放，点击重试';
    }
    sync();
  }
  function togglePlayback() {
    if (audio.paused) { userPaused = false; play(); }
    else { userPaused = true; waitingForGesture = false; audio.pause(); }
  }
  function setCollapsed(collapsed) {
    player.classList.toggle('is-collapsed', collapsed);
    fold.textContent = collapsed ? '‹' : '−';
    fold.setAttribute('aria-expanded', String(!collapsed));
    fold.setAttribute('aria-label', collapsed ? '展开音乐播放器' : '收起音乐播放器');
    sync();
  }
  // Only collapse on successful entry; later page turns preserve the user's choice.
  document.addEventListener('birthday:entered', () => setCollapsed(true), { once: true });
  fold.addEventListener('click', () => setCollapsed(!player.classList.contains('is-collapsed')));
  record.addEventListener('click', () => player.classList.contains('is-collapsed') ? setCollapsed(false) : togglePlayback());
  toggle.addEventListener('click', togglePlayback);
  volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; audio.muted = false; sync(); });
  mute.addEventListener('click', () => {
    if (audio.volume === 0) { audio.volume = .3; volume.value = '30'; audio.muted = false; }
    else audio.muted = !audio.muted;
    sync();
  });
  audio.addEventListener('playing', () => { status.textContent = '让音乐陪你慢慢看'; sync(); });
  audio.addEventListener('pause', () => { status.textContent = '音乐已暂停'; sync(); });
  audio.addEventListener('volumechange', sync);
  audio.addEventListener('error', () => { status.textContent = '音乐加载失败，请刷新重试'; sync(); });
  // Browser autoplay policy may require the first real user interaction.
  const startOnGesture = (event) => {
    if (waitingForGesture && !userPaused && !player.contains(event.target)) play();
  };
  document.addEventListener('pointerdown', startOnGesture);
  document.addEventListener('keydown', startOnGesture);
  sync();
  play();
})();
