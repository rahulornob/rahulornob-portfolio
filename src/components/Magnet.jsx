'use client';

import { useState, useEffect, useRef } from 'react';

const Magnet = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = e => {
      if (!magnetRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!magnetRef.current) return;

        const { left, top, width, height } =
          magnetRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distX = Math.abs(deltaX);
        const distY = Math.abs(deltaY);

        if (distX < width / 2 + padding && distY < height / 2 + padding) {
          setIsActive(true);
          setPosition({
            x: deltaX / magnetStrength,
            y: deltaY / magnetStrength
          });
        } else {
          setIsActive(false);
          setPosition({ x: 0, y: 0 });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [padding, disabled, magnetStrength]);

  const transitionStyle = isActive ? activeTransition : inactiveTransition;
  const renderedPosition = disabled ? { x: 0, y: 0 } : position;

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: 'relative', display: 'inline-block' }}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${renderedPosition.x}px, ${renderedPosition.y}px, 0)`,
          transition: transitionStyle,
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Magnet;
