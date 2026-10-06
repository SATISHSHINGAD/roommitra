import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Home, 
  ShieldCheck, 
  User as UserIcon, 
  Menu, 
  X, 
  PlusCircle, 
  Bell, 
  LogOut,
  Sparkles,
  Building2,
  Users,
  UtensilsCrossed,
  Wrench,
  BookOpen
} from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { UserRole } from '../../types/index.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode?: 'LOGIN' | 'REGISTER', role?: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadNotifs(0);
      return;
    }
    const checkNotifs = async () => {
      try {
        const data = await apiRequest<{ unreadCount: number }>('/api/notifications');
        setUnreadNotifs(data.unreadCount || 0);
      } catch {
        // Ignored
      }
    };
    checkNotifs();
  }, [user, currentTab]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'find-rooms', label: 'Find Rooms', targetTab: 'properties' },
    { id: 'pg-hostel', label: 'PG / Hostel', targetTab: 'properties' },
    { id: 'roommates', label: 'Find Roommate', targetTab: 'roommates' },
    { id: 'tiffin', label: 'Tiffin', targetTab: 'tiffin' },
    { id: 'services', label: 'Services', targetTab: 'services' },
    { id: 'blog', label: 'Blog', targetTab: 'blog' },
  ];

  const handleNavClick = (targetTab: string) => {
    setCurrentTab(targetTab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleListProperty = () => {
    if (user) {
      setCurrentTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      openAuthModal('REGISTER', 'PROPERTY_OWNER');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`sticky top-[33px] z-40 transition-all duration-200 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/90' 
          : 'bg-white/90 backdrop-blur-sm border-b border-slate-200/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: RoomMitra Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer shrink-0"
          aria-label="RoomMitra Home"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-950 font-display leading-tight">
              Room<span className="text-amber-600">Mitra</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase -mt-0.5">
              Living Ecosystem
            </span>
          </div>
        </button>

        {/* Center: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-600">
          {navLinks.map(link => {
            const isActive = currentTab === (link.targetTab || link.id);
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.targetTab || link.id)}
                className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-amber-600 font-extrabold border-b-2 border-amber-600'
                    : 'hover:text-slate-950 text-slate-600'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Medium Screen Navigation (slightly compressed) */}
        <nav className="hidden lg:flex xl:hidden items-center gap-3.5 text-xs font-semibold text-slate-600">
          {navLinks.map(link => {
            const isActive = currentTab === (link.targetTab || link.id);
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.targetTab || link.id)}
                className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-amber-600 font-extrabold border-b-2 border-amber-600'
                    : 'hover:text-slate-950 text-slate-600'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleListProperty}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>List Your Property</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={() => handleNavClick('dashboard')}
                title="Notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 font-normal">({user.role.toLowerCase()})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('LOGIN')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Login
              </button>

              <button
                onClick={() => openAuthModal('REGISTER')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Register
              </button>

              <button
                onClick={handleListProperty}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
                <span>List Your Property</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile: Hamburger and Quick Action */}
        <div className="flex md:hidden items-center gap-2">
          {!user && (
            <button
              onClick={handleListProperty}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-amber-400 rounded-lg shadow-2xs whitespace-nowrap"
            >
              List Property
            </button>
          )}

          {user && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold"
              aria-label="Resident Dashboard"
            >
              <UserIcon className="w-4 h-4 text-amber-600" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Explore RoomMitra
          </div>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.targetTab || link.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === (link.targetTab || link.id)
                  ? 'bg-amber-50 text-amber-800 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={handleListProperty}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>List Your Property</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-slate-900 bg-slate-100 rounded-xl"
                >
                  My Resident Dashboard ({user.name})
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full text-left px-3 py-2 text-sm font-bold text-rose-700 bg-rose-50 rounded-xl"
                  >
                    Admin Control Center
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('LOGIN');
                  }}
                  className="w-full text-center px-4 py-2 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('REGISTER');
                  }}
                  className="w-full text-center px-4 py-2 text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-xl"
                >
                  Register
                </button>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="col-span-2 w-full text-center px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span>Admin Portal (/admin)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
