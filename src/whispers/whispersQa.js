// src/whispers/whispersQa.js
// QA instrumentation for whispers (gated by ?qa=1).

const QA_ENABLED =
  typeof window !== 'undefined' &&
  window.location &&
  new URLSearchParams(window.location.search).get('qa') === '1';

const QA_STATE = {
  enabled: QA_ENABLED,
  startedAt: null,
  summaryTimerId: null,
  entries: [],
  minX: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY,
  overlapCount: 0,
  fullscreenActive: null,
  diagLoggedIds: new Set(),
};

function getNowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function ensureQaStarted() {
  if (!QA_STATE.enabled || QA_STATE.startedAt !== null) {
    return;
  }
  QA_STATE.startedAt = getNowMs();
  if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
    QA_STATE.summaryTimerId = window.setTimeout(() => {
      printWhisperQaSummary();
    }, 60000);
  }
}

function toRelativeMs(timestamp) {
  if (QA_STATE.startedAt === null) return 0;
  return Math.max(0, Math.round(timestamp - QA_STATE.startedAt));
}

function computeAverage(values) {
  if (!values.length) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

export function isWhisperQaEnabled() {
  return QA_STATE.enabled;
}

export function initWhisperQa() {
  ensureQaStarted();
}

export function logWhisperFullscreenChange({ active, fullscreenElement } = {}) {
  if (!QA_STATE.enabled) {
    return;
  }
  const isActive = Boolean(active);
  if (QA_STATE.fullscreenActive === isActive) {
    return;
  }
  QA_STATE.fullscreenActive = isActive;
  const element = fullscreenElement ?? (typeof document !== 'undefined' ? document.fullscreenElement : null);
  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_FULLSCREEN', {
    active: isActive,
    fullscreenElementTag: element?.tagName ?? null,
  });
}

export function logWhisperUiTarget({ id, target } = {}) {
  if (!QA_STATE.enabled) {
    return;
  }
  const fullscreenElement = getFullscreenElement();
  const isBody = target === document.body;
  const isFullscreen = fullscreenElement && target === fullscreenElement;
  const targetName = isBody ? 'body' : isFullscreen ? 'fullscreenElement' : 'unknown';
  // eslint-disable-next-line no-console
  console.log('WHISPER_UI_TARGET', {
    id: id ?? null,
    target: targetName,
  });
}

export function logWhisperUiRect(container, id) {
  if (!QA_STATE.enabled || !container) {
    return;
  }
  const rect = container.getBoundingClientRect();
  // eslint-disable-next-line no-console
  console.log('WHISPER_UI_RECT', {
    id: id ?? null,
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  });
}

