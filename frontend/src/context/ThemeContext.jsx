import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme] = useState('dark'); // Forced dark mode

  const applyTheme = (newTheme) => {
    // Hardcoded to always apply dark
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  };

  useEffect(() => {
    applyTheme('dark');
  }, []);

  // No-op functions to prevent external toggling
  const noop = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'dark', setTheme: noop, toggleTheme: noop }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
