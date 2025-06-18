import { IonRouterOutlet } from '@ionic/react';
import { Route, useHistory } from 'react-router-dom';

export const setupNavigation = (routerOutlet: React.RefObject<HTMLIonRouterOutletElement>) => {
  const history = useHistory();

  const handleSwipe = (direction: 'forward' | 'backward') => {
    if (!routerOutlet.current) return;

    if (direction === 'forward') {
      history.push(history.location.pathname + '/next');
    } else {
      history.goBack();
    }
  };

  return {
    handleSwipe,
  };
}; 