'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Shield, LogOut, Menu, X, QrCode, User, Building2, LayoutDashboard, Stethoscope, CreditCard, Pill, TestTube2, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { role, staffName, logout } = useApp();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const getNavLinks = () => {
    switch (role) {
      case 'ministry':
        return [
          { href: '/ministry', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/ministry/logistics', label: 'Logistics', icon: Building2 },
          { href: '/ministry/citizens/qr', label: 'QR Directory', icon: QrCode },
          { href: '/ministry/register-citizen', label: 'Register Citizen', icon: UserCheck },
          { href: '/ministry/register-institution', label: 'Register Facility', icon: Building2 },
        ];
      case 'admin':
        return [
          { href: '/institution', label: 'Institution Admin', icon: LayoutDashboard },
          { href: '/institution/register-staff', label: 'Register Staff', icon: UserCheck },
        ];
      case 'receptionist':
        return [{ href: '/receptionist', label: 'Reception & Check-in', icon: UserCheck }];
      case 'cashier':
        return [{ href: '/cashier', label: 'Cashier & Billing', icon: CreditCard }];
      case 'doctor':
        return [{ href: '/doctor', label: 'Clinical Workspace', icon: Stethoscope }];
      case 'pharmacy':
        return [{ href: '/pharmacy', label: 'Pharmacy Dispensing', icon: Pill }];
      case 'lab':
        return [{ href: '/lab', label: 'Lab Diagnostics', icon: TestTube2 }];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <header className="navbar-modern">
      <div className="navbar-inner">
        <Link href="/" className="nav-brand" aria-label="MedQR Home">
          <span className="nav-brand-mark"><Shield size={18} /></span>
          <span>MedQR</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          <Link
            href="/patient-portal/scan"
            className={`nav-link-item ${pathname === '/patient-portal/scan' ? 'active' : ''}`}
          >
            <QrCode size={15} />
            <span>Scan QR</span>
          </Link>

          {role ? (
            <>
              {links.map((link) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link-item ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent size={15} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="nav-user-badge">
                <User size={13} />
                <span>{staffName || role}</span>
              </div>

              <button
                className="nav-logout-btn"
                onClick={logout}
                title="Log out of your account"
                aria-label="Log out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.875rem' }}
            >
              Portal Login
            </Link>
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav className="nav-mobile-drawer" aria-label="Mobile Navigation">
          <Link
            href="/patient-portal/scan"
            className={`nav-link-item ${pathname === '/patient-portal/scan' ? 'active' : ''}`}
            style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}
          >
            <QrCode size={18} />
            <span>Patient Portal QR Scan</span>
          </Link>

          {role ? (
            <>
              <div
                className="nav-user-badge"
                style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <User size={16} />
                <span>Role: {staffName || role}</span>
              </div>

              {links.map((link) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link-item ${isActive ? 'active' : ''}`}
                    style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}
                  >
                    <IconComponent size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <button
                className="nav-logout-btn"
                onClick={logout}
                style={{ padding: '0.75rem 1rem', fontSize: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              Portal Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
