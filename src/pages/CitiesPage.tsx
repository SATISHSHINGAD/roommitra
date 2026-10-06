import React from 'react';
import { MapPin, Building, IndianRupee, ArrowRight, ShieldCheck } from 'lucide-react';

interface CitiesPageProps {
  onSelectCity: (city: string) => void;
}

export const CitiesPage: React.FC<CitiesPageProps> = ({ onSelectCity }) => {
  const cityGuides = [
    {
      name: 'Bengaluru',
      state: 'Karnataka',
      tagline: 'Silicon Valley of India',
      avgRentSingle: '₹12,000 - ₹18,000',
      avgRentDouble: '₹7,500 - ₹10,500',
      hotspots: [
        { name: 'Koramangala', desc: 'Startup heartland, cafes, vibrant nightlife, close to Sony World' },
        { name: 'HSR Layout', desc: 'Prime tech residential hub, wide streets, close to Bellandur & Outer Ring Road' },
        { name: 'Indiranagar', desc: 'Metro connected, premier dining, lively pubs, upscale co-living studios' },
        { name: 'Whitefield', desc: 'ITPL and major corporate campuses, modern luxury gated co-living communities' },
      ],
      description: 'Bengaluru houses India’s highest concentration of early-stage software engineers, product designers, and VC-backed founders. Rental demand is high year-round.',
      image: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
    },
    {
      name: 'Pune',
      state: 'Maharashtra',
      tagline: 'Oxford of the East & Auto/IT Center',
      avgRentSingle: '₹9,000 - ₹14,000',
      avgRentDouble: '₹5,500 - ₹8,000',
      hotspots: [
        { name: 'Viman Nagar', desc: 'Symbiosis college hub, Phoenix Mall, walkable IT parks and greenery' },
        { name: 'Hinjawadi', desc: 'Phase 1-3 Rajiv Gandhi Infotech Park, master-planned co-living townships' },
        { name: 'Wakad / Baner', desc: 'Trendy young professional corridor with rapid highway connectivity' },
        { name: 'Koregaon Park', desc: 'Tree-lined lanes, artisanal bakeries, upscale independent rooms' },
      ],
      description: 'Pune offers exceptional weather, rich culture, and more affordable living costs compared to Mumbai. Preferred by both university students and mid-level techies.',
      image: '/src/assets/images/property_modern_apartment_1791254862331.jpg',
    },
    {
      name: 'Hyderabad',
      state: 'Telangana',
      tagline: 'Cyberabad & Pharmaceutical Hub',
      avgRentSingle: '₹10,000 - ₹15,000',
      avgRentDouble: '₹6,000 - ₹8,500',
      hotspots: [
        { name: 'Hitec City', desc: 'Cyber Towers, Mindspace, walking distance to Fortune 500 offices' },
        { name: 'Gachibowli', desc: 'Financial District, broad boulevards, ultra-modern high-rise PG stays' },
        { name: 'Madhapur', desc: 'Epicenter of youth culture, food trucks, and flexible co-living spaces' },
        { name: 'Kondapur', desc: 'Peaceful residential pocket with great supermarkets and hospitals' },
      ],
      description: 'Hyderabad combines world-class infrastructure and rapid transit with budget-friendly rental options and legendary culinary culture.',
      image: '/src/assets/images/roommate_community_lounge_1791254872925.jpg',
    },
    {
      name: 'Delhi NCR',
      state: 'Delhi / Haryana / UP',
      tagline: 'National Capital Region',
      avgRentSingle: '₹13,000 - ₹22,000',
      avgRentDouble: '₹8,000 - ₹12,000',
      hotspots: [
        { name: 'Cyber City (Gurugram)', desc: 'DLF CyberHub, executive coliving suites, rapid metro connectivity' },
        { name: 'Golf Course Road', desc: 'Super-premium luxury apartments, expat hubs, modern studio stays' },
        { name: 'Noida Sector 62', desc: 'Education & media tech cluster, very economical sharing accommodations' },
      ],
      description: 'Gurugram and Noida anchor corporate consulting, multinationals, and consumer tech in Northern India.',
      image: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 font-display">
          City Guides & Coliving Corridors
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed rental breakdown, neighborhood guides, and average living costs across India’s premier metros.
        </p>
      </div>

      <div className="space-y-12">
        {cityGuides.map(city => (
          <div
            key={city.name}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-5 h-64 lg:h-auto relative bg-slate-100">
              <img
                src={city.image}
                alt={city.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  {city.state}
                </span>
                <h3 className="text-2xl font-black font-display">{city.name}</h3>
                <p className="text-xs text-slate-300">{city.tagline}</p>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {city.description}
                </p>

                {/* Average Rent Benchmarks */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block">Avg. Single Room PG</span>
                    <strong className="text-slate-900 font-bold tabular-nums text-sm">{city.avgRentSingle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Avg. Double Sharing PG</span>
                    <strong className="text-slate-900 font-bold tabular-nums text-sm">{city.avgRentDouble}</strong>
                  </div>
                </div>

                {/* Hotspots */}
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Top Neighborhoods & Tech Parks:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {city.hotspots.map(h => (
                    <div key={h.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="font-bold text-slate-900">{h.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{h.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> All listings verified in-person
                </span>
                <button
                  onClick={() => onSelectCity(city.name)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Rooms in {city.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
