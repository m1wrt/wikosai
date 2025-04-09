import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatAI from './ChatAI';
import { CssVarsProvider } from '@mui/joy/styles';

// Estilos globales para eliminar el scroll
const globalStyles = `
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <style>{globalStyles}</style>
    <CssVarsProvider>
      <ChatAI />
    </CssVarsProvider>
  </React.StrictMode>
);