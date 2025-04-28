import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  editorTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get initial theme from localStorage, system preference, or default to dark
  const [theme, setTheme] = useState<Theme>(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Then check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light if no preference
    return 'light';
  });
  
  // Derive editor theme from app theme
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';
  
  // Toggle between dark and light
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  
  // Listen for system theme changes if no user preference is set
  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  // Apply theme class to document body
  useEffect(() => {
    const body = document.body;
    body.classList.remove('dark', 'light');
    body.classList.add(theme);
    
    // Remove any existing theme styles
    const existingStyle = document.getElementById('monaco-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style element
    const style = document.createElement('style');
    style.id = 'monaco-theme-styles';
    
    if (theme === 'light') {
      style.innerHTML = `
        .monaco-editor { background-color: #ffffff !important; }
        .monaco-editor .margin { background-color: #f0f0f0 !important; }
      `;
    } else {
      style.innerHTML = `
        .monaco-editor { background-color: #1e1e1e !important; }
        .monaco-editor .margin { background-color: #252526 !important; }
      `;
    }
    
    document.head.appendChild(style);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, editorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 