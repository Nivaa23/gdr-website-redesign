import React, { forwardRef, useRef, useEffect } from 'react';
import { mountAnimatedContent } from '../animated-content.js';

export const AnimatedContent = forwardRef(function AnimatedContent(
  {
    children,
    distance = 40,
    direction = 'vertical',
    duration = 1.0,
    delay = 0,
    stagger = 0.08,
    blur = 12,
    scale = 1,
    threshold = 0.1,
    once = true,
    className = '',
    style = {},
    ...props
  },
  ref
) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = mountAnimatedContent(containerRef.current, {
      distance,
      direction,
      duration,
      delay,
      stagger,
      blur,
      scale,
      threshold,
      once
    });

    return () => {
      instance?.destroy();
    };
  }, [distance, direction, duration, delay, stagger, blur, scale, threshold, once]);

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={`animated-content ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});

AnimatedContent.displayName = 'AnimatedContent';
export default AnimatedContent;
