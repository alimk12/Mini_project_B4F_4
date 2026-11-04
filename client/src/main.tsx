import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './editor/monacoSetup';
import './styles/fonts.css';
import './styles/theme.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
