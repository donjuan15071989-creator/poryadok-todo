import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * CatWalk - Decorative cat walking animation behind the main card
 *
 * Features:
 * - Proper walking cycle with legs, tail, body movement
 * - Goes behind the main white card (proper z-index layering)
 * - Trajectory calculated from actual card position via getBoundingClientRect
 * - Runs once per session with 5s delay
 * - Respects prefers-reduced-motion
 * - Pauses when user interacts with inputs
 * - Toggle control to enable/disable/repeat
 * - No React state per frame - uses CSS/Web Animations API
 */

// Cat SVG with separate animated parts
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
      @keyframes head-turn-left {
        0% { transform: rotateY(0deg); transform-origin: 30px 20px; }
        100% { transform: rotateY(45deg); transform-origin: 30px 20px; }
      }
      @keyframes head-turn-right {
        0% { transform: rotateY(45deg); transform-origin: 30px 20px; }
        100% { transform: rotateY(0deg); transform-origin: 30px 20px; }
      }
      @keyframes head-turn-center {
        0% { transform: rotateY(0deg); transform-origin: 30px 20px; }
        100% { transform: rotateY(-30deg); transform-origin: 30px 20px; }
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

      .cat-head-looking-left { animation: head-turn-left 0.5s ease-in-out forwards; }
      .cat-head-looking-right { animation: head-turn-right 0.5s ease-in-out forwards; }
      .cat-head-looking-center { animation: head-turn-center 0.5s ease-in-out forwards; }
    </style>
  </defs>

  <!-- Walking pose -->
  <g class="cat-walking" id="cat-walking">
    <!-- Tail -->
    <path class="cat-tail" d="M85 28 Q100 18 105 12 Q108 8 102 6"
          stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Body -->
    <ellipse class="cat-body" cx="55" cy="38" rx="26" ry="16"
             stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <!-- Head -->
    <circle class="cat-head" cx="28" cy="22" r="14"
            stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <!-- Ears -->
    <path class="cat-ear cat-ear-left" d="M18 12 L14 0 L22 8"
          stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path class="cat-ear cat-ear-right" d="M38 12 L42 0 L34 8"
          stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <!-- Eye -->
    <circle class="cat-eye" cx="23" cy="20" r="3" fill="#8b7d6b"/>
    <!-- Whiskers -->
    <path class="cat-whiskers" d="M16 21 L6 18 M16 23 L6 23 M16 25 L6 28"
          stroke="#8b7d6b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Front legs (near/far) -->
    <path class="cat-leg cat-leg-fl" d="M38 48 L35 62"
          stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cat-leg cat-leg-fr" d="M46 48 L49 62"
          stroke="#8b7d6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
    <!-- Back legs (near/far) -->
    <path class="cat-leg cat-leg-bl" d="M70 48 L74 62"
          stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cat-leg cat-leg-br" d="M78 48 L82 62"
          stroke="#8b7d6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
  </g>

  <!-- Sitting/looking pose -->
  <g class="cat-sitting" id="cat-sitting" style="display: none;">
    <!-- Tail curled beside body -->
    <path class="cat-tail-sit" d="M78 25 Q88 20 90 15 Q92 10 88 8"
          stroke="#8b7d6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Body sitting -->
    <ellipse class="cat-body-sit" cx="55" cy="42" rx="26" ry="18"
             stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <!-- Head -->
    <circle class="cat-head-sit" cx="28" cy="20" r="15"
            stroke="#8b7d6b" stroke-width="3" fill="none"/>
    <!-- Ears -->
    <path class="cat-ear cat-ear-sit cat-ear-left-sit" d="M17 9 L13 -1 L21 5"
          stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path class="cat-ear cat-ear-sit cat-ear-right-sit" d="M39 9 L43 -1 L35 5"
          stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <!-- Eye -->
    <circle class="cat-eye cat-eye-sit" cx="23" cy="18" r="3.5" fill="#8b7d6b"/>
    <!-- Whiskers -->
    <path class="cat-whiskers-sit" d="M15 19 L5 16 M15 21 L5 21 M15 23 L5 26"
          stroke="#8b7d6b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Front paws tucked -->
    <ellipse class="cat-paw-left" cx="35" cy="52" rx="7" ry="4"
             stroke="#8b7d6b" stroke-width="2.5" fill="none"/>
    <ellipse class="cat-paw-right" cx="48" cy="52" rx="7" ry="4"
             stroke="#8b7d6b" stroke-width="2.5" fill="none" opacity="0.7"/>
    <!-- Back legs folded -->
    <path class="cat-leg-back-sit" d="M70 42 Q78 50 82 42"
          stroke="#8b7d6b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="cat-leg-back2-sit" d="M78 42 Q86 50 90 42"
          stroke="#8b7d6b" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
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

interface CatWalkProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function CatWalk({ cardRef }: CatWalkProps) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('catWalkEnabled') !== 'false';
    }
    return true;
  });
  const [showControls, setShowControls] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'entering' | 'looking-user' | 'looking-card' | 'walking-to-card' | 'behind-card' | 'exiting-card' | 'walking-off' | 'done'>('idle');
  const [debugInfo, setDebugInfo] = useState<string>('init');

  const catContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRectRef = useRef<CardRect | null>(null);
  const sessionStartedRef = useRef(false);
  const userInteractingRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const animationRunningRef = useRef(false);

  // Update enabled state in localStorage
  useEffect(() => {
    localStorage.setItem('catWalkEnabled', enabled.toString());
  }, [enabled]);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches && isWalking) {
        stopAnimation();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isWalking]);

  // Track user interaction with inputs
  useEffect(() => {
    const handleFocus = () => { userInteractingRef.current = true; };
    const handleBlur = () => { userInteractingRef.current = false; };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isWalking) {
        pauseAnimation();
      } else if (!document.hidden && phase !== 'idle' && phase !== 'done') {
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
    setIsWalking(false);
    setPhase('idle');
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
    animationRunningRef.current = false;
  }, [cleanup]);

  // Helper: Animate position using Web Animations API
  const animatePosition = useCallback((el: HTMLElement, fromLeft: number, toLeft: number, duration: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!el) return reject(new Error('No element'));

      const anim = el.animate(
        [
          { transform: `translateX(${fromLeft}px)`, offset: 0 },
          { transform: `translateX(${toLeft}px)`, offset: 1 }
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

  // Main walk sequence using Web Animations API
  const runWalkSequence = useCallback(async () => {
    if (!enabled || prefersReducedMotionRef.current || !cardRectRef.current) {
      setDebugInfo('blocked: ' + (!enabled ? 'disabled' : prefersReducedMotionRef.current ? 'reduced-motion' : 'no-card-rect'));
      return;
    }
    if (animationRunningRef.current) {
      setDebugInfo('blocked: already running');
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

    // Calculate Y position - near bottom of card, cat height ~90px
    const catHeight = 90;
    const walkY = card.bottom - catHeight * 0.3;

    // X positions (relative to viewport, we'll use transform translateX)
    const startX = -100; // Off screen left
    const peekX = card.left - 20; // Just peeking
    const stopX = card.left + 40; // In front of card, looking at user
    const lookCardX = card.left + 40; // Same position, looking at card
    const walkToCardX = card.left - 10; // Walking to card edge
    const behindEndX = card.right + 50; // Exit right side
    const exitX = vw + 100; // Off screen right

    // Position cat at correct Y
    catEl.style.top = `${walkY}px`;
    catEl.style.left = '0';
    catEl.style.transform = 'translateX(0)';

    // Show walking pose initially
    walkingEl.style.display = 'block';
    sittingEl.style.display = 'none';
    catEl.style.display = 'block';
    catEl.style.opacity = '1';

    animationRunningRef.current = true;
    setIsWalking(true);

    try {
      // Phase 1: Enter from left, peek out
      setPhase('entering');
      setDebugInfo('entering');
      await animatePosition(catEl, startX, peekX, 2000);

      // Phase 2: Walk a bit more, stop
      setDebugInfo('approaching');
      await animatePosition(catEl, peekX, stopX, 1500);

      // Phase 3: Stop, look at user (turn head)
      setPhase('looking-user');
      setDebugInfo('looking at user');
      walkingEl.classList.add('cat-head-looking-left');
      await wait(1200);
      walkingEl.classList.remove('cat-head-looking-left');

      // Phase 4: Look at card (turn head other way)
      setPhase('looking-card');
      setDebugInfo('looking at card');
      walkingEl.classList.add('cat-head-looking-right');
      await wait(1000);
      walkingEl.classList.remove('cat-head-looking-right');

      // Phase 5: Walk to card edge
      setPhase('walking-to-card');
      setDebugInfo('walking to card');
      await animatePosition(catEl, lookCardX, walkToCardX, 1000);

      // Phase 6: Go behind card
      setPhase('behind-card');
      setDebugInfo('behind card');
      // Walk behind - just translate off left edge of card
      await animatePosition(catEl, walkToCardX, card.left - 60, 800);

      // Now cat is behind card - wait hidden
      catEl.style.opacity = '0';
      await wait(1500);

      // Phase 7: Emerge from right side of card
      setPhase('exiting-card');
      setDebugInfo('exiting card');
      catEl.style.opacity = '1';
      // Start from right edge of card
      await animatePosition(catEl, card.right + 10, behindEndX, 1000);

      // Phase 8: Walk off screen right
      setPhase('walking-off');
      setDebugInfo('walking off');
      await animatePosition(catEl, behindEndX, exitX, 2000);

      // Done
      setPhase('done');
      setDebugInfo('done');
      catEl.style.display = 'none';
      catEl.style.opacity = '0';
      catEl.style.transform = 'translateX(0)';
      animationRunningRef.current = false;
      setIsWalking(false);

    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.warn('Cat walk interrupted:', e);
        setDebugInfo('error: ' + e.message);
      }
      stopAnimation();
    }
  }, [enabled, animatePosition, wait, stopAnimation, cardRef]);

  // Start sequence after delay
  const startSequence = useCallback(() => {
    if (sessionStartedRef.current || !enabled || prefersReducedMotionRef.current || userInteractingRef.current) {
      setDebugInfo('not starting: ' + (sessionStartedRef.current ? 'already started' : !enabled ? 'disabled' : prefersReducedMotionRef.current ? 'reduced-motion' : 'user interacting'));
      return;
    }

    sessionStartedRef.current = true;
    updateCardRect();
    setDebugInfo('waiting 5s...');

    // Wait 5 seconds after load
    phaseTimeoutRef.current = window.setTimeout(() => {
      if (!document.hidden && !userInteractingRef.current && enabled && !prefersReducedMotionRef.current) {
        runWalkSequence();
      } else {
        setDebugInfo('blocked at timeout: ' + (document.hidden ? 'hidden' : userInteractingRef.current ? 'interacting' : !enabled ? 'disabled' : 'reduced-motion'));
        sessionStartedRef.current = false; // Allow retry
      }
    }, 5000);
  }, [enabled, runWalkSequence, updateCardRect]);

  // Manual repeat
  const repeatWalk = useCallback(() => {
    if (!enabled) {
      setDebugInfo('repeat blocked: disabled');
      return;
    }
    if (prefersReducedMotionRef.current) {
      setDebugInfo('repeat blocked: reduced-motion');
      return;
    }
    sessionStartedRef.current = false;
    stopAnimation();
    updateCardRect();
    setDebugInfo('manual repeat');
    runWalkSequence();
  }, [enabled, runWalkSequence, stopAnimation, updateCardRect]);

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (!newEnabled) {
      stopAnimation();
    } else {
      sessionStartedRef.current = false;
      startSequence();
    }
  }, [enabled, stopAnimation, startSequence]);

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    updateCardRect();

    // Handle resize
    const handleResize = () => {
      updateCardRect();
      if (isWalking) {
        stopAnimation();
        sessionStartedRef.current = false;
        setTimeout(startSequence, 1000);
      }
    };

    window.addEventListener('resize', handleResize);

    // Start sequence
    startSequence();

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, []); // Run once on mount

  // Render cat container
  if (!enabled) {
    return (
      <div className="cat-walk-control" style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 100,
        pointerEvents: 'auto',
      }}>
        <button
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
      </div>
    );
  }

  return (
    <>
      {/* Cat layer - positioned behind card but above background */}
      <div
        ref={catContainerRef}
        className="cat-walk-container"
        style={{
          position: 'fixed',
          left: '0',
          top: '0',
          pointerEvents: 'none',
          zIndex: 9, // Below card (z-index 10), above background
          display: 'block',
          opacity: 0,
          width: '140px',
          height: '90px',
          transition: 'opacity 0.3s ease',
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

      {/* Control button - positioned near footer */}
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
          type="button"
          onClick={toggleEnabled}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
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

        {showControls && enabled && (
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
      </div>
    </>
  );
}