function getFullscreenElement() {
  if (typeof document === 'undefined') {
    return null;
  }
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

function getElementDescriptor(element) {
  if (!element) return null;
  return {
    tagName: element.tagName ?? null,
    id: element.id ?? null,
    className: element.className ?? null,
  };
}

function isMaskActive(value) {
  if (!value) return false;
  const normalized = String(value).toLowerCase();
  return normalized !== 'none' && normalized !== 'initial';
}

function readComputedStylesDetailed(computed) {
  if (!computed) return null;
  return {
    opacity: computed.opacity,
    color: computed.color,
    filter: computed.filter,
    mixBlendMode: computed.mixBlendMode,
    transform: computed.transform,
    maskImage: computed.maskImage,
    webkitMaskImage: computed.webkitMaskImage,
    maskSize: computed.maskSize,
    maskPosition: computed.maskPosition,
    maskRepeat: computed.maskRepeat,
    clipPath: computed.clipPath,
    textShadow: computed.textShadow,
    zIndex: computed.zIndex,
    position: computed.position,
    left: computed.left,
    top: computed.top,
    overflow: computed.overflow,
  };
}

function readParentStyles(computed) {
  if (!computed) return null;
  return {
    overflow: computed.overflow,
    overflowX: computed.overflowX,
    overflowY: computed.overflowY,
    maskImage: computed.maskImage,
    webkitMaskImage: computed.webkitMaskImage,
    clipPath: computed.clipPath,
    filter: computed.filter,
    opacity: computed.opacity,
    transform: computed.transform,
    contain: computed.contain,
    isolation: computed.isolation,
    background: computed.background,
    zIndex: computed.zIndex,
    position: computed.position,
  };
}

function getParentChainDetailed(element, maxLevels) {
  const chain = [];
  let current = element?.parentElement ?? null;
  let depth = 0;
  while (current && depth < maxLevels) {
    const rect = current.getBoundingClientRect();
    const computed = window.getComputedStyle(current);
    chain.push({
      ...getElementDescriptor(current),
      rect: readRect(rect),
      styles: readParentStyles(computed),
    });
    current = current.parentElement;
    depth += 1;
  }
  return chain;
}

function sampleCoverPoints(rect, viewportWidth, viewportHeight) {
  const safeX = (value) => Math.min(Math.max(1, value), Math.max(1, viewportWidth - 2));
  const safeY = (value) => Math.min(Math.max(1, value), Math.max(1, viewportHeight - 2));
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const points = [
    { label: 'center', x: cx, y: cy },
    { label: 'left', x: rect.left + 2, y: cy },
    { label: 'right', x: rect.right - 2, y: cy },
    { label: 'top', x: cx, y: rect.top + 2 },
    { label: 'bottom', x: cx, y: rect.bottom - 2 },
  ];
  return points.map((point) => ({
    label: point.label,
    x: safeX(point.x),
    y: safeY(point.y),
  }));
}

function computeClipDetailed(elementRect, viewport, parents) {
  const clippedLeft = elementRect.left < 0;
  const clippedRight = elementRect.right > viewport.innerWidth;
  const clippedTop = elementRect.top < 0;
  const clippedBottom = elementRect.bottom > viewport.innerHeight;
  const parentOffenders = [];

  parents.forEach((parent) => {
    const styles = parent.styles ?? {};
    const overflowHidden =
      styles.overflow !== 'visible' ||
      styles.overflowX !== 'visible' ||
      styles.overflowY !== 'visible';
    if (!overflowHidden) {
      return;
    }
    const rect = parent.rect;
    if (!rect) {
      return;
    }
    const isClipping =
      elementRect.left < rect.left ||
      elementRect.right > rect.right ||
      elementRect.top < rect.top ||
      elementRect.bottom > rect.bottom;
    if (isClipping) {
      parentOffenders.push({
        ...parent,
        reason: 'overflow',
      });
    }
  });

  return {
    clippedLeft,
    clippedRight,
    clippedTop,
    clippedBottom,
    parentOffenders,
  };
}

function buildVerdict({ elementStyles, clipState, coverSamples, parents }) {
  const evidence = [];
  let probableCause = 'inconclusive';

  if (
    clipState.clippedLeft ||
    clipState.clippedRight ||
    clipState.clippedTop ||
    clipState.clippedBottom
  ) {
    probableCause = 'viewport_clipping';
    evidence.push('element rect outside viewport');
  } else if (clipState.parentOffenders.length) {
    probableCause = 'parent_overflow_clipping';
    evidence.push('parent overflow not visible');
  } else {
    const coverMismatch = coverSamples.some((sample) => !sample.hitOwnElement);
    if (coverMismatch) {
      probableCause = 'overlay_covering_text';
      evidence.push('elementFromPoint not matching whisper element');
    } else {
      const selfMaskActive =
        isMaskActive(elementStyles.maskImage) || isMaskActive(elementStyles.webkitMaskImage);
      const parentMaskActive = parents.some((parent) => {
        const styles = parent.styles ?? {};
        return (
          isMaskActive(styles.maskImage) ||
          isMaskActive(styles.webkitMaskImage) ||
          (styles.clipPath && styles.clipPath !== 'none')
        );
      });
      if (selfMaskActive || parentMaskActive) {
        probableCause = 'mask_or_clip_path_attenuation';
        evidence.push('mask-image or clip-path active');
      } else if (Number.parseFloat(elementStyles.opacity) < 0.5) {
        probableCause = 'low_opacity';
        evidence.push(`opacity=${elementStyles.opacity}`);
      }
    }
  }

  return { probableCause, evidence };
}

export function logWhisperDiagnostics(element, label) {
  if (!QA_STATE.enabled || !element || typeof window === 'undefined') {
    return;
  }
  const id = label ?? element.id ?? 'unknown';
  if (QA_STATE.diagLoggedIds.has(id)) {
    return;
  }
  if (!element.isConnected) {
    return;
  }
  QA_STATE.diagLoggedIds.add(id);

  const viewport = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio ?? 1,
    visualViewport: window.visualViewport
      ? {
          width: window.visualViewport.width,
          height: window.visualViewport.height,
          scale: window.visualViewport.scale,
        }
      : null,
  };
  const rect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);
  const elementStyles = readComputedStylesDetailed(computed);
  const parents = getParentChainDetailed(element, 6);
  const clipState = computeClipDetailed(rect, viewport, parents);
  const samples = sampleCoverPoints(rect, viewport.innerWidth, viewport.innerHeight);
  const coverSamples = samples.map((point) => {
    const hit = document.elementFromPoint(point.x, point.y);
    const hitOwnElement = hit === element || element.contains(hit);
    return {
      ...point,
      hit: getElementDescriptor(hit),
      hitOwnElement,
    };
  });
  const fullscreenElement = getFullscreenElement();

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_DIAG_SELF', {
    id,
    elementRect: readRect(rect),
    elementStyles,
  });

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_DIAG_PARENTS', {
    id,
    parentChain: parents,
  });

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_DIAG_COVER', {
    id,
    samples: coverSamples,
  });

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_DIAG_CLIP', {
    id,
    viewport: {
      innerWidth: viewport.innerWidth,
      innerHeight: viewport.innerHeight,
    },
    clippedLeft: clipState.clippedLeft,
    clippedRight: clipState.clippedRight,
    clippedTop: clipState.clippedTop,
    clippedBottom: clipState.clippedBottom,
    parentOffenders: clipState.parentOffenders,
  });

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_DIAG_FULLSCREEN', {
    id,
    fullscreenElement: getElementDescriptor(fullscreenElement),
    documentRootClass: document.documentElement?.className ?? null,
    verumRootClass: document.getElementById('verum-root')?.className ?? null,
    viewport,
  });

  const verdict = buildVerdict({
    elementStyles,
    clipState,
    coverSamples,
    parents,
  });
  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_DIAG_VERDICT', {
    id,
    probableCause: verdict.probableCause,
    evidence: verdict.evidence,
  });
}

