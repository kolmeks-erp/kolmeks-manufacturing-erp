import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Factory, 
  Mail, 
  MapPin, 
  ArrowRight,
  Cpu,
  Boxes,
  Zap,
  Truck
} from 'lucide-react';
import { PUBLIC_NAV_ITEMS } from '../constants/navigation';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { KolmeksLogo } from '../components/ui/KolmeksLogo';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const location = useLocation();

  const isCapabilitiesActive = [
    '/contract-manufacturing',
    '/cnc-machining',
    '/assembly',
    '/electric-motors',
    '/supply-chain',
  ].some((path) => location.pathname === path);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <Container className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group" aria-label="Kolmeks Home">
            <KolmeksLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
            {PUBLIC_NAV_ITEMS.map((item) => {
              if (item.children) {
                return (
                  <div
                    key={item.label}
                    className="relative group"
                    onMouseEnter={() => setCapabilitiesOpen(true)}
                    onMouseLeave={() => setCapabilitiesOpen(false)}
                  >
                    <button
                      type="button"
                      aria-expanded={capabilitiesOpen}
                      className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 focus:outline-none focus:text-blue-700 ${
                        isCapabilitiesActive ? 'text-blue-700 font-bold' : 'text-slate-700 hover:text-blue-800'
                      }`}
                      onClick={() => setCapabilitiesOpen(!capabilitiesOpen)}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Capabilities Dropdown */}
                    <div
                      className={`absolute top-full left-0 w-72 bg-white rounded-lg border border-slate-200 shadow-xl transition-all duration-200 z-50 p-2 mt-1 ${
                        capabilitiesOpen
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 font-mono">
                        Production Capabilities
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          to="/contract-manufacturing"
                          onClick={() => setCapabilitiesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#0B1E36] transition-colors"
                        >
                          <Factory className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold">Contract Manufacturing</div>
                            <div className="text-[10px] text-slate-500">Turnkey component production</div>
                          </div>
                        </Link>
                        <Link
                          to="/cnc-machining"
                          onClick={() => setCapabilitiesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#0B1E36] transition-colors"
                        >
                          <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold">CNC Machining</div>
                            <div className="text-[10px] text-slate-500">High-precision milling & turning</div>
                          </div>
                        </Link>
                        <Link
                          to="/assembly"
                          onClick={() => setCapabilitiesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#0B1E36] transition-colors"
                        >
                          <Boxes className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold">Component Assembly</div>
                            <div className="text-[10px] text-slate-500">Electro-mechanical sub-assemblies</div>
                          </div>
                        </Link>
                        <Link
                          to="/electric-motors"
                          onClick={() => setCapabilitiesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#0B1E36] transition-colors"
                        >
                          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold">Electric Motors</div>
                            <div className="text-[10px] text-slate-500">Stators, rotors & windings</div>
                          </div>
                        </Link>
                        <Link
                          to="/supply-chain"
                          onClick={() => setCapabilitiesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 text-slate-700 hover:text-[#0B1E36] transition-colors"
                        >
                          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold">Supply Chain</div>
                            <div className="text-[10px] text-slate-500">Sourcing & buffer logistics</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-semibold transition-colors py-2 ${
                    isActive
                      ? 'text-blue-700 font-bold border-b-2 border-blue-700'
                      : 'text-slate-700 hover:text-blue-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link to="/request-quote" className="hidden sm:inline-flex">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Request a Quote
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 shadow-lg max-h-[85vh] overflow-y-auto">
            {PUBLIC_NAV_ITEMS.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="space-y-1 py-1 border-b border-slate-100">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                      Capabilities
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 rounded-md"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-700 rounded-md"
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link to="/request-quote" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Multi-Column Industrial Corporate Footer */}
      <footer className="bg-[#071220] text-slate-300 border-t border-slate-800">
        <Container className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <KolmeksLogo variant="dark-bg" size="md" />
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Global contract manufacturing partner specializing in precision CNC component fabrication, sub-assemblies, electric motor components, and industrial logistics.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Global Contract Manufacturing & Engineering Network
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> contact@kolmeks-manufacturing.com
                </div>
              </div>
            </div>

            {/* Capabilities Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2 font-mono">
                Capabilities
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/contract-manufacturing" className="hover:text-white transition-colors">Contract Manufacturing</Link></li>
                <li><Link to="/cnc-machining" className="hover:text-white transition-colors">CNC Machining</Link></li>
                <li><Link to="/assembly" className="hover:text-white transition-colors">Component Assembly</Link></li>
                <li><Link to="/electric-motors" className="hover:text-white transition-colors">Electric Motors</Link></li>
                <li><Link to="/supply-chain" className="hover:text-white transition-colors">Supply Chain Solutions</Link></li>
              </ul>
            </div>

            {/* Corporate Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2 font-mono">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Kolmeks</Link></li>
                <li><Link to="/quality" className="hover:text-white transition-colors">Quality Standards</Link></li>
                <li><Link to="/locations" className="hover:text-white transition-colors">Global Locations</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">News & Insights</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © {new Date().getFullYear()} Kolmeks Group. All rights reserved.
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <span>ISO 9001 Standards</span>
              <span>ISO 14001 Standards</span>
              <Link to="/contact" className="hover:text-white">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white">Terms of Business</Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
