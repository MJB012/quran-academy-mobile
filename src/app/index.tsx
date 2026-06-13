import React, { useState } from 'react';

import Splash from '@/screens/splash/Splash';
import Welcome from '@/screens/welcome/Welcome';

export default function Index() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <Splash onDone={() => setReady(true)} />;
  }
  return <Welcome />;
}
