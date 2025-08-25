import React, { useEffect, useRef } from 'react';
import { createGesture, isPlatform } from '@ionic/react';
import type { Gesture } from '@ionic/core';
import { useHistory } from 'react-router-dom';

export const EdgeSwipeBack: React.FC = () => {
  const stripRef = useRef<HTMLDivElement>(null);
  const history = useHistory();

  useEffect(() => {
    if (!isPlatform('ios')) return;
    const el = stripRef.current;
    if (!el) return;

    let startX = 0;
    const gesture: Gesture = createGesture({
      el,
      gestureName: 'edge-swipe-back',
      threshold: 5,
      canStart: (ev) => {
        const withinEdge = ev.startX <= 24;
        const canGoBack = window.history.length > 1;
        return withinEdge && canGoBack;
      },
      onStart: (ev) => {
        startX = ev.startX;
      },
      onEnd: (ev) => {
        const dx = ev.currentX - startX;
        const vx = ev.velocityX;
        const shouldGoBack = dx > 60 || vx > 0.3;
        if (shouldGoBack) history.goBack();
      },
    });

    gesture.enable(true);
    return () => gesture.destroy();
  }, [history]);

  return (
    <div
      ref={stripRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 24,
        height: '100vh',
        zIndex: 9999,
        background: 'transparent',
      }}
    />
  );
};
