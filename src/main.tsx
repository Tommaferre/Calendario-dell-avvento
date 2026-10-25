import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { ConfigError } from './components/ConfigError.tsx';
import { contentErrors } from './content/index.ts';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>{contentErrors.length > 0 ? <ConfigError errors={contentErrors} /> : <App />}</StrictMode>,
);
