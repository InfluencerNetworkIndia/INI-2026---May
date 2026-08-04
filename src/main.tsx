import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import MonopolyGame from './game/MonopolyGame.tsx';
import './index.css';

const isGameRoute = window.location.pathname.replace(/\/+$/, '') === '/game';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isGameRoute ? <MonopolyGame /> : <App />}
  </StrictMode>,
);