export function registerWhisperQa(whisper, kind) {
  if (!QA_STATE.enabled || !whisper) {
    return null;
  }
  ensureQaStarted();
  const spawnAt = getNowMs();
  const fadeInEndAt = spawnAt + (whisper.fadeInMs ?? 0);
  const fadeOutStartAt = fadeInEndAt + (whisper.holdMs ?? 0);
  const fadeOutEndAt = fadeOutStartAt + (whisper.fadeOutMs ?? 0);

  const entry = {
    id: whisper.id,
    kind,
    spawnAt,
    fadeInStartAt: spawnAt,
    fadeInEndAt,
    fadeOutStartAt,
    fadeOutEndAt,
    removedAt: null,
    positionStart: whisper.position ? { ...whisper.position } : null,
    positionEnd: null,
    lastPosition: whisper.position ? { ...whisper.position } : null,
    minX: whisper.position?.x ?? Number.POSITIVE_INFINITY,
    maxX: whisper.position?.x ?? Number.NEGATIVE_INFINITY,
    minY: whisper.position?.y ?? Number.POSITIVE_INFINITY,
    maxY: whisper.position?.y ?? Number.NEGATIVE_INFINITY,
    fontSizePx: null,
    overlapDetected: false,
    lastOverlap: null,
    layoutLogged: false,
  };

  QA_STATE.entries.push(entry);
  whisper.__qaEntry = entry;

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_SPAWN', {
    id: entry.id,
    kind: entry.kind,
    spawnAtMs: toRelativeMs(entry.spawnAt),
    fadeInStartMs: toRelativeMs(entry.fadeInStartAt),
    fadeInEndMs: toRelativeMs(entry.fadeInEndAt),
    fadeOutStartMs: toRelativeMs(entry.fadeOutStartAt),
    fadeOutEndMs: toRelativeMs(entry.fadeOutEndAt),
    position: entry.positionStart,
  });

  return entry;
}

