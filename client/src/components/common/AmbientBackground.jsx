import React, { useEffect, useRef } from 'react';
import { hasFinePointer, useScrollReveal } from '../../hooks/useGlassFx';

/**
 * Fixed backdrop behind every customer page: drifting aurora orbs,
 * twinkling stars, a matte grain overlay, and (desktop only) a soft light
 * that follows the cursor. It also turns on scroll reveal for the page.
 */
export const AmbientBackground = () => {
  const glowRef = useRef(null);
  useScrollReveal();

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || !hasFinePointer() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;

    const handleMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        glow.classList.add('is-active');
      });
    };
    const handleLeave = () => glow.classList.remove('is-active');

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <>
      <div className="ambient" aria-hidden="true">
        <div className="aurora-orb aurora-orb--violet" />
        <div className="aurora-orb aurora-orb--cyan" />
        <div className="aurora-orb aurora-orb--magenta" />
        <div className="aurora-orb aurora-orb--gold" />
        <div className="starfield starfield--far" />
        <div className="starfield starfield--near" />
        <div className="grain" />
      </div>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
    </>
  );
};
