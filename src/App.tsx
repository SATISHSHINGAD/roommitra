import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { DemoAccountBar } from './components/common/DemoAccountBar.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { FindPropertiesPage } from './pages/FindPropertiesPage.tsx';
import { FindRoommatesPage } from './pages/FindRoommatesPage.tsx';
import { TiffinServicesPage } from './pages/TiffinServicesPage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { CitiesPage } from './pages/CitiesPage.tsx';
import { PricingPage } from './pages/PricingPage.tsx';
import { InfoPages } from './pages/InfoPages.tsx';
import { UserDashboard } from './pages/dashboard/UserDashboard.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { Property, TiffinProvider, UserRole } from './types/index.ts';
import { apiRequest } from './services/api.ts';

function AppContent() {
  const { user, isAdmin } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authModalRole, setAuthModalRole] = useState<UserRole | undefined>(undefined);

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER' = 'LOGIN', role?: UserRole) => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  // Shared data
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredTiffin, setFeaturedTiffin] = useState<TiffinProvider[]>([]);
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);
  const [initialSearch, setInitialSearch] = useState<{ city: string; area: string; roomType: string; genderPreference: string } | undefined>(undefined);

  const handleSwitchTab = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (tab === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync /admin URL if path is /admin and handle back/forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'admin') {
        setCurrentTab('admin');
      } else if (!path) {
        setCurrentTab('home');
      } else {
        setCurrentTab(path);
      }
    };

    // Initial sync
    if (window.location.pathname === '/admin') {
      setCurrentTab('admin');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial featured listings
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const propData = await apiRequest<{ properties: Property[] }>('/api/properties?limit=6');
        setFeaturedProperties(propData.properties || []);

        const tifData = await apiRequest<{ providers: TiffinProvider[] }>('/api/services/tiffin');
        setFeaturedTiffin(tifData.providers || []);
      } catch (err) {
        console.error('Error fetching initial catalog:', err);
      }
    };
    fetchFeatured();
  }, []);

  const handleHeroSearch = (params: { city: string; area: string; roomType: string; genderPreference: string }) => {
    setInitialSearch(params);
    setCurrentTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPropertyFromHome = (prop: Property) => {
    setSelectedPropertyModal(prop);
    setCurrentTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // COMPLETELY SEPARATE ADMIN PANEL: When active, render the dedicated standalone Admin Shell
  if (currentTab === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminDashboard onBackToSite={() => handleSwitchTab('home')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1-Click Instant Demo Role Bar for Reviewers */}
      <DemoAccountBar onOpenAdmin={() => handleSwitchTab('admin')} />

      {/* Top Bar Contract Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSwitchTab}
        openAuthModal={handleOpenAuth}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onSearch={handleHeroSearch}
            featuredProperties={featuredProperties}
            featuredTiffin={featuredTiffin}
            onSelectProperty={handleSelectPropertyFromHome}
            setCurrentTab={handleSwitchTab}
            openAuthModal={handleOpenAuth}
          />
        )}

        {currentTab === 'properties' && (
          <FindPropertiesPage
            initialSearch={initialSearch}
            selectedPropertyModal={selectedPropertyModal}
            setSelectedPropertyModal={setSelectedPropertyModal}
            openAuthModal={() => handleOpenAuth('LOGIN')}
          />
        )}

        {currentTab === 'roommates' && (
          <FindRoommatesPage
            setCurrentTab={handleSwitchTab}
            openAuthModal={() => handleOpenAuth('LOGIN')}
          />
        )}

        {currentTab === 'tiffin' && (
          <TiffinServicesPage
            openAuthModal={() => handleOpenAuth('LOGIN')}
            setCurrentTab={handleSwitchTab}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPage openAuthModal={() => handleOpenAuth('LOGIN')} />
        )}

        {currentTab === 'cities' && (
          <CitiesPage
            onSelectCity={(cityName) => {
              handleHeroSearch({ city: cityName, area: '', roomType: 'ANY', genderPreference: 'ANY' });
            }}
          />
        )}

        {currentTab === 'pricing' && (
          <PricingPage setCurrentTab={handleSwitchTab} />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboard
            onSelectProperty={handleSelectPropertyFromHome}
            setCurrentTab={handleSwitchTab}
          />
        )}

        {(currentTab === 'how-it-works' ||
          currentTab === 'about' ||
          currentTab === 'contact' ||
          currentTab === 'faq' ||
          currentTab === 'terms' ||
          currentTab === 'privacy' ||
          currentTab === 'refund' ||
          currentTab === 'community' ||
          currentTab === 'blog') && (
          <InfoPages type={currentTab as any} />
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={handleSwitchTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        defaultRole={authModalRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
