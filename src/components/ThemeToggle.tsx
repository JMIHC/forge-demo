import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`fixed top-4 right-4 z-10 rounded-full p-2.5 
                shadow-md border transition-colors
                ${theme === 'dark' 
                  ? 'bg-gray-800 text-yellow-300 border-gray-700' 
                  : 'bg-white text-gray-800 border-gray-300'}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
} 