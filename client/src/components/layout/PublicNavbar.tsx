import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { VentureLogo } from '../brand/VentureLogo';

const NAV_LINKS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Intelligence Loop', href: '#intelligence' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'FAQ', href: '#faq' },
];

export const PublicNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-[72px]">
            {/* Clickable Brand Logo */}
            <VentureLogo to="/" theme="dark" size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-md hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Deploy Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle Navigation Menu"
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[72px] left-0 right-0 bg-slate-950 border-b border-slate-800 shadow-xl p-5 space-y-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-md"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-800 rounded-md hover:bg-slate-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
              >
                <span>Deploy Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
