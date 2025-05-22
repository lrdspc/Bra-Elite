import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="app">
    <header>
      <h1>Brasilit - Vistorias Técnicas</h1>
    </header>
    <main>
      <p>Bem-vindo ao sistema de vistorias técnicas da Brasilit.</p>
    </main>
    <footer>
      <p>© 2025 Brasilit - Saint-Gobain</p>
    </footer>
  </div>
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
