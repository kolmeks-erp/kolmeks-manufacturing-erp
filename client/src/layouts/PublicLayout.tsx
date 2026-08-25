import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Factory, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  ArrowRight,
  Cpu,
  Boxes,
  Zap,
  Truck
} from 'lucide-react';
import { PUBLIC_NAV_ITEMS, ERP_BASE_PATH } from '../constants/navigation';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

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
      {/* Top Engineering Banner */}
      <div className="bg-industrial-950 text-slate-300 text-xs py-2 border-b border-slate-800">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-industrial-500" /> ISO 9001:2015 & ISO 14001 Certified Manufacturing
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <Factory className="w-3.5 h-3.5 text-industrial-500" /> Contract Manufacturing & Motor Component Engineering
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to={`${ERP_BASE_PATH}/login`}
              className="flex items-center gap-1 text-[11px] font-semibold text-industrial-500 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3" /> Secure ERP Portal
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <Container className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-industrial-900 flex items-center justify-center text-white shadow-md group-hover:bg-industrial-850 transition-colors">
              <Factory className="w-6 h-6 text-industrial-500" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-industrial-900 block leading-tight">
                KOLMEKS
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
                Manufacturing & Component Engineering
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {PUBLIC_NAV_ITEMS.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="relative group">
                    <button
                      className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                        isCapabilitiesActive ? 'text-industrial-700' : 'text-slate-700 hover:text-industrial-850'
                      }`}
                      onMouseEnter={() => setCapabilitiesOpen(true)}
                      onClick={() => setCapabilitiesOpen(!capabilitiesOpen)}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-industrial-700 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Capabilities Dropdown */}
                    <div className="absolute top-full left-0 w-72 bg-white rounded-lg border border-slate-200 shadow-industrial-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2 mt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                        Our Production Capabilities
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          to="/contract-manufacturing"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-industrial-50 text-slate-700 hover:text-industrial-900 transition-colors"
                        >
                          <Factory className="w-4 h-4 text-industrial-700" />
                          <div>
                            <div className="text-xs font-semibold">Contract Manufacturing</div>
                            <div className="text-[10px] text-slate-500">Turnkey production & assembly</div>
                          </div>
                        </Link>
                        <Link
                          to="/cnc-machining"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-industrial-50 text-slate-700 hover:text-industrial-900 transition-colors"
                        >
                          <Cpu className="w-4 h-4 text-industrial-700" />
                          <div>
                            <div className="text-xs font-semibold">CNC Machining</div>
                            <div className="text-[10px] text-slate-500">High-precision milling & turning</div>
                          </div>
                        </Link>
                        <Link
                          to="/assembly"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-industrial-50 text-slate-700 hover:text-industrial-900 transition-colors"
                        >
                          <Boxes className="w-4 h-4 text-industrial-700" />
                          <div>
                            <div className="text-xs font-semibold">Component Assembly</div>
                            <div className="text-[10px] text-slate-500">Sub-assemblies & testing</div>
                          </div>
                        </Link>
                        <Link
                          to="/electric-motors"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-industrial-50 text-slate-700 hover:text-industrial-900 transition-colors"
                        >
                          <Zap className="w-4 h-4 text-industrial-700" />
                          <div>
                            <div className="text-xs font-semibold">Electric Motors</div>
                            <div className="text-[10px] text-slate-500">Stators, rotors & windings</div>
                          </div>
                        </Link>
                        <Link
                          to="/supply-chain"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-industrial-50 text-slate-700 hover:text-industrial-900 transition-colors"
                        >
                          <Truck className="w-4 h-4 text-industrial-700" />
                          <div>
                            <div className="text-xs font-semibold">Supply Chain Solutions</div>
                            <div className="text-[10px] text-slate-500">Global sourcing & logistics</div>
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
                      ? 'text-industrial-700 font-bold border-b-2 border-industrial-700'
                      : 'text-slate-700 hover:text-industrial-850'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Action & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link to="/request-quote" className="hidden sm:inline-flex">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Request a Quote
              </Button>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 shadow-lg">
            {PUBLIC_NAV_ITEMS.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="space-y-1 py-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
                      Capabilities
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-industrial-700 rounded-md"
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
                  className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-industrial-700 rounded-md"
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

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Industrial Corporate Footer */}
      <footer className="bg-industrial-950 text-slate-300 border-t border-slate-800">
        <Container className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-industrial-850 flex items-center justify-center text-white">
                  <Factory className="w-5 h-5 text-industrial-500" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">KOLMEKS</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Global engineering partner specializing in custom component manufacturing, precision CNC machining, electric motor components, and industrial assembly.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-industrial-500" /> Industrial Technology Zone, Global Production Hub
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-industrial-500" /> info@kolmeks-manufacturing.com
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
                Capabilities
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/contract-manufacturing" className="hover:text-white transition-colors">Contract Manufacturing</Link></li>
                <li><Link to="/cnc-machining" className="hover:text-white transition-colors">CNC Machining</Link></li>
                <li><Link to="/assembly" className="hover:text-white transition-colors">Sub-Assembly</Link></li>
                <li><Link to="/electric-motors" className="hover:text-white transition-colors">Electric Motor Components</Link></li>
                <li><Link to="/supply-chain" className="hover:text-white transition-colors">Supply Chain Solutions</Link></li>
              </ul>
            </div>

            {/* Corporate */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
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

            {/* ERP Portal Link */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
                Internal Portal
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Authorized Kolmeks staff & operations ERP portal access.
              </p>
              <Link
                to={`${ERP_BASE_PATH}/login`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-industrial-900 border border-slate-800 hover:border-industrial-700 text-xs font-semibold text-white transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-industrial-500" /> Kolmeks ERP Operations
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © {new Date().getFullYear()} Kolmeks Manufacturing Group. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>ISO 9001:2015</span>
              <span>ISO 14001:2015</span>
              <Link to="/contact" className="hover:text-white">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white">Terms of Business</Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
