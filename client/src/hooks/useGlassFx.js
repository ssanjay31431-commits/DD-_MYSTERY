import { useEffect, useLayoutEffect } from 'react';

const canUseDOM = typeof window !== 'undefined';
const useIsoLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

const prefersReducedMotion = () =>
  canUseDOM && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Desktop mice/trackpads only: touch screens get no tilt, magnet or cursor glow.
export const hasFinePointer = () =>
  canUseDOM && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Reveals every element marked with `data-reveal` as it scrolls into view
 * (fade + blur + rise). Mount once per layout; it also picks up elements
 * rendered later, such as products that finish loading.
 * Stagger by setting style={{ '--reveal-delay': '120ms' }} on the element.
 */
export function useScrollReveal() {
  useIsoLayoutEffect(() => {
    if (!canUseDOM || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return undefined;

    const root = document.documentElement;
    const observed = new WeakSet();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );

    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
    };

    scan();
    root.classList.add('reveal-ready');

    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
}

/** Runs `onMove` at most once per frame with the latest pointer event. */
function bindPointer(el, onMove, onLeave) {
  let frame = 0;
  let last = null;

  const handleMove = (event) => {
    last = event;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (last) onMove(last, el.getBoundingClientRect());
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = null;
    onLeave();
  };

  el.addEventListener('pointermove', handleMove);
  el.addEventListener('pointerleave', handleLeave);
  return () => {
    cancelAnimationFrame(frame);
    el.removeEventListener('pointermove', handleMove);
    el.removeEventListener('pointerleave', handleLeave);
  };
}

/**
 * 3D tilt with a light reflection that follows the cursor.
 * The element needs the `tilt` class and can hold a `.tilt-glare` child.
 */
export function useTilt(ref, { max = 8 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;

    return bindPointer(
      el,
      (event, rect) => {
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--tilt-x', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
      },
      () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      }
    );
  }, [ref, max]);
}

/**
 * Magnetic hover: the element leans slightly toward the cursor.
 * The element needs the `magnetic` class.
 */
export function useMagnetic(ref, { pull = 0.22, maxShift = 8, maxTilt = 6 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;

    const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

    return bindPointer(
      el,
      (event, rect) => {
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.setProperty('--mx', `${clamp(dx * pull, maxShift).toFixed(1)}px`);
        el.style.setProperty('--my', `${clamp(dy * pull, maxShift).toFixed(1)}px`);
        el.style.setProperty('--rx', `${clamp((-dy / rect.height) * maxTilt * 2, maxTilt).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${clamp((dx / rect.width) * maxTilt * 2, maxTilt).toFixed(2)}deg`);
      },
      () => {
        ['--mx', '--my', '--rx', '--ry'].forEach((prop) => el.style.removeProperty(prop));
      }
    );
  }, [ref, pull, maxShift, maxTilt]);
}

/** Accent colour (rgb channels) for a product, chosen from its occasion. */
export function productAccent(product = {}) {
  const text = [product.name, product.tagline, product.tag, product.category, product.categoryName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/marvel|avenger|hero/.test(text)) return '225, 29, 72';
  if (/anniversar|love|valentine|couple|romantic/.test(text)) return '244, 63, 94';
  if (/birthday|bday|party/.test(text)) return '255, 79, 163';
  if (/friend|bestie|buddy/.test(text)) return '61, 217, 255';
  if (/nostalgi|retro|90s|childhood|vintage/.test(text)) return '255, 184, 77';
  if (/diwali|festiv/.test(text)) return '255, 160, 60';
  return '124, 92, 255';
}
