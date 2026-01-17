import React, { useEffect, useState } from 'react';
import App from './App';
import SharedView from './pages/SharedView';

const Router: React.FC = () => {
  const [route, setRoute] = useState<{ path: string; params?: any }>({ path: '/' });

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const shareMatch = path.match(/^\/share\/([a-zA-Z0-9]+)$/);
      
      if (shareMatch) {
        setRoute({ path: '/share', params: { shareId: shareMatch[1] } });
      } else {
        setRoute({ path: '/' });
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (route.path === '/share' && route.params?.shareId) {
    return <SharedView shareId={route.params.shareId} />;
  }

  return <App />;
};

export default Router;
