import React from 'react';
import { ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-display">
                Room<span className="text-amber-500">Mitra</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              India's trusted co-living discovery network. Connecting verified tenants, landlords, compatible roommates, and hygienic tiffin partners across premier tech cities.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-300 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Listings
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 font-medium">
                Zero Brokerage
              </span>
            </div>
          </div>

          {/* Top Hubs */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Popular Hubs</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('properties')} className="hover:text-white transition-colors">
                  Bengaluru (Koramangala, HSR)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('properties')} className="hover:text-white transition-colors">
                  Pune (Viman Nagar, Hinjawadi)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('properties')} className="hover:text-white transition-colors">
                  Hyderabad (Hitec City, Gachibowli)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('properties')} className="hover:text-white transition-colors">
                  Delhi NCR (Gurugram, Noida)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('properties')} className="hover:text-white transition-colors">
                  Mumbai (Powai, Andheri)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Discovery */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Discovery & Stays</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('properties')} className="hover:text-white transition-colors">
                  Single Occupancy PGs
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('roommates')} className="hover:text-white transition-colors">
                  Roommate Matching Algorithm
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tiffin')} className="hover:text-white transition-colors">
                  FSSAI Tiffin Subscriptions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-white transition-colors">
                  Movers & Deep Cleaning
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('pricing')} className="hover:text-white transition-colors">
                  Host & Owner Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Trust & Policies</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('how-it-works')} className="hover:text-white transition-colors">
                  How RoomMitra Works
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy & Data Rights
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('refund')} className="hover:text-white transition-colors">
                  Refund & Security Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('community')} className="hover:text-white transition-colors">
                  Community Safety Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-white transition-colors">
                  Help & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('admin')} className="text-amber-500 hover:text-amber-400 transition-colors font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Portal (/admin)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} RoomMitra Living Technologies India Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for India's student & tech community
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
