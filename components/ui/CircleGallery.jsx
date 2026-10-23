import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { mountCircleGallery, BIM_PROJECTS } from '../circle-gallery.js';
import '../CircleGallery.css';

/**
 * React Bits Pro — Circle Gallery React Component
 * Registry Item: @reactbits-starter/circle-gallery-tw
 */
export const CircleGallery = forwardRef(function CircleGallery(
  {
    items = BIM_PROJECTS,
    circleRadius = '23%',
    radiusPercent = 23,
    itemWidth = 200,
    itemHeight = 250,
    itemScale = 0.85,
    borderRadius = 16,
    throwResistance = 0.35,
    animationDuration = 0.9,
    autoSpin = 10,
    enableDrag = true,
    showNumbers = true,
    onItemClick,
    className = '',
    style = {}
  },
  ref
) {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    rotateTo: (index) => controllerRef.current?.rotateTo(index),
    destroy: () => controllerRef.current?.destroy()
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    controllerRef.current = mountCircleGallery(containerRef.current, {
      items,
      circleRadius,
      radiusPercent,
      itemWidth,
      itemHeight,
      itemScale,
      borderRadius,
      throwResistance,
      animationDuration,
      autoSpin,
      enableDrag,
      showNumbers,
      onItemClick
    });

    return () => {
      controllerRef.current?.destroy();
    };
  }, [
    items,
    circleRadius,
    radiusPercent,
    itemWidth,
    itemHeight,
    itemScale,
    borderRadius,
    throwResistance,
    animationDuration,
    autoSpin,
    enableDrag,
    showNumbers,
    onItemClick
  ]);

  return (
    <div
      ref={containerRef}
      className={`circle-gallery-container ${className}`}
      style={style}
    />
  );
});

export default CircleGallery;
