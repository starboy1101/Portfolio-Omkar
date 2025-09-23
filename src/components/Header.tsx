import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlassSurface from './GlassSurface';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#experience', label: 'Experience' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-2 w-full z-50">
      <GlassSurface 
        width="100%"
        height={80}
        borderRadius={40}
      >
        <div className="flex items-center h-16">
          {/* Left: Name */}
          <div className="absolute left-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Omkar Mahabdi
              </span>
            </motion.div>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden lg:flex space-x-8 mx-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: Theme + Menu */}
          <div className="absolute right-6 flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </GlassSurface>

      {/* Mobile Navigation Dropdown (Glass) */}
      {isMenuOpen && (
        <div className="mt-2 lg:hidden">
          <GlassSurface width="100%" height="auto" borderRadius={20}>
            <div className="grid grid-cols-3 gap-4 px-6 py-4 text-center">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="py-2 px-3 text-gray-700 dark:text-gray-300 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </GlassSurface>
        </div>
      )}
    </header>
  );
};

export default Header;