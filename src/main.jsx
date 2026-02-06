import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TimeProvider } from './contexts/TimeContext';
import './index.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <TimeProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </TimeProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
);