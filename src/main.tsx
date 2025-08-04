// Local: /a03/src/main.tsx

import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// CORREÇÃO APLICADA: Importação do CSS da biblioteca de telefone
import 'react-phone-input-2/lib/style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);