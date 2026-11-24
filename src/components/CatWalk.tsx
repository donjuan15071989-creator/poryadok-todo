import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * CatWalk - Decorative cat walking animation
 * New scenario: starts near control button, walks diagonally to card,
 * randomly goes behind or in front of card, exits left.
 */

// Cat SVG with separate animated parts (same visual)
const CAT_SVG = `<svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" class="cat-svg">
  <defs>
    <style>
      @keyframes walk-body {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-1.5px) rotate(0.5deg); }
        75% { transform: translateY(1.5px) rotate(-0.5deg); }
      }
      @keyframes walk-tail {
        0%, 100% { transform: rotate(-10deg); transform-origin: 85px 28px; }
        50% { transform: rotate(15deg); transform-origin: 85px 28px; }
      }
      @keyframes walk-ear {
        0%, 100%, 80% { transform: rotate(0deg); transform-origin: center bottom; }
        90% { transform: rotate(-8deg); transform-origin: center bottom; }
      }
      @keyframes blink {
        0%, 90%, 100% { transform: scaleY(1); transform-origin: center; }
        95% { transform: scaleY(0.1); transform-origin: center; }
      }
      @keyframes walk-leg-front {
        0% { transform: rotate(0deg); transform-origin: center top; }
        25% { transform: rotate(-25deg); transform-origin: center top; }
        50% { transform: rotate(0deg); transform-origin: center top; }
        75% { transform: rotate(20deg); transform-origin: center top; }
        100% { transform: rotate(0deg); transform-origin: center top; }
      }
      @keyframes walk-leg-back {
        0% { transform: rotate(0deg); transform-origin: center top; }
        25% { transform: rotate(20deg); transform-origin: center top; }
        50% { transform: rotate(0deg); transform-origin: center top; }
        75% { transform: rotate(-25deg); transform-origin: center top; }
        100% { transform: rotate(0deg); transform-origin: center top; }
      }
      @keyframes sit-breathe {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(1px); }
      }
      @keyframes tail-sit {
        0%, 100% { transform: rotate(-5deg); transform-origin: 78px 25px; }
        50% { transform: rotate(10deg); transform-origin: 78px 25px; }
      }

      .cat-walking .cat-body { animation: walk-body 0.7s ease-in-out infinite; }
      .cat-walking .cat-tail { animation: walk-tail 1.4s ease-in-out infinite; }
      .cat-walking .cat-ear { animation: walk-ear 3s ease-in-out infinite; }
      .cat-walking .cat-eye { animation: blink 4s ease-in-out infinite; }
      .cat-walking .cat-leg-fl { animation: walk-leg-front 0.7s ease-in-out infinite; }
      .cat-walking .cat-leg-fr { animation: walk-leg-front 0.7s ease-in-out infinite; animation-delay: 0.35s; }
      .cat-walking .cat-leg-bl { animation: walk-leg-back 0.7s ease-in-out infinite; }
      .cat-walking .cat-leg-br { animation: walk-leg-back 0.7s ease-in-out infinite; animation-delay: 0.35s; }

      .cat-sitting { animation: sit-breathe 2s ease-in-out infinite; }
      .cat-sitting .cat-tail-sit { animation: tail-sit 2.5s ease-in-out infinite; }
      .cat-sitting .cat-ear-sit { animation: walk-ear 4s ease-in-out infinite; }
      .cat-sitting .cat-eye-sit { animation: blink 5s ease-in-out infinite; }
    </style>
  </defs>

  <!-- Walking pose - facing up-left (toward card) -->
  <g class="cat-walking" id="cat-walking">
    <path class="cat-tail" d="M85 28 Q100 18 105 12 Q108 8 102 6" stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <ellipse class="cat-body" cx="55" cy="38" rx="26" ry="16" stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <circle class="cat-head" cx="28" cy="22" r="14" stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <path class="cat-ear cat-ear-left" d="M18 12 L14 0 L22 8" stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path class="cat-ear cat-ear-right" d="M38 12 L42 0 L34 8" stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <circle class="cat-eye" cx="23" cy="20" r="3" fill="#8b7d6b"/>
    <path class="cat-whiskers" d="M16 21 L6 18 M16 23 L6 23 M16 25 L6 28" stroke="#8b7d6b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path class="cat-leg cat-leg-fl" d="M38 48 L35 62" stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cat-leg cat-leg-fr" d="M46 48 L49 62" stroke="#8b7d6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
    <path class="cat-leg cat-leg-bl" d="M70 48 L74 62" stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cat-leg cat-leg-br" d="M78 48 L82 62" stroke="#8b7d6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
  </g>

  <!-- Sitting/looking pose -->
  <g class="cat-sitting" id="cat-sitting" style="display: none;">
    <path class="cat-tail-sit" d="M78 25 Q88 20 90 15 Q92 10 88 8" stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <ellipse class="cat-body-sit" cx="55" cy="42" rx="26" ry="18" stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <circle class="cat-head-sit" cx="28" cy="20" r="15" stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <path class="cat-ear cat-ear-sit cat-ear-left-sit" d="M17 9 L13 -1 L21 5" stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path class="cat-ear cat-ear-sit cat-ear-right-sit" d="M39 9 L43 -1 L35 5" stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <circle class="cat-eye cat-eye-sit" cx="23" cy="18" r="3.5" fill="#8b7d6b"/>
    <path class="cat-whiskers-sit" d="M15 19 L5 16 M15 21 L5 21 M15 23 L5 26" stroke="#8b7d6b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <ellipse class="cat-paw-left" cx="35" cy="52" rx="7" ry="4" stroke="#8b7d6b" stroke-width="2.5" fill="none"/>
    <ellipse class="cat-paw-right" cx="48" cy="52" rx="7" ry="4" stroke="#8b7d6b" stroke-width="2.5" fill="none" opacity="0.7"/>
    <path class="cat-leg-back-sit" d="M70 42 Q78 50 82 42" stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="cat-leg-back2-sit" d="M78 42 Q86 50 90 42" stroke="#8b7d6b" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
  </g>
</svg>`;