export function updateWhisperQaPosition(whisper, position) {
  if (!QA_STATE.enabled || !whisper || !position) {
    return;
  }
  const entry = whisper.__qaEntry;
  if (!entry) {
    return;
  }
  entry.lastPosition = { ...position };
  entry.positionEnd = { ...position };
  entry.minX = Math.min(entry.minX, position.x);
  entry.maxX = Math.max(entry.maxX, position.x);
  entry.minY = Math.min(entry.minY, position.y);
  entry.maxY = Math.max(entry.maxY, position.y);

  QA_STATE.minX = Math.min(QA_STATE.minX, position.x);
  QA_STATE.maxX = Math.max(QA_STATE.maxX, position.x);
  QA_STATE.minY = Math.min(QA_STATE.minY, position.y);
  QA_STATE.maxY = Math.max(QA_STATE.maxY, position.y);
}

export function setWhisperQaFontSize(whisper, fontSizePx) {
  if (!QA_STATE.enabled || !whisper || !Number.isFinite(fontSizePx)) {
    return;
  }
  const entry = whisper.__qaEntry;
  if (!entry || Number.isFinite(entry.fontSizePx)) {
    return;
  }
  entry.fontSizePx = fontSizePx;
}

function readRect(rect) {
  if (!rect) return null;
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
  };
}

function readComputedStyles(computed) {
  if (!computed) return null;
  return {
    left: computed.left,
    right: computed.right,
    top: computed.top,
    bottom: computed.bottom,
    transform: computed.transform,
    position: computed.position,
    width: computed.width,
    maxWidth: computed.maxWidth,
    marginLeft: computed.marginLeft,
    marginRight: computed.marginRight,
    textAlign: computed.textAlign,
    overflow: computed.overflow,
    overflowX: computed.overflowX,
    overflowY: computed.overflowY,
    clipPath: computed.clipPath,
    maskImage: computed.maskImage,
    webkitMaskImage: computed.webkitMaskImage,
    contain: computed.contain,
    filter: computed.filter,
  };
}

function getParentChain(element, maxLevels) {
  const chain = [];
  let current = element?.parentElement ?? null;
  let depth = 0;
  while (current && depth < maxLevels) {
    const rect = current.getBoundingClientRect();
    const computed = window.getComputedStyle(current);
    chain.push({
      tagName: current.tagName,
      className: current.className,
      rect: readRect(rect),
      overflow: computed.overflow,
      overflowX: computed.overflowX,
      overflowY: computed.overflowY,
      transform: computed.transform,
      maskImage: computed.maskImage,
      webkitMaskImage: computed.webkitMaskImage,
      clipPath: computed.clipPath,
    });
    current = current.parentElement;
    depth += 1;
  }
  return chain;
}

function computeClipState(elementRect, viewportWidth, parents) {
  const clippedLeft = elementRect.left < 0;
  const clippedRight = elementRect.right > viewportWidth;
  let clippedByParent = false;
  let offender = null;

  for (const parent of parents) {
    const overflowHidden =
      parent.overflow !== 'visible' ||
      parent.overflowX !== 'visible' ||
      parent.overflowY !== 'visible';
    if (!overflowHidden) continue;
    if (
      elementRect.left < parent.rect.left ||
      elementRect.right > parent.rect.right ||
      elementRect.top < parent.rect.top ||
      elementRect.bottom > parent.rect.bottom
    ) {
      clippedByParent = true;
      offender = parent;
      break;
    }
  }

  return {
    clippedLeft,
    clippedRight,
    clippedByParent,
    offender,
  };
}

function resolveXStrategy(element, computed) {
  const leftRaw = element?.style?.left ?? '';
  if (leftRaw === '50%') {
    return { xStrategy: 'left50', xPxIfAny: null, leftStyleRaw: leftRaw };
  }
  if (leftRaw.endsWith('px')) {
    return {
      xStrategy: 'px',
      xPxIfAny: Number.parseFloat(leftRaw),
      leftStyleRaw: leftRaw,
    };
  }
  if (computed?.left && computed.left.endsWith('px')) {
    return {
      xStrategy: 'px',
      xPxIfAny: Number.parseFloat(computed.left),
      leftStyleRaw: leftRaw || computed.left,
    };
  }
  return { xStrategy: 'unknown', xPxIfAny: null, leftStyleRaw: leftRaw };
}

