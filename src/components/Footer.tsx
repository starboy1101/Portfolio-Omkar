import { Bot, Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { openPortfolioAssistant } from '../data/assistantEvents';
import { portfolio, SECTION_LINKS } from '../data/portfolio';

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
} as const;

const Footer = () => (
  <footer className="border-t border-border bg-slate-950 py-14 text-slate-200">
    <div className="section-shell">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="max-w-md">
          <a href="#home" className="inline-flex min-h-11 items-center gap-3 rounded-xl font-bold text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-sm" aria-hidden="true">
              OM
            </span>
            {portfolio.profile.display_name}
          </a>
          <p className="mt-4 text-sm leading-6 text-slate-300">{portfolio.profile.positioning}</p>
          <button
            type="button"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-50"
            onClick={() =>
              openPortfolioAssistant({
                prompt: 'What should I explore next in Omkar’s portfolio?',
                autoSend: true,
              })
            }
          >
            <Bot className="size-4" aria-hidden="true" />
            Ask Omkar AI
          </button>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 lg:grid-cols-1">
            {SECTION_LINKS.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="inline-flex min-h-7 items-center text-sm text-slate-300 transition hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Connect</h2>
          <ul className="mt-4 space-y-1">
            {portfolio.profile.social_links.map((social) => {
              const Icon = socialIcons[social.id as keyof typeof socialIcons];
              if (!Icon) return null;
              return (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-300 transition hover:text-white"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {social.label}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href={`mailto:${portfolio.profile.contact.email}`}
                className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-300 transition hover:text-white"
              >
                <Mail className="size-4" aria-hidden="true" />
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {portfolio.profile.display_name}. All rights reserved.</p>
        <p>Built with React, TypeScript, Python, and an evidence-first AI assistant.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