interface CardRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface CatWalkProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

type RouteType = 'behind' | 'front';

export function CatWalk({ cardRef }: CatWalkProps) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('catWalkEnabled') !== 'false';
    }
    return true;
  });
  const [isWalking, setIsWalking] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'starting' | 'paused-near-btn' | 'turning-to-card' | 'walking-to-card' | 'crossing-card' | 'exiting-left' | 'done'>('idle');
  const [route, setRoute] = useState<RouteType | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('init');

  const catContainerRef = useRef<HTMLDivElement>(null);
  const controlButtonRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRectRef = useRef<CardRect | null>(null);
  const startPosRef = useRef<Point | null>(null);
  const sessionStartedRef = useRef(false);
  const userInteractingRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const animationRunningRef = useRef(false);
  const pausedForInputRef = useRef(false);

  // Persist enabled state
  useEffect(() => {
    localStorage.setItem('catWalkEnabled', enabled.toString());
  }, [enabled]);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches && isWalking) {
        stopAnimation();
        setDebugInfo('stopped: reduced-motion enabled');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isWalking]);

  // Track user interaction with inputs
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        userInteractingRef.current = true;
        if (isWalking && phase === 'crossing-card' && route === 'front') {
          pausedForInputRef.current = true;
          pauseAnimation();
          setDebugInfo('paused: user input');
        }
      }
    };
    const handleBlur = () => {
      userInteractingRef.current = false;
      if (pausedForInputRef.current && isWalking) {
        pausedForInputRef.current = false;
        resumeAnimation();
        setDebugInfo('resumed after input');
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [isWalking, phase, route]);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isWalking) {
        pauseAnimation();
      } else if (!document.hidden && phase !== 'idle' && phase !== 'done' && animationRunningRef.current) {
        resumeAnimation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isWalking, phase]);

  // Get card position
  const updateCardRect = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      cardRectRef.current = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    }
  }, [cardRef]);

  // Get control button position
  const updateStartPos = useCallback(() => {
    if (controlButtonRef.current) {
      const rect = controlButtonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      // Position cat above and slightly left of button
      const catWidth = 140;
      const gap = 16;
      startPosRef.current = {
        x: Math.max(catWidth / 2 + 10, rect.left - gap - catWidth / 2),
        y: rect.top - gap - 90, // cat height ~90px
      };
      // Ensure fully in viewport
      if (startPosRef.current.x < catWidth / 2) startPosRef.current.x = catWidth / 2;
      if (startPosRef.current.x > vw - catWidth / 2) startPosRef.current.x = vw - catWidth / 2;
      if (startPosRef.current.y < 10) startPosRef.current.y = 10;
    }
  }, []);

  // Cleanup all animations
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    animationRunningRef.current = false;
  }, []);

  const pauseAnimation = useCallback(() => {
    if (animationRef.current) animationRef.current.pause();
    setIsWalking(false);
  }, []);

  const resumeAnimation = useCallback(() => {
    if (animationRef.current) animationRef.current.play();
    setIsWalking(true);
  }, []);

  const stopAnimation = useCallback(() => {
    cleanup();
    if (catContainerRef.current) {
      catContainerRef.current.style.display = 'none';
      catContainerRef.current.style.opacity = '0';
    }
    setIsWalking(false);
    setPhase('idle');
    animationRunningRef.current = false;
  }, [cleanup]);

  // Animate position using Web Animations API (transform for fixed positioning)
  const animateMove = useCallback((el: HTMLElement, from: Point, to: Point, duration: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!el) return reject(new Error('No element'));

      const anim = el.animate(
        [
          { transform: `translate(${from.x}px, ${from.y}px)`, offset: 0 },
          { transform: `translate(${to.x}px, ${to.y}px)`, offset: 1 }
        ],
        {
          duration,
          easing: 'ease-in-out',
          fill: 'forwards'
        }
      );

      animationRef.current = anim;
      anim.onfinish = () => resolve();
      anim.oncancel = () => reject(new DOMException('Animation cancelled', 'AbortError'));
    });
  }, []);

  const wait = useCallback((ms: number): Promise<void> => new Promise(resolve => {
    phaseTimeoutRef.current = window.setTimeout(resolve, ms);
  }), []);

  // Main walk sequence
  const runWalkSequence = useCallback(async () => {
    if (!enabled || prefersReducedMotionRef.current) {
      setDebugInfo('blocked: ' + (!enabled ? 'disabled' : 'reduced-motion'));
      return;
    }
    if (animationRunningRef.current) {
      setDebugInfo('blocked: already running');
      return;
    }
    if (!cardRectRef.current) {
      setDebugInfo('waiting for card rect...');
      return;
    }

    const card = cardRectRef.current;
    const catEl = catContainerRef.current;
    const walkingEl = catEl?.querySelector('#cat-walking') as HTMLElement;
    const sittingEl = catEl?.querySelector('#cat-sitting') as HTMLElement;
    if (!catEl || !walkingEl || !sittingEl) {
      setDebugInfo('blocked: no elements');
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Choose route randomly (50/50)
    const chosenRoute: RouteType = Math.random() < 0.5 ? 'behind' : 'front';
    setRoute(chosenRoute);

    // Start position (near button)
    const start = startPosRef.current || { x: vw - 100, y: vh - 120 };

    // Intermediate points
    // Card bottom-right corner (approach target)
    const cardApproachX = card.right - 30;
    const cardApproachY = card.bottom - 40;

    // For route 'behind': go behind card (card bottom edge Y)
    // For route 'front': go over card (card top + 50 Y)
    const crossY = chosenRoute === 'behind'
      ? card.bottom + 20  // Behind: below card bottom
      : card.top + 60;    // Front: on card surface

    // Exit left at same Y as crossing
    const exitX = -100;
    const exitY = crossY;

    // Show walking pose
    walkingEl.style.display = 'block';
    sittingEl.style.display = 'none';
    catEl.style.display = 'block';
    catEl.style.opacity = '1';
    catEl.style.left = '0';
    catEl.style.top = '0';
    catEl.style.transform = `translate(${start.x}px, ${start.y}px)`;

    animationRunningRef.current = true;
    setIsWalking(true);

    try {
      // Phase 1: Appear near button, pause
      setPhase('starting');
      setDebugInfo('appearing near button');
      await wait(100);

      setPhase('paused-near-btn');
      setDebugInfo('paused near button (0.8s)');
      await wait(800);

      // Phase 2: Turn toward card (visual - just rotate head)
      setPhase('turning-to-card');
      setDebugInfo('turning toward card');
      walkingEl.classList.add('cat-head-looking-right');
      await wait(600);
      walkingEl.classList.remove('cat-head-looking-right');

      // Phase 3: Walk diagonally to card bottom-right
      setPhase('walking-to-card');
      setDebugInfo('walking to card');
      await animateMove(catEl, start, { x: cardApproachX, y: cardApproachY }, 3000);

      // Phase 4: Cross card (behind or front)
      setPhase('crossing-card');
      setDebugInfo(`crossing card: ${chosenRoute}`);

      if (chosenRoute === 'behind') {
        // Go behind card: move down behind card bottom, then left
        // First move down behind card
        await animateMove(catEl, { x: cardApproachX, y: cardApproachY }, { x: cardApproachX, y: crossY }, 800);
        // Cat is now behind card (z-index 9 < card z-index 10)
        // Move left behind card
        await animateMove(catEl, { x: cardApproachX, y: crossY }, { x: card.left - 50, y: crossY }, 2500);
        // Cat emerges from left side of card
        // Continue to exit
      } else {
        // Go in front of card: move up onto card surface, then left
        await animateMove(catEl, { x: cardApproachX, y: cardApproachY }, { x: cardApproachX, y: crossY }, 800);
        // Move left across card front
        await animateMove(catEl, { x: cardApproachX, y: crossY }, { x: card.left - 50, y: crossY }, 2500);
      }

      // Phase 5: Exit left
      setPhase('exiting-left');
      setDebugInfo('exiting left');
      await animateMove(catEl, { x: card.left - 50, y: crossY }, { x: exitX, y: exitY }, 2000);

      // Done
      setPhase('done');
      setDebugInfo('done');
      catEl.style.display = 'none';
      catEl.style.opacity = '0';
      animationRunningRef.current = false;
      setIsWalking(false);

    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.warn('Cat walk interrupted:', e);
        setDebugInfo('error: ' + e.message);
      }
      stopAnimation();
    }
  }, [enabled, animateMove, wait, stopAnimation]);

  // Start sequence (auto after 5s)
  const startSequence = useCallback(() => {
    if (sessionStartedRef.current || !enabled || prefersReducedMotionRef.current || userInteractingRef.current) {
      setDebugInfo('not starting: ' + (sessionStartedRef.current ? 'already started' : !enabled ? 'disabled' : prefersReducedMotionRef.current ? 'reduced-motion' : 'user interacting'));
      return;
    }

    sessionStartedRef.current = true;
    updateCardRect();
    updateStartPos();
    setDebugInfo('waiting 5s...');

    phaseTimeoutRef.current = window.setTimeout(() => {
      if (!document.hidden && !userInteractingRef.current && enabled && !prefersReducedMotionRef.current) {
        runWalkSequence();
      } else {
        setDebugInfo('blocked at timeout: ' + (document.hidden ? 'hidden' : userInteractingRef.current ? 'interacting' : !enabled ? 'disabled' : 'reduced-motion'));
        sessionStartedRef.current = false;
      }
    }, 5000);
  }, [enabled, runWalkSequence, updateCardRect, updateStartPos]);

  // Manual repeat
  const repeatWalk = useCallback(() => {
    if (!enabled) {
      setDebugInfo('repeat blocked: disabled - enable first');
      return;
    }
    if (prefersReducedMotionRef.current) {
      setDebugInfo('repeat blocked: reduced-motion');
      return;
    }
    sessionStartedRef.current = false;
    stopAnimation();
    updateCardRect();
    updateStartPos();
    setDebugInfo('manual repeat');
    runWalkSequence();
  }, [enabled, runWalkSequence, stopAnimation, updateCardRect, updateStartPos]);

  // Toggle enabled - FIX: call startSequence AFTER state update via effect
  const toggleEnabled = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (!newEnabled) {
      stopAnimation();
      sessionStartedRef.current = false;
    }
    // startSequence will be called by effect when enabled changes
  }, [enabled, stopAnimation]);

  // Effect to start sequence when enabled becomes true
  useEffect(() => {
    if (enabled && !sessionStartedRef.current && !animationRunningRef.current) {
      startSequence();
    }
  }, [enabled, startSequence]);

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    updateCardRect();
    updateStartPos();

    // Handle resize
    const handleResize = () => {
      updateCardRect();
      updateStartPos();
      if (isWalking) {
        stopAnimation();
        sessionStartedRef.current = false;
        setTimeout(startSequence, 1000);
      }
    };

    window.addEventListener('resize', handleResize);

    // Start sequence if enabled
    if (enabled) {
      startSequence();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, []); // Run once on mount

  // Render
  if (!enabled) {
    return (
      <div className="cat-walk-control" style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 100,
        pointerEvents: 'auto', display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', gap: '8px',
      }}>
        <button
          ref={controlButtonRef}
          type="button"
          onClick={toggleEnabled}
          style={{
            padding: '8px 12px', fontSize: '0.75rem', fontFamily: 'var(--font-serif)',
            color: '#888', background: '#f0f0f0', border: '2px solid #d8d4ca',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}
          aria-label="Включить анимацию кота"
        >
          🐱 Анимация: выкл
        </button>
        {prefersReducedMotionRef.current && (
          <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'var(--font-serif)', whiteSpace: 'nowrap' }}>
            ⚠ reduced-motion активен
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Cat layer - position:fixed, z-index 9 (below card z-index 10) */}
      <div
        ref={catContainerRef}
        className="cat-walk-container"
        style={{
          position: 'fixed',
          left: '0',
          top: '0',
          pointerEvents: 'none',
          zIndex: 9,
          display: 'block',
          opacity: 0,
          width: '140px',
          height: '90px',
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      >
        <div
          dangerouslySetInnerHTML={{ __html: CAT_SVG }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Debug info - TEMPORARY */}
      <div style={{
        position: 'fixed', bottom: '60px', right: '20px', zIndex: 101,
        background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 12px',
        fontSize: '0.7rem', fontFamily: 'monospace', borderRadius: '4px',
        pointerEvents: 'none', maxWidth: '250px', whiteSpace: 'pre-wrap',
      }}>
        {debugInfo}
      </div>

      {/* Control buttons - always visible when enabled */}
      <div
        className="cat-walk-control"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        <button
          ref={controlButtonRef}
          type="button"
          onClick={toggleEnabled}
          className="cat-control-toggle"
          style={{
            padding: '8px 12px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            color: enabled ? '#2d3a4f' : '#888',
            background: enabled ? '#ffe5d6' : '#f0f0f0',
            border: `2px solid ${enabled ? '#2d3a4f' : '#d8d4ca'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-label={enabled ? 'Отключить анимацию кота' : 'Включить анимацию кота'}
        >
          {enabled ? '🐱 Анимация: вкл' : '🐱 Анимация: выкл'}
        </button>

        {enabled && (
          <button
            type="button"
            onClick={repeatWalk}
            disabled={isWalking || prefersReducedMotionRef.current}
            className="cat-control-repeat"
            style={{
              padding: '6px 10px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-serif)',
              color: (isWalking || prefersReducedMotionRef.current) ? '#888' : '#2d3a4f',
              background: (isWalking || prefersReducedMotionRef.current) ? '#f0f0f0' : '#ffe5d6',
              border: `2px solid ${(isWalking || prefersReducedMotionRef.current) ? '#d8d4ca' : '#2d3a4f'}`,
              borderRadius: 'var(--radius-md)',
              cursor: (isWalking || prefersReducedMotionRef.current) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
              opacity: (isWalking || prefersReducedMotionRef.current) ? 0.6 : 1,
            }}
            aria-label={prefersReducedMotionRef.current ? 'Анимация отключена системной настройкой' : isWalking ? 'Подождите завершения' : 'Повторить прогулку кота'}
          >
            {prefersReducedMotionRef.current ? '⚠ reduced-motion' : '↻ Повторить'}
          </button>
        )}

        {prefersReducedMotionRef.current && (
          <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'var(--font-serif)', whiteSpace: 'nowrap', marginTop: '4px' }}>
            ⚠ reduced-motion активен
          </span>
        )}
      </div>
    </>
  );
}