export function logWhisperLayout(whisper, element) {
  if (!QA_STATE.enabled || !whisper || !element || typeof window === 'undefined') {
    return;
  }
  const entry = whisper.__qaEntry;
  if (entry?.layoutLogged) {
    return;
  }
  if (entry) {
    entry.layoutLogged = true;
  }
  const viewport = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio ?? 1,
  };
  const rect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);
  const parents = getParentChain(element, 4);
  const clipState = computeClipState(rect, viewport.innerWidth, parents);
  const xSource = resolveXStrategy(element, computed);

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_LAYOUT', {
    id: entry?.id ?? whisper.id,
    kind: entry?.kind ?? 'unknown',
    viewport,
    elementRect: readRect(rect),
    elementStyles: readComputedStyles(computed),
    parentChain: parents,
  });

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_CLIP', {
    id: entry?.id ?? whisper.id,
    clippedLeft: clipState.clippedLeft,
    clippedRight: clipState.clippedRight,
    clippedByParent: clipState.clippedByParent,
    offenderParentTag: clipState.offender?.tagName ?? null,
    offenderParentClass: clipState.offender?.className ?? null,
  });

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_X_SOURCE', {
    id: entry?.id ?? whisper.id,
    xStrategy: xSource.xStrategy,
    xPxIfAny: xSource.xPxIfAny,
    leftStyleRaw: xSource.leftStyleRaw,
    transformRaw: computed.transform,
  });
}

export function recordWhisperOverlap(whisper, overlap) {
  if (!QA_STATE.enabled || !whisper) {
    return;
  }
  const entry = whisper.__qaEntry;
  if (!entry) {
    return;
  }
  if (entry.lastOverlap !== overlap) {
    // eslint-disable-next-line no-console
    console.log('WHISPER_QA_OVERLAP', {
      id: entry.id,
      overlap,
    });
    entry.lastOverlap = overlap;
  }
  if (overlap && !entry.overlapDetected) {
    entry.overlapDetected = true;
    QA_STATE.overlapCount += 1;
  }
}

export function markWhisperQaRemoval(whisper) {
  if (!QA_STATE.enabled || !whisper) {
    return;
  }
  const entry = whisper.__qaEntry;
  if (!entry || entry.removedAt !== null) {
    return;
  }
  entry.removedAt = getNowMs();
  if (!entry.positionEnd && entry.lastPosition) {
    entry.positionEnd = { ...entry.lastPosition };
  }

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_END', {
    id: entry.id,
    kind: entry.kind,
    removedAtMs: toRelativeMs(entry.removedAt),
    positionEnd: entry.positionEnd,
    fontSizePx: entry.fontSizePx,
  });
}

export function printWhisperQaSummary() {
  if (!QA_STATE.enabled || QA_STATE.startedAt === null) {
    return;
  }
  const now = getNowMs();
  const elapsedMs = Math.max(0, now - QA_STATE.startedAt);
  const entries = QA_STATE.entries;
  const totalCount = entries.length;
  const durations = entries.map((entry) => {
    const end = entry.removedAt ?? entry.fadeOutEndAt ?? entry.spawnAt;
    return Math.max(0, end - entry.spawnAt);
  });
  const perMinute = elapsedMs > 0 ? (totalCount * 60000) / elapsedMs : 0;
  const avgVisibleMs = computeAverage(durations);
  const fontSizes = entries
    .map((entry) => entry.fontSizePx)
    .filter((value) => Number.isFinite(value));
  const avgFontSizePx = computeAverage(fontSizes);
  const minFontSizePx = fontSizes.length ? Math.min(...fontSizes) : null;
  const maxFontSizePx = fontSizes.length ? Math.max(...fontSizes) : null;

  const byType = entries.reduce(
    (acc, entry) => {
      acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // eslint-disable-next-line no-console
  console.log('WHISPER_QA_SUMMARY', {
    elapsedMs: Math.round(elapsedMs),
    totalCount,
    perMinute,
    avgVisibleMs,
    positionRange: {
      minX: Number.isFinite(QA_STATE.minX) ? QA_STATE.minX : null,
      maxX: Number.isFinite(QA_STATE.maxX) ? QA_STATE.maxX : null,
      minY: Number.isFinite(QA_STATE.minY) ? QA_STATE.minY : null,
      maxY: Number.isFinite(QA_STATE.maxY) ? QA_STATE.maxY : null,
    },
    fontSizePx: {
      avg: avgFontSizePx,
      min: minFontSizePx,
      max: maxFontSizePx,
    },
    overlapCount: QA_STATE.overlapCount,
    byType,
  });
}
