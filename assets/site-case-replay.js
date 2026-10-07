/* Timux case replay: progressive, code-native customer-service conversation. */
(() => {
  const replay = document.querySelector('[data-case-replay]');
  const caseCard = replay?.closest('#case-southeast');
  if (!replay || !caseCard) return;

  const english = document.documentElement.lang === 'en';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverCapable = matchMedia('(hover: hover)');
  const controls = [...caseCard.querySelectorAll('[data-replay-step]')];
  const showTargets = [...replay.querySelectorAll('[data-replay-show]')];
  const onlyTargets = [...replay.querySelectorAll('[data-replay-only]')];
  const status = replay.querySelector('[data-replay-status]');
  const counter = replay.querySelector('[data-replay-counter]');
  const stageLabel = replay.querySelector('[data-replay-stage-label]');
  const copy = english ? {
    status: ['Preparing scenario', 'Intent detected', 'Checking approved knowledge', 'Knowledge checked', 'Live-data boundary found', 'Handoff ready'],
    stages: ['01 UNDERSTAND', '02 VERIFY', '03 HAND OFF']
  } : {
    status: ['情境準備中', '已辨識旅客意圖', '正在核對核准知識', '知識核對完成', '偵測到即時資料邊界', '人工接手已準備'],
    stages: ['01 理解意圖', '02 核對知識', '03 人工接手']
  };
  const stageForSequence = [0, 0, 1, 1, 2, 2];
  const sequenceDuration = [420, 2300, 1450, 2600, 1650, 3200];
  const jumpSequence = [1, 2, 4];
  let sequence = 0;
  let timer = 0;
  let inView = false;
  let pausedByPointer = false;
  let pausedByVisibility = document.hidden;

  replay.classList.add('replay-enhanced');

  function isPaused() {
    return pausedByPointer || pausedByVisibility;
  }

  function updatePausedState() {
    const paused = isPaused();
    replay.dataset.replayPaused = String(paused);
    if (paused) clearTimeout(timer);
    else schedule();
  }

  function render(nextSequence) {
    sequence = Math.max(0, Math.min(5, nextSequence));
    const stage = stageForSequence[sequence];
    replay.dataset.replaySequence = String(sequence);
    replay.dataset.replayStage = String(stage);
    replay.style.setProperty('--replay-progress', String(sequence / 5));
    showTargets.forEach((element) => element.classList.toggle('is-visible', sequence >= Number(element.dataset.replayShow)));
    onlyTargets.forEach((element) => element.classList.toggle('is-visible', sequence === Number(element.dataset.replayOnly)));
    controls.forEach((control, index) => {
      const active = index === stage;
      control.classList.toggle('replay-selected', active);
      control.setAttribute('aria-pressed', String(active));
    });
    status.textContent = copy.status[sequence];
    counter.textContent = `0${stage + 1} / 03`;
    stageLabel.textContent = copy.stages[stage];
  }

  function schedule(delay = sequenceDuration[sequence]) {
    clearTimeout(timer);
    if (!inView || isPaused() || reduced.matches) return;
    timer = window.setTimeout(() => {
      render(sequence === 5 ? 0 : sequence + 1);
      schedule();
    }, delay);
  }

  function startAt(nextSequence) {
    render(nextSequence);
    schedule(nextSequence === 0 ? 180 : sequenceDuration[nextSequence]);
  }

  controls.forEach((control, index) => control.addEventListener('click', () => startAt(jumpSequence[index])));
  replay.addEventListener('pointerenter', () => {
    if (!hoverCapable.matches) return;
    pausedByPointer = true;
    updatePausedState();
  });
  replay.addEventListener('pointerleave', () => {
    pausedByPointer = false;
    updatePausedState();
  });
  document.addEventListener('visibilitychange', () => {
    pausedByVisibility = document.hidden;
    updatePausedState();
  });

  const observer = new IntersectionObserver((entries) => {
    inView = entries[0]?.isIntersecting ?? false;
    if (!inView) {
      clearTimeout(timer);
      return;
    }
    schedule(sequence === 0 ? 180 : 500);
  }, { threshold: 0.28 });
  observer.observe(replay);

  function configureMotion() {
    clearTimeout(timer);
    if (reduced.matches) {
      render(5);
      replay.dataset.replayPaused = 'false';
      return;
    }
    render(0);
    schedule(180);
  }
  reduced.addEventListener('change', configureMotion);
  configureMotion();
})();
