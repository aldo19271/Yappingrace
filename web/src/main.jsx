import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { AppProvider } from './store.jsx';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <MotionConfig reducedMotion="user">
    <AppProvider>
      <App />
    </AppProvider>
  </MotionConfig>,
);
