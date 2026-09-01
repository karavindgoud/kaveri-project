import React, { useEffect, useRef, useState } from 'react';

export const ColorCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const ripplesRef = useRef([]);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only run on devices with a mouse/fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = target.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer, tr, label');
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth lerp animation loop for trailing ring
    let animationFrameId;
    const updateRing = () => {
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(updateRing);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    animationFrameId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Outer Colorful Glow Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full transition-all duration-200 ease-out will-change-transform ${
          isHovered
            ? 'w-12 h-12 border-2 border-emerald-400 bg-emerald-400/20 shadow-[0_0_25px_rgba(16,185,129,0.7)] backdrop-blur-[1px]'
            : isClicking
            ? 'w-7 h-7 border-2 border-amber-300 bg-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
            : 'w-9 h-9 border border-amber-400/60 bg-gradient-to-tr from-amber-500/10 via-emerald-500/15 to-teal-400/20 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
        }`}
        style={{
          boxShadow: isHovered
            ? '0 0 30px rgba(52, 211, 153, 0.6), inset 0 0 15px rgba(251, 191, 36, 0.4)'
            : '0 0 18px rgba(212, 175, 55, 0.45)',
        }}
      />

      {/* Center Color Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full transition-transform duration-75 ease-out will-change-transform ${
          isHovered
            ? 'w-3 h-3 bg-gradient-to-r from-emerald-300 to-amber-300 shadow-[0_0_12px_#34d399]'
            : isClicking
            ? 'w-4 h-4 bg-gradient-to-r from-amber-400 to-rose-400 shadow-[0_0_15px_#f59e0b]'
            : 'w-2 h-2 bg-gradient-to-tr from-amber-300 via-yellow-200 to-emerald-400 shadow-[0_0_10px_rgba(254,240,138,0.9)]'
        }`}
      />
    </div>
  );
};
