import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation, useHistory } from 'react-router-dom';
import type { Location } from 'history';

export const PageTransition: React.FC<{
  children: (location: Location) => React.ReactNode;
}> = ({ children }) => {
  const location = useLocation();
  const history = useHistory();

  const isBack = history.action === 'POP';
  const transitionClass = isBack ? 'page-transition-back' : 'page-transition';

  const stableKey = location.key || `${location.pathname}${location.search}`;

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={stableKey}
        classNames={transitionClass}
        timeout={{ enter: 200, exit: 150 }}
        mountOnEnter
        unmountOnExit
      >
        <div style={{ height: '100%' }}>{children(location)}</div>
      </CSSTransition>
    </TransitionGroup>
  );
};
