/* Timux case replay: scroll-driven, reversible customer-service conversation. */
(() => {
  const replay = document.querySelector('[data-case-replay]');
  const caseCard = replay?.closest('#case-southeast');
  if (!replay || !caseCard) return;

  const english = document.documentElement.lang === 'en';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1100px) and (min-height: 700px)');
  const controls = [...caseCard.querySelectorAll('[data-replay-step]')];
  const showTargets = [...replay.querySelectorAll('[data-replay-show]')];
  const onlyTargets = [...replay.querySelectorAll('[data-replay-only]')];
  const status = replay.querySelector('[data-replay-status]');
  const counter = replay.querySelector('[data-replay-counter]');
  const stageLabel = replay.querySelector('[data-replay-stage-label]');
  const visual = replay.closest('.case-replay-visual');
  const copy = english ? {
    status: ['Scroll to begin', 'Intent detected', 'Checking approved knowledge', 'Knowledge checked', 'Live-data boundary found', 'Handoff ready'],
    stages: ['01 UNDERSTAND', '02 VERIFY', '03 HAND OFF']
  } : {
    status: ['繼續滾動開始', '已辨識旅客意圖', '正在核對核准知識', '知識核對完成', '偵測到即時資料邊界', '人工接手已準備'],
    stages: ['01 理解意圖', '02 核對知識', '03 人工接手']
  };
  const stageForSequence = [0, 0, 1, 1, 2, 2];
  const sequenceThresholds = [0, .1, .32, .48, .67, .82];
  const stageProgress = [.16, .45, .86];
  let sequence = -1;
  let frame = 0;

  replay.classList.add('replay-enhanced');
  replay.dataset.replayPaused = 'false';

  const clamp = (value) => Math.max(0, Math.min(1, value));

  function render(nextSequence, progress) {
    if (nextSequence === sequence) {
      replay.dataset.replayProgress = progress.toFixed(3);
      replay.style.setProperty('--replay-progress', String(progress));
      return;
    }
    sequence = Math.max(0, Math.min(5, nextSequence));
    const stage = stageForSequence[sequence];
    replay.dataset.replaySequence = String(sequence);
    replay.dataset.replayStage = String(stage);
    replay.dataset.replayProgress = progress.toFixed(3);
    replay.style.setProperty('--replay-progress', String(progress));
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

  function getProgress() {
    if (desktop.matches) {
      const track = caseCard.parentElement?.classList.contains('case-track') ? caseCard.parentElement : caseCard;
      const rect = track.getBoundingClientRect();
      return clamp((-rect.top + 80) / Math.max(1, rect.height - innerHeight + 80));
    }
    const rect = visual.getBoundingClientRect();
    return clamp((innerHeight * .78 - rect.top) / Math.max(1, rect.height + innerHeight * .36));
  }

  function sequenceAt(progress) {
    let next = 0;
    sequenceThresholds.forEach((threshold, index) => {
      if (progress >= threshold) next = index;
    });
    return next;
  }

  function paint() {
    frame = 0;
    if (reduced.matches) {
      render(5, 1);
      return;
    }
    const progress = getProgress();
    render(sequenceAt(progress), progress);
  }

  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function scrollToProgress(progress) {
    let top;
    if (desktop.matches) {
      const track = caseCard.parentElement?.classList.contains('case-track') ? caseCard.parentElement : caseCard;
      const rect = track.getBoundingClientRect();
      const absoluteTop = rect.top + scrollY;
      top = absoluteTop - 80 + progress * Math.max(1, rect.height - innerHeight + 80);
    } else {
      const rect = visual.getBoundingClientRect();
      const absoluteTop = rect.top + scrollY;
      top = absoluteTop - innerHeight * .78 + progress * (rect.height + innerHeight * .36);
    }
    scrollTo({ top: Math.max(0, top), behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  controls.forEach((control, index) => control.addEventListener('click', () => scrollToProgress(stageProgress[index])));
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  desktop.addEventListener('change', requestPaint);
  reduced.addEventListener('change', requestPaint);
  addEventListener('load', requestPaint, { once: true });
  requestPaint();
})();
