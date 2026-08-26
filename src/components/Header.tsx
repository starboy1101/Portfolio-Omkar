import { useEffect, useState } from 'react';
import { Bot, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio, SECTION_LINKS } from '../data/portfolio';
import GlassSurface from './GlassSurface';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-28% 0px -62% 0px', threshold: [0, 0.1, 0.5] },
    );

    SECTION_LINKS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const askAi = () => {
    setIsMenuOpen(false);
    openPortfolioAssistant({
      prompt: 'Give me a concise overview of Omkar’s experience and strongest projects.',
      autoSend: true,
      context: { sectionId: 'home' },
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 pt-3 sm:px-5" aria-label="Site header">
      <a
        href="#home"
        className="sr-only rounded-lg bg-surface px-4 py-3 font-semibold text-foreground shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to portfolio content
      </a>
      <div className="mx-auto max-w-7xl">
        <GlassSurface
          width="100%"
          height={76}
          borderRadius={18}
          darkMode={theme === 'dark'}
          backgroundOpacity={theme === 'dark' ? 0.58 : 0.68}
          saturation={1.35}
          blur={12}
          distortionScale={-90}
          greenOffset={6}
          blueOffset={12}
          className="border border-white/50 shadow-lg shadow-slate-950/10 dark:border-white/15"
        >
          <div className="flex h-full w-full items-center gap-3 px-2 sm:px-3">
            <a
              href="#home"
              className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl font-semibold text-foreground"
              aria-label={`${portfolio.profile.display_name}, home`}
            >
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-bold text-white"
                aria-hidden="true"
              >
                OM
              </span>
              <span className="hidden truncate sm:inline">{portfolio.profile.display_name}</span>
            </a>

            <nav className="mx-auto hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
              {SECTION_LINKS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={activeSection === item.id ? 'location' : undefined}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                    activeSection === item.id
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 xl:ml-0">
              <button type="button" className="button-primary hidden lg:inline-flex" onClick={askAi}>
                <Bot className="size-4" aria-hidden="true" />
                Ask Omkar AI
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="grid size-11 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:text-foreground"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? (
                  <Moon className="size-5" aria-hidden="true" />
                ) : (
                  <Sun className="size-5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:text-foreground xl:hidden"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isMenuOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </GlassSurface>

        {isMenuOpen && (
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={18}
            darkMode={theme === 'dark'}
            backgroundOpacity={theme === 'dark' ? 0.64 : 0.74}
            saturation={1.35}
            blur={12}
            distortionScale={-70}
            greenOffset={5}
            blueOffset={10}
            className="mt-2 border border-white/50 shadow-lg shadow-slate-950/10 dark:border-white/15 xl:hidden"
          >
            <nav
              id="mobile-navigation"
              className="w-full px-1 py-1"
              aria-label="Mobile navigation"
            >
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                {SECTION_LINKS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    aria-current={activeSection === item.id ? 'location' : undefined}
                    className={`flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium ${
                      activeSection === item.id
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <button type="button" className="button-primary mt-3 w-full lg:hidden" onClick={askAi}>
                <Bot className="size-4" aria-hidden="true" />
                Ask Omkar AI
              </button>
            </nav>
          </GlassSurface>
        )}
      </div>
    </header>
  );
};

export default Header;
