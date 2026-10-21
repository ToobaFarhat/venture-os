import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Menu, X, Zap, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "AI Capabilities", href: "#ai", icon: true },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const PublicNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/70 group-hover:scale-105 transition-all duration-200">
                V
              </div>
              <div className="leading-none">
                <span className="text-[17px] font-extrabold tracking-tight text-white">
                  Venture<span className="text-indigo-400">OS</span>
                </span>
                <span className="block text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold mt-0.5">
                  Intelligent BI
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-150 group"
                >
                  {link.icon && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-px h-5 bg-white/10" />
              <Link to="/login">
                <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-150">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-px transition-all duration-150">
                  <Zap className="w-3.5 h-3.5" />
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[68px] left-0 right-0 bg-slate-950 border-b border-white/10 shadow-2xl animate-slide-down">
            <div className="px-5 py-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <button key={link.label} onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-all text-left">
                  {link.icon && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-300 border border-white/15 rounded-xl hover:border-indigo-500/50 transition-all">Sign In</button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg">
                    <ArrowRight className="w-4 h-4" />Get Started Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
