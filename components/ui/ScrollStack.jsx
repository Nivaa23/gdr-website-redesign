import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { mountScrollStack } from '../scroll-stack.js';
import '../ScrollStack.css';

/**
 * React Bits Pro — Scroll Stack Component
 * Registry Item: @reactbits-starter/scroll-stack-tw
 */
export const ScrollStack = forwardRef(function ScrollStack(props, ref) {
  const rootRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const instance = mountScrollStack(rootRef.current, props);
    instanceRef.current = instance;
    return () => {
      instance?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    update: () => instanceRef.current?.update()
  }));

  return (
    <div
      ref={rootRef}
      className={`scroll-stack ${props.useWindowScroll ? 'scroll-stack--window' : 'scroll-stack--contained'} ${props.className || ''}`.trim()}
      id={props.id}
    >
      <div className="scroll-stack__inner">
        {React.Children.map(props.children, (child, index) => (
          <div data-stack-slot="" className="scroll-stack__slot" key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

export const ScrollStackItem = ({ children, className = '', style }) => (
  <div className={`scroll-stack-card ${className}`.trim()} style={style}>
    {children}
    <span className="scroll-stack-card__shade" aria-hidden="true" />
  </div>
);

ScrollStack.displayName = "ScrollStack";
export default ScrollStack;
