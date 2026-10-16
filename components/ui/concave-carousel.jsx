import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { mountConcaveCarousel, JOURNEY_MILESTONES } from '../concave-carousel.js';

export const ConcaveCarousel = forwardRef(function ConcaveCarousel(props, ref) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = mountConcaveCarousel(containerRef.current, props);
    instanceRef.current = instance;
    return () => {
      instance?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    next: () => instanceRef.current?.next(),
    previous: () => instanceRef.current?.previous(),
    goTo: (idx) => instanceRef.current?.goTo(idx),
    sync: () => instanceRef.current?.sync()
  }));

  return (
    <div 
      ref={containerRef} 
      className={props.className || "concave-carousel-root"}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '560px', ...props.style }}
    />
  );
});

ConcaveCarousel.displayName = "ConcaveCarousel";
export default ConcaveCarousel;
export { JOURNEY_MILESTONES };
