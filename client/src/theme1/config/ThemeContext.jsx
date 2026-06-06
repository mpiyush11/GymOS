import React, { createContext, useContext, useState, useEffect } from 'react';
import { themeConfig } from './mockData';

// Context to easily distribute the theme variables throughout the component tree
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // In production, this might fetch from an API if not SSR/SSG.
    // For now, we instantly load the mock contract.
    setConfig(themeConfig);
  }, []);

  if (!config) return <div>Loading Theme...</div>;

  return (
    <ThemeContext.Provider value={config}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeConfig = () => useContext(ThemeContext);