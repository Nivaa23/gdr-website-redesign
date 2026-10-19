import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { mountNavigation14 } from '../navigation-14.js';
import '../Navigation14.css';

/**
 * React Bits Pro — Navigation 14 (Mega Panel Navigation with a Featured Card)
 * Registry item: @reactbits-pro/navigation-14
 */
export const Navigation14 = forwardRef(function Navigation14(props, ref) {
  const headerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const instance = mountNavigation14(headerRef.current, props);
    instanceRef.current = instance;
    return () => {
      instance?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => instanceRef.current?.open(),
    close: () => instanceRef.current?.close()
  }));

  return (
    <header 
      ref={headerRef} 
      className={`nav14-header ${props.className || ''}`} 
      id={props.id || "site-header"}
      style={props.style}
    >
      {props.children}
    </header>
  );
});

Navigation14.displayName = "Navigation14";
export default Navigation14;
