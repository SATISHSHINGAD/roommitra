import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Utensils, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Star, 
  Building2, 
  Calendar, 
  IndianRupee, 
  BadgeCheck, 
  Heart, 
  SlidersHorizontal, 
  TrendingUp, 
  CheckCircle2, 
  Coffee, 
  Home, 
  Lock, 
  Zap, 
  Clock, 
  ThumbsUp, 
  PhoneCall,
  Sparkle,
  BookOpen,
  Shirt,
  Compass,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  ArrowUpRight,
  PlusCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Property, TiffinProvider, UserRole, Banner, HomepageContent } from '../types/index.ts';
import { apiRequest } from '../services/api.ts';

interface HomePageProps {
  onSearch: (params: { city: string; area: string; roomType: string; genderPreference: string }) => void;
  featuredProperties: Property[];
  featuredTiffin: TiffinProvider[];
  onSelectProperty: (property: Property) => void;
  setCurrentTab: (tab: string) => void;
  openAuthModal?: (mode?: 'LOGIN' | 'REGISTER', role?: UserRole) => void;
}

interface PublicStats {
  verifiedListings: number;
  totalListings: number;
  registeredUsers: number;
  citiesCount: number;
  partnersCount: number;
  totalBookings: number;
  satisfactionRate: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  featuredProperties,
  featuredTiffin,
  onSelectProperty,
  setCurrentTab,
  openAuthModal,
}) => {
  // Universal Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState<
    'Rooms' | 'PG / Hostel' | 'Roommate' | 'Tiffin / Food' | 'Laundry' | 'Library' | 'Other'
  >('Rooms');

  // Dynamic Public Stats from API
  const [dynamicStats, setDynamicStats] = useState<PublicStats | null>(null);

  // Dynamic Admin-Managed Hero Configuration
  const [heroConfig, setHeroConfig] = useState<HomepageContent>({
    heroTitle: 'Everything You Need For Living, All In One Place.',
    heroSubtitle: 'Find rooms, PGs, hostels, roommates, tiffin, laundry and everyday living services — all from one trusted platform.',
    heroBadgeText: 'Zero Brokerage Guaranteed',
    heroImage: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
    primaryCtaText: 'Find Your Place',
    secondaryCtaText: 'List Your Property',
    statsConfig: {
      verifiedListings: '1,200+',
      activeUsers: '8,000+',
      citiesCovered: '15+',
      partnersCount: '50+',
      showStats: true,
    },
  });

  // Admin-Managed Ads & Banners
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);
  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);

  // Property Filter in Featured Section
  const [propertyCategory, setPropertyCategory] = useState<'ALL' | 'SINGLE' | 'FEMALE' | 'MALE' | 'FLAT'>('ALL');

  // Tiffin weekly day tab
  const [activeMenuDay, setActiveMenuDay] = useState(0);

  // FAQ Accordion Active Index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Fetch verified stats, hero config & banners from backend
  useEffect(() => {
    const fetchContentAndStats = async () => {
      try {
        const [statsRes, heroRes, bannersRes] = await Promise.all([
          apiRequest<{ stats: PublicStats }>('/api/properties/stats/public').catch(() => null),
          apiRequest<{ hero: HomepageContent }>('/api/content/hero').catch(() => null),
          apiRequest<{ banners: Banner[] }>('/api/content/banners').catch(() => null),
        ]);

        if (statsRes?.stats) {
          setDynamicStats(statsRes.stats);
        }
        if (heroRes?.hero) {
          setHeroConfig(prev => ({ ...prev, ...heroRes.hero }));
        }
        if (bannersRes?.banners) {
          setActiveBanners(bannersRes.banners);
        }
      } catch (err) {
        console.warn('Using baseline trust stats and content:', err);
      }
    };
    fetchContentAndStats();
  }, []);

  const handleAdClick = (ad: Banner) => {
    apiRequest(`/api/content/banners/${ad.id}/click`, { method: 'POST' }).catch(() => {});
    if (ad.targetTab) {
      setCurrentTab(ad.targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ad.ctaUrl) {
      const tab = ad.ctaUrl.replace(/^\//, '');
      if (tab) {
        setCurrentTab(tab);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const heroAd = activeBanners.find(b => b.placement === 'HERO');
  const topAlertAd = activeBanners.find(b => b.placement === 'TOP_ALERT' && b.id !== dismissedAlertId);
  const propsAd = activeBanners.find(b => b.placement === 'PROPERTIES');
  const tiffinAd = activeBanners.find(b => b.placement === 'TIFFIN');
  const roommatesAd = activeBanners.find(b => b.placement === 'ROOMMATES');
  const servicesAd = activeBanners.find(b => b.placement === 'SERVICES');
  const midpageAd = activeBanners.find(b => b.placement === 'MIDPAGE');

  const handleUniversalSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (category === 'Roommate') {
      setCurrentTab('roommates');
    } else if (category === 'Tiffin / Food') {
      setCurrentTab('tiffin');
    } else if (category === 'Laundry' || category === 'Library' || category === 'Other') {
      setCurrentTab('services');
    } else {
      let roomType = 'ANY';
      if (category === 'Rooms') roomType = 'SINGLE';
      if (category === 'PG / Hostel') roomType = 'DOUBLE';
      onSearch({ city, area: area || searchQuery, roomType, genderPreference: 'ANY' });
    }
  };

  const handleQuickChip = (chipCity: string, chipArea: string, chipType: string = 'ANY', chipGender: string = 'ANY') => {
    setCity(chipCity);
    setArea(chipArea);
    onSearch({ city: chipCity, area: chipArea, roomType: chipType, genderPreference: chipGender });
  };

  // Filtered properties for preview
  const filteredProperties = (featuredProperties || []).filter(p => {
    if (propertyCategory === 'SINGLE') return p.roomType === 'SINGLE';
    if (propertyCategory === 'FEMALE') return p.genderPreference === 'FEMALE';
    if (propertyCategory === 'MALE') return p.genderPreference === 'MALE';
    if (propertyCategory === 'FLAT') return p.propertyType === 'FLAT' || p.propertyType === 'STUDIO';
    return true;
  });

  const cityHubs = [
    {
      name: 'Bengaluru',
      state: 'Karnataka',
      tagline: 'Tech Capital · 180+ Hubs',
      avgRent: '₹12,500/mo',
      areas: 'Koramangala, HSR Layout, Indiranagar',
      image: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
      badge: 'Most Popular',
    },
    {
      name: 'Pune',
      state: 'Maharashtra',
      tagline: 'Student & IT Valley · 95+ Hubs',
      avgRent: '₹8,500/mo',
      areas: 'Viman Nagar, Hinjawadi, Wakad',
      image: '/src/assets/images/property_modern_apartment_1791254862331.jpg',
      badge: 'Best Value',
    },
    {
      name: 'Hyderabad',
      state: 'Telangana',
      tagline: 'Cyber Towers Hub · 110+ Hubs',
      avgRent: '₹9,800/mo',
      areas: 'Hitec City, Madhapur, Gachibowli',
      image: '/src/assets/images/roommate_community_lounge_1791254872925.jpg',
      badge: 'Rapid Growth',
    },
    {
      name: 'Delhi NCR',
      state: 'Delhi / Haryana',
      tagline: 'Corporate Hub · 140+ Hubs',
      avgRent: '₹14,000/mo',
      areas: 'Cyber City Gurugram, Sector 62',
      image: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
      badge: 'Metro Connected',
    },
  ];

  const tiffinWeeklyDays = [
    { day: 'Mon', lunch: '4 Phulkas, Paneer Butter Masala, Dal Tadka, Jeera Rice, Fresh Salad', dinner: '3 Methi Theplas, Aloo Jeera, Curd, Moong Dal Khichdi' },
    { day: 'Tue', lunch: '4 Phulkas, Mixed Veg Handi, Yellow Dal Fry, Steamed Rice, Gulab Jamun', dinner: '4 Rotis, Rajma Masala, Steamed Rice, Kachumber Salad' },
    { day: 'Wed', lunch: '4 Phulkas, Chana Masala, Gujarati Dal, Veg Pulao, Mint Raita', dinner: '3 Parathas, Dum Aloo, Curd, Roasted Papad' },
    { day: 'Thu', lunch: '4 Phulkas, Matar Paneer, Masoor Dal, Lemon Rice, Kheer', dinner: '4 Rotis, Bhindi Masala, Dal Makhani, Steamed Rice' },
    { day: 'Fri', lunch: '4 Phulkas, Palak Paneer, Dal Fry, Ghee Rice, Boondi Raita', dinner: 'Veg Biryani, Mirchi Salan, Cooling Raita, Rasgulla' },
  ];

  const quickCategories = [
    {
      id: 'rooms',
      icon: '🏠',
      title: 'Rooms',
      subtitle: 'Find furnished & semi-furnished rooms',
      action: () => {
        onSearch({ city, area: '', roomType: 'SINGLE', genderPreference: 'ANY' });
      },
      tag: 'Zero Brokerage',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'pg',
      icon: '🏢',
      title: 'PG / Hostel',
      subtitle: 'Affordable stays for students & professionals',
      action: () => {
        onSearch({ city, area: '', roomType: 'DOUBLE', genderPreference: 'ANY' });
      },
      tag: 'Meals & WiFi',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'roommates',
      icon: '👥',
      title: 'Roommates',
      subtitle: 'Find compatible roommates',
      action: () => setCurrentTab('roommates'),
      tag: 'Match Algorithm',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'tiffin',
      icon: '🍱',
      title: 'Tiffin / Food',
      subtitle: 'Homely food near you',
      action: () => setCurrentTab('tiffin'),
      tag: 'FSSAI Verified',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'laundry',
      icon: '🧺',
      title: 'Laundry',
      subtitle: 'Affordable laundry services',
      action: () => setCurrentTab('services'),
      tag: 'Doorstep Pickup',
      tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      id: 'library',
      icon: '📚',
      title: 'Library',
      subtitle: 'Find study spaces nearby',
      action: () => setCurrentTab('services'),
      tag: '24/7 Silent Pods',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
  ];

  const faqs = [
    {
      question: "Is there truly zero brokerage on RoomMitra?",
      answer: "Yes, 100%. RoomMitra eliminates all unauthorized middleman brokers. Tenants connect directly with verified property owners, PG managers, and prospective roommates without paying a single rupee in commission fees."
    },
    {
      question: "How does RoomMitra verify rooms, PGs, and hostels?",
      answer: "Every approved listing undergoes an in-person physical audit by our local team to verify room dimensions, electrical amenities, washroom cleanliness, water supply, security protocols, and fire safety compliance."
    },
    {
      question: "How does the roommate compatibility matching work?",
      answer: "Our algorithm calculates compatibility across 8 critical lifestyle vectors: sleep routine (early riser vs night owl), cleanliness preferences, dietary choices (veg/non-veg), study/WFH hours, AC preferences, and workplace/college proximity."
    },
    {
      question: "Can I pause or customize my daily tiffin meal plan?",
      answer: "Absolutely. You can pause meal deliveries anytime with 4 hours notice via the dashboard when traveling or eating out. Unserved meals are automatically credited back to your account wallet."
    },
    {
      question: "How is my reservation token deposit protected?",
      answer: "Your token deposit (₹5,000) is held securely in escrow. It is only released to the property owner once you successfully inspect the space and receive keys on your move-in date. If the space does not match verified photos, you receive a 100% immediate refund."
    }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* ==================================================
          TOP ANNOUNCEMENT & PROMOTION BANNER (Managed by Admin)
          ================================================== */}
      {topAlertAd && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 px-4 py-2.5 sm:py-3 shadow-md border-b border-amber-600/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {topAlertAd.badgeText || 'SPECIAL OFFER'}
              </span>
              <span className="shrink-0 font-extrabold text-amber-950 bg-amber-400/60 px-2 py-0.5 rounded text-[11px]">
                {topAlertAd.sponsorName || 'RoomMitra Campus'}
              </span>
              <p className="font-bold truncate text-slate-950">
                {topAlertAd.title}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleAdClick(topAlertAd)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{topAlertAd.ctaText || 'Claim Deal'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlertId(topAlertAd.id)}
                className="p-1 rounded-lg hover:bg-amber-400/50 text-amber-950 font-bold transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          1. HERO SECTION (Dynamic & Admin-Configurable)
          ================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pb-24 bg-gradient-to-b from-amber-50/70 via-slate-50/50 to-white border-b border-slate-200/60">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headlines & Universal Search Box */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-300 shadow-xs text-xs font-semibold text-slate-800">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-amber-700">
                  {heroConfig.heroBadgeText || 'Zero Brokerage Guaranteed'}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">Complete Student & Coliving Ecosystem</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 font-display tracking-tight leading-[1.08]">
                  {heroConfig.heroTitle || 'Everything You Need For Living, All In One Place.'}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  {heroConfig.heroSubtitle || 'Find rooms, PGs, hostels, roommates, tiffin, laundry and everyday living services — all from one trusted platform.'}
                </p>
              </div>

              {/* Prominent Universal Search Box */}
              <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xl shadow-amber-900/5 space-y-3">
                {/* Search Text Input */}
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rooms, PGs, roommates, tiffin or services..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Search Controls: City, Area, Category, Action */}
                <form onSubmit={handleUniversalSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* City Select */}
                  <div className="sm:col-span-4 relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer appearance-none"
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kota">Kota</option>
                        <option value="Indore">Indore</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Area / Location */}
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                      Area / Location
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Koramangala, Hinjawadi"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  {/* Category Option */}
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer appearance-none"
                      >
                        <option value="Rooms">Rooms</option>
                        <option value="PG / Hostel">PG / Hostel</option>
                        <option value="Roommate">Roommate</option>
                        <option value="Tiffin / Food">Tiffin / Food</option>
                        <option value="Laundry">Laundry</option>
                        <option value="Library">Library</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search CTA buttons */}
                  <div className="sm:col-span-12 flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Search className="w-4 h-4 stroke-[2.5]" />
                      <span>Search {category}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSearch({ city, area: '', roomType: 'ANY', genderPreference: 'ANY' })}
                      className="py-3 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      {heroConfig.primaryCtaText || 'Find Your Place'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (openAuthModal) {
                          openAuthModal('REGISTER', 'PROPERTY_OWNER');
                        } else {
                          setCurrentTab('dashboard');
                        }
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{heroConfig.secondaryCtaText || 'List Your Property'}</span>
                    </button>
                  </div>
                </form>

                {/* Popular Trending Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">🔥 Trending:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickChip('Bengaluru', 'Koramangala', 'SINGLE')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Koramangala Single
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickChip('Pune', 'Hinjawadi', 'DOUBLE')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Hinjawadi IT Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('roommates')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors cursor-pointer"
                  >
                    HSR Flatmate Match
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('tiffin')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors cursor-pointer"
                  >
                    Homely Jain Tiffin
                  </button>
                </div>

                {/* Hero Promotional / Sponsored Ad Banner (Admin-Managed) */}
                {heroAd && (
                  <div
                    onClick={() => handleAdClick(heroAd)}
                    className="mt-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-emerald-500/10 border border-amber-300/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                          {heroAd.badgeText || 'Special Offer'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          {heroAd.sponsorName || 'RoomMitra Direct'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 group-hover:text-amber-800 transition-colors">
                        {heroAd.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {heroAd.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 group-hover:bg-amber-600 text-white font-extrabold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap"
                    >
                      <span>{heroAd.ctaText || 'Learn More'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Premium Visual Showcase (City Living + Modern PG + Roommates) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card with High-Res Interior */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-900/10 shadow-2xl bg-white group">
                  <img
                    src={heroConfig.heroImage || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
                    alt="Modern Coliving Room Bengaluru"
                    className="w-full h-80 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      100% In-Person Verified
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black shadow-sm">
                      ₹0 Brokerage
                    </span>
                  </div>

                  {/* Bottom Info on Image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                        Coliving Studio
                      </span>
                      <span className="text-xs text-amber-200 font-medium">HSR Layout, Bengaluru</span>
                    </div>
                    <h3 className="font-bold text-base text-white truncate">
                      Urban Oasis Luxury Executive PG
                    </h3>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs">
                      <div>
                        <span className="text-lg font-black text-amber-400">₹14,500</span>
                        <span className="text-slate-300"> / month</span>
                      </div>
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Meals & High-speed WiFi Included
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Social Proof Card (Bottom Left) */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl max-w-[210px] hidden sm:block animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                      98%
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Match Accuracy</div>
                      <div className="text-[10px] text-slate-500">Compatibility Test</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">
                    “Found my flatmate in 3 days in Hinjawadi!”
                  </div>
                </div>

                {/* Floating Services Badge (Top Right) */}
                <div className="absolute -top-4 -right-2 sm:-right-4 bg-slate-950 text-white p-3 rounded-2xl shadow-xl border border-slate-800 hidden sm:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-amber-400">Daily Tiffin Pass</div>
                    <div className="text-[10px] text-slate-400">Fresh Ghar Jaisa Khana</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. QUICK CATEGORY CARDS (Immediately Below Hero)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                All-In-One Living Ecosystem
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
                Explore Essential Categories
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              Click any category to browse curated verified options
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {quickCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={cat.action}
                className="group relative flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/30 transition-all duration-200 text-left hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-tight">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-950 text-sm group-hover:text-amber-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                  {cat.subtitle}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          3. TRUST / STATS SECTION (Dynamic from backend)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          {/* Subtle gradient pattern glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 text-center">
            {/* Stat 1: Verified Listings */}
            <div className="space-y-2 pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-display tabular-nums">
                {dynamicStats?.verifiedListings ? `${dynamicStats.verifiedListings.toLocaleString()}+` : '1,200+'}
              </div>
              <div className="text-sm font-bold text-slate-200">Verified Listings</div>
              <div className="text-xs text-slate-400">Physically audited spaces</div>
            </div>

            {/* Stat 2: Active Users */}
            <div className="space-y-2 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tabular-nums">
                {dynamicStats?.registeredUsers ? `${dynamicStats.registeredUsers.toLocaleString()}+` : '8,000+'}
              </div>
              <div className="text-sm font-bold text-slate-200">Residents & Seekers</div>
              <div className="text-xs text-slate-400">Active monthly community</div>
            </div>

            {/* Stat 3: Cities */}
            <div className="space-y-2 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-display tabular-nums">
                {dynamicStats?.citiesCount ? `${dynamicStats.citiesCount}+` : '15+'}
              </div>
              <div className="text-sm font-bold text-slate-200">Cities Across India</div>
              <div className="text-xs text-slate-400">Bengaluru, Pune, Hyderabad & more</div>
            </div>

            {/* Stat 4: Partners & Tiffin Providers */}
            <div className="space-y-2 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 font-display tabular-nums">
                {dynamicStats?.partnersCount ? `${dynamicStats.partnersCount}+` : '50+'}
              </div>
              <div className="text-sm font-bold text-slate-200">Verified Service Partners</div>
              <div className="text-xs text-slate-400">FSSAI kitchens, laundries, libraries</div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-time authenticated metrics from our verified operational database</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 font-medium">✓ Zero Middlemen</span>
              <span className="text-slate-300 font-medium">✓ Escrow Deposit Protection</span>
              <span className="text-slate-300 font-medium">✓ 24/7 Trust Desk</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. FEATURED LISTINGS ("Featured Places Near You")
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Verified Accommodations
            </span>
            <h2 className="text-3xl font-black text-slate-950 font-display mt-1">
              Featured Places Near You
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              In-person audited coliving rooms, single PGs, and shared apartments with zero brokerage.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'ALL', label: 'All Places' },
              { id: 'SINGLE', label: 'Single Rooms' },
              { id: 'FEMALE', label: 'Girls Only PG' },
              { id: 'MALE', label: 'Boys Only PG' },
              { id: 'FLAT', label: '1BHK & Flats' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPropertyCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  propertyCategory === tab.id
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin-Managed Properties Sponsored Featured Banner */}
        {propsAd && (
          <div
            onClick={() => handleAdClick(propsAd)}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 group cursor-pointer hover:border-amber-400/60 transition-all"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src={propsAd.imageUrl || '/src/assets/images/property_modern_apartment_1791254862331.jpg'}
                alt={propsAd.title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/20 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                    {propsAd.badgeText || 'Featured Partner'}
                  </span>
                  <span className="text-xs text-amber-200 font-bold">
                    {propsAd.sponsorName || 'StayAbode Co-Living'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">
                  {propsAd.title}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
                  {propsAd.subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <span>{propsAd.ctaText || 'View Listings'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.slice(0, 6).map((property) => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-200 flex flex-col group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img
                  src={property.images?.[0] || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {property.isVerified && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold shadow-xs">
                    {property.roomType} Room
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    {property.genderPreference}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{property.area}, {property.city}</span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Key Amenities */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {property.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                  {property.amenities.some(a => a.toLowerCase().includes('food') || a.toLowerCase().includes('meal')) && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                      🍱 Food Included
                    </span>
                  )}
                </div>

                {/* Price and CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-950 tabular-nums">
                        ₹{property.rentPerMonth.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/month</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">Zero Brokerage</div>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-950 group-hover:bg-amber-500 text-white group-hover:text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>View Place</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              onSearch({ city, area: '', roomType: 'ANY', genderPreference: 'ANY' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-all cursor-pointer"
          >
            <span>Browse All Available Rooms & PGs Across India</span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </section>

      {/* ==================================================
          5. TIFFIN & FOOD SERVICES ("Homely Daily Meals")
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl border border-amber-200/80 p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
                Doorstep Tiffin & Food
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
                Pure Home-Cooked Food, <br />
                Delivered Right On Time.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sick of greasy restaurant takeout? Subscribe to verified, FSSAI-certified local kitchens providing balanced, hygienic rotis, dal, sabzi, and fresh salads.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% FSSAI Inspected</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pause Delivery Anytime</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Veg, Jain & Non-Veg Kitchens</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Kitchen Chat & Reviews</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCurrentTab('tiffin')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Explore Weekly Tiffin Plans
                </button>
                <button
                  onClick={() => setCurrentTab('tiffin')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Order ₹80 Trial Dabba
                </button>
              </div>
            </div>

            {/* Right Weekly Menu Preview Box */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Weekly Standard Menu</h4>
                    <p className="text-[10px] text-slate-500">Curated by Annapurna Home Kitchens</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ₹2,800 / month
                </span>
              </div>

              {/* Day Switcher */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                {tiffinWeeklyDays.map((d, index) => (
                  <button
                    key={d.day}
                    onClick={() => setActiveMenuDay(index)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeMenuDay === index
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {d.day}
                  </button>
                ))}
              </div>

              {/* Menu Details for Selected Day */}
              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <div className="font-extrabold text-amber-800 uppercase tracking-wide text-[10px]">
                    ☀️ Lunch (Delivered 12:30 PM)
                  </div>
                  <p className="text-slate-700 mt-1 font-medium leading-relaxed">
                    {tiffinWeeklyDays[activeMenuDay].lunch}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="font-extrabold text-amber-800 uppercase tracking-wide text-[10px]">
                    🌙 Dinner (Delivered 8:00 PM)
                  </div>
                  <p className="text-slate-700 mt-1 font-medium leading-relaxed">
                    {tiffinWeeklyDays[activeMenuDay].dinner}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                Eco-friendly steel dabbas & reusable thermal packaging available in all metro cities.
              </div>
            </div>
          </div>

          {/* Admin-Managed Tiffin Sponsor Ad Banner */}
          {tiffinAd && (
            <div
              onClick={() => handleAdClick(tiffinAd)}
              className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={tiffinAd.imageUrl || '/src/assets/images/tiffin_food_thali_1791254883521.jpg'}
                  alt={tiffinAd.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-amber-200 shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {tiffinAd.badgeText || 'Certified Kitchen'}
                    </span>
                    <span className="text-xs text-slate-700 font-bold">
                      {tiffinAd.sponsorName || 'Annapurna Cloud Kitchens'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-950 group-hover:text-amber-700 transition-colors">
                    {tiffinAd.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {tiffinAd.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap"
              >
                <span>{tiffinAd.ctaText || 'Order Trial'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          6. FIND COMPATIBLE ROOMMATES ("Match Your Vibe")
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Compatibility Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
                Find a Roommate Who Actually <br />
                Matches Your Living Vibe.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                No more surprise conflicts over late-night noise, sink dishes, or AC temperatures. Filter flatmates based on sleep cycles, hygiene preferences, dietary habits, and college/workplace proximity.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="font-bold text-amber-400">🕒 Routine Match</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Early Bird vs Night Owl</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="font-bold text-emerald-400">🥗 Diet Respect</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Pure Veg or Non-Veg</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="font-bold text-cyan-400">💼 Proximity</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Tech Parks & Colleges</div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setCurrentTab('roommates')}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Take 2-Minute Compatibility Quiz
                </button>
                <button
                  onClick={() => setCurrentTab('roommates')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Browse 850+ Active Seekers
                </button>
              </div>
            </div>

            {/* Roommate Preview Card */}
            <div className="lg:col-span-5 bg-slate-800/90 backdrop-blur-md p-6 rounded-3xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-base">
                    AK
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Ananya & Kritika</h4>
                    <p className="text-[11px] text-slate-400">Looking in HSR Layout, Bengaluru</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-400">96%</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Match Score</div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget Range:</span>
                  <span className="font-bold text-white">₹8,000 – ₹12,000 / person</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sleep Schedule:</span>
                  <span className="font-bold text-amber-300">Night Owl (1 AM – 8 AM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Habit:</span>
                  <span className="font-bold text-white">Vegetarian friendly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Looking For:</span>
                  <span className="font-bold text-white">Female flatmate in 2BHK</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('roommates')}
                  className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all text-center"
                >
                  Connect & Chat Securely
                </button>
              </div>
            </div>
          </div>

          {/* Admin-Managed Roommates Sponsored Safety Ad Banner */}
          {roommatesAd && (
            <div
              onClick={() => handleAdClick(roommatesAd)}
              className="mt-8 p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-amber-400/50 transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-300">
                      {roommatesAd.badgeText || 'Safety Bureau'}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {roommatesAd.sponsorName || 'RoomMitra Trust Bureau'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                    {roommatesAd.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {roommatesAd.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shrink-0 flex items-center gap-1 whitespace-nowrap shadow-xs"
              >
                <span>{roommatesAd.ctaText || 'Learn More'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          MIDPAGE CAMPAIGN AD SECTION (Admin-Managed)
          ================================================== */}
      {midpageAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            onClick={() => handleAdClick(midpageAd)}
            className="relative rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-2xl bg-slate-950 p-8 sm:p-12 text-white group cursor-pointer"
          >
            <img
              src={midpageAd.imageUrl || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
              alt={midpageAd.title}
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-103 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                  {midpageAd.badgeText || 'Special Campaign'}
                </span>
                <span className="text-xs text-amber-300 font-semibold">
                  {midpageAd.sponsorName || 'RoomMitra Concierge'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white group-hover:text-amber-300 transition-colors">
                {midpageAd.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {midpageAd.subtitle}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <span>{midpageAd.ctaText || 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          7. ESSENTIAL LIVING SERVICES (Laundry, Library, Housekeeping)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Daily Living Convenience
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display mt-1">
            Essential Student & Living Services
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Everything you need outside your bedroom walls, managed with transparent student pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Laundry */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="/src/assets/images/laundry_clean_service_1791257196915.jpg"
                alt="Affordable Laundry Service"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-extrabold">
                Doorstep Pickup
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">
                  🧺 Express Wash, Fold & Iron
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Weight-based hygienic wash with 24-hour delivery. Ideal for hostelers and busy IT professionals.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-950">Starting ₹49/kg</span>
                <button
                  onClick={() => setCurrentTab('services')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  Schedule Pickup →
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Library & Study Pods */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="/src/assets/images/library_study_space_1791257186422.jpg"
                alt="Student Study Library Space"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-extrabold">
                24/7 Silent Zone
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">
                  📚 Quiet Study Spaces & Libraries
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Ergonomic study cubicles, dedicated high-speed fiber internet, AC, and unlimited power backup for exam prep and work.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-950">From ₹1,200/mo</span>
                <button
                  onClick={() => setCurrentTab('services')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  Book Seat →
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Deep Cleaning & Relocation */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="h-44 overflow-hidden relative">
              <img
                src="/src/assets/images/property_modern_apartment_1791254862331.jpg"
                alt="Housekeeping & Move-in"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                Verified Staff
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">
                  ✨ Housekeeping & Move-In Support
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Deep sanitization before move-in, monthly housekeeping subscriptions, and local mini-tempo shifting assistance.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-950">Fixed Student Rates</span>
                <button
                  onClick={() => setCurrentTab('services')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  View Services →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin-Managed Living Services Sponsor Banner */}
        {servicesAd && (
          <div
            onClick={() => handleAdClick(servicesAd)}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-900/10 via-slate-50 to-amber-500/10 border border-cyan-300/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={servicesAd.imageUrl || '/src/assets/images/laundry_clean_service_1791257196915.jpg'}
                alt={servicesAd.title}
                className="w-16 h-16 rounded-xl object-cover border border-cyan-200 shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                    {servicesAd.badgeText || 'Verified Partner'}
                  </span>
                  <span className="text-xs text-slate-600 font-bold">
                    {servicesAd.sponsorName || 'SpeedyMove Relocations'}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-cyan-800 transition-colors">
                  {servicesAd.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1">
                  {servicesAd.subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap"
            >
              <span>{servicesAd.ctaText || 'Claim Discount'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </section>

      {/* ==================================================
          8. HOW ROOMMITRA WORKS (4-Step Process)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Hassle-Free Flow
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How RoomMitra Works
          </h2>
          <p className="text-sm text-slate-500">
            From search to moving in and getting warm daily rotis delivered — done in four smooth steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
              1
            </div>
            <h3 className="font-extrabold text-slate-950 text-base">1. Search & Filter</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 100% verified rooms, PGs, and roommate seekers in your target city, neighborhood, and exact budget.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
              2
            </div>
            <h3 className="font-extrabold text-slate-950 text-base">2. Connect Directly</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chat directly with property owners and roommate prospects. Zero brokerage, zero spam, and no intermediary calls.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
              3
            </div>
            <h3 className="font-extrabold text-slate-950 text-base">3. Visit & Reserve</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Schedule a visit or lock your spot with a protected token deposit backed by our 100% money-back verification escrow.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs relative space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
              4
            </div>
            <h3 className="font-extrabold text-slate-950 text-base">4. Live Hassle-Free</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subscribe to doorstep home-cooked tiffins, high-speed WiFi, laundry pickups, and clean study lounges.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          9. WHY STUDENTS & PROFESSIONALS CHOOSE ROOMMITRA
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Why RoomMitra
            </span>
            <h2 className="text-3xl font-black text-white font-display">
              Built Specifically for Indian Students & Migrants
            </h2>
            <p className="text-sm text-slate-400">
              Traditional property portals treat young renters like an afterthought. We built an entire living ecosystem around you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-base">Zero Brokerage Ever</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save an average of ₹15,000 to ₹30,000 per move that brokers usually charge for simply showing a key.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-base">100% In-Person Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                No misleading wide-angle tricks. What you see on RoomMitra matches the physical room you move into.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-base">Vibe Matchmaking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with compatible flatmates based on shared habits, clean ethics, work schedules, and budget boundaries.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-base">Food & Daily Services</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                From home-cooked hot rotis to express laundry and 24/7 study desks — living is solved in one single app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          10. POPULAR CITIES (Bengaluru, Pune, Hyderabad, Delhi NCR)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Metro Networks
            </span>
            <h2 className="text-3xl font-black text-slate-950 font-display mt-1">
              Popular Cities for Living
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('cities')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All 15+ Cities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cityHubs.map((c) => (
            <div
              key={c.name}
              onClick={() => handleQuickChip(c.name, '')}
              className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  {c.badge}
                </span>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-extrabold text-lg leading-tight">{c.name}</h3>
                  <p className="text-[11px] text-slate-300">{c.state}</p>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{c.tagline}</div>
                  <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{c.areas}</div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.avgRent} avg</span>
                  <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          11. FAQ ACCORDION SECTION
          ================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Clear, upfront answers about deposits, verification, and our zero brokerage standard.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-slate-900 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          PARTNERS & ADVERTISERS NETWORK (Managed by Admin)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 text-center md:text-left max-w-xl relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider">
                Partner Network & Ads
              </span>
              <span className="text-xs text-slate-400">Reach Verified Renters</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">
              Own a PG, Tiffin Kitchen or Student Service?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Showcase your listings, run sponsored banner campaigns, and connect directly with over 8,000+ active residents looking for accommodation and food today.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => {
                if (openAuthModal) {
                  openAuthModal('REGISTER', 'PROPERTY_OWNER');
                } else {
                  setCurrentTab('pricing');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              List Property or Kitchen
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('pricing')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              View Partner Plans
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          12. COMMUNITY CALL-TO-ACTION BANNER
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black font-display leading-tight">
              Ready to Upgrade Your Living Experience?
            </h2>
            <p className="text-xs sm:text-sm font-medium text-amber-950/90 leading-relaxed">
              Join over 8,000+ happy tenants and property owners living hassle-free with zero brokerage and verified daily services across India.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => onSearch({ city, area: '', roomType: 'ANY', genderPreference: 'ANY' })}
              className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Search Places Near You
            </button>
            <button
              onClick={() => {
                if (openAuthModal) {
                  openAuthModal('REGISTER', 'PROPERTY_OWNER');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              className="px-6 py-3 rounded-xl bg-white hover:bg-amber-50 text-slate-950 font-extrabold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>List Your Property</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
