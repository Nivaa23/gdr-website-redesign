import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { mountDepthCarousel } from '../depth-carousel.js';

export const DepthCarousel = forwardRef(function DepthCarousel(props, ref) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = mountDepthCarousel(containerRef.current, props);
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
    pause: () => instanceRef.current?.pause(),
    resume: () => instanceRef.current?.resume()
  }));

  return (
    <div 
      ref={containerRef} 
      className={props.className || "depth-carousel-wrapper"}
      style={{ position: 'relative', width: '100%', ...props.style }}
    />
  );
});

DepthCarousel.displayName = "DepthCarousel";
export default DepthCarousel;
