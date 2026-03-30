import { useEffect, useState } from 'react';

const links = [
  { id: 'compare', label: 'Compare' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'pricing', label: 'Pricing' },
];

function Brand({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0">
      <img
        src="/tidb-mark.svg"
        alt="TiDB"
        className="h-7 w-7"
      />
      <span className="text-[1.1rem] font-bold tracking-[-0.03em] text-[#1d1d1f]">
        TiAdvisor
      </span>
    </button>
  );
}

export default function Navigation({ onLogoClick, currentView, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-black/5 bg-white/78 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container flex h-[72px] items-center justify-between">
        <Brand onClick={() => { onLogoClick(); window.scrollTo(0, 0); }} />

        <div className="hidden items-center gap-6 md:flex">
          {currentView !== 'home' && (
            <button
              type="button"
              onClick={() => { onLogoClick(); window.scrollTo(0, 0); }}
              className="bg-transparent border-none cursor-pointer text-[0.88rem] font-medium transition-colors text-slate-400 hover:text-slate-900 flex items-center gap-1"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </button>
          )}
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNav(link.id)}
              className={`bg-transparent border-none cursor-pointer text-[0.95rem] font-medium transition-colors ${
                currentView === link.id
                  ? 'text-[var(--color-primary)]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          <a
            href="https://tidbcloud.com"
            target="_blank"
            rel="noreferrer"
            className="nav-cta-pill"
          >
            Try TiDB Cloud
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/5 bg-white/92 backdrop-blur-xl md:hidden">
          <div className="section-container flex flex-col gap-4 py-5">
            {currentView !== 'home' && (
              <button
                type="button"
                onClick={() => { onLogoClick(); setMobileOpen(false); window.scrollTo(0, 0); }}
                className="bg-transparent border-none cursor-pointer text-left text-[0.98rem] font-medium text-slate-600 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </button>
            )}
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNav(link.id)}
                className={`bg-transparent border-none cursor-pointer text-left text-[0.98rem] font-medium ${
                  currentView === link.id ? 'text-[var(--color-primary)]' : 'text-slate-600'
                }`}
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://tidbcloud.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center rounded-full bg-[#1d1d1f] px-5 py-2 text-[0.85rem] font-medium text-white no-underline"
            >
              Try TiDB Cloud
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
