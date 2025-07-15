import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';

export const PageTransition: React.FC<{
  children: (location: any) => React.ReactNode;
}> = ({ children }) => {
  const location = useLocation();
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.key}
        classNames="page-transition"
        timeout={350}
      >
        <div style={{ height: '100%' }}>{children(location)}</div>
      </CSSTransition>
    </TransitionGroup>
  );
};
