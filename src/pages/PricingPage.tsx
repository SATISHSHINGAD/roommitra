import React from 'react';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface PricingPageProps {
  setCurrentTab: (tab: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Fair & Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display">
          Zero Brokerage for Tenants, High Value for Hosts
        </h1>
        <p className="text-sm text-slate-600">
          We believe young professionals and students shouldn’t lose half a month’s salary on unearned middleman commissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Plan 1: Tenants / Roommates */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase tracking-wider">
              For Tenants & Roommates
            </span>
            <h3 className="text-2xl font-black text-slate-950 font-display">100% Free Forever</h3>
            <div className="text-3xl font-black text-slate-950 tabular-nums">
              ₹0 <span className="text-xs font-normal text-slate-500">/ forever</span>
            </div>
            <p className="text-xs text-slate-600">
              Browse unlimited rooms, connect directly with property owners, and match with KYC-verified roommates.
            </p>

            <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero brokerage fees on any booking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Direct in-app messaging with landlords</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>AI compatibility roommate matching algorithm</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Verified rent receipts for HRA tax exemption</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>24hr trust & grievance redressal</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => setCurrentTab('properties')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Start Searching for Free
            </button>
          </div>
        </div>

        {/* Plan 2: Landlords / PG Owners (Featured) */}
        <div className="bg-slate-950 text-white rounded-3xl border-2 border-amber-500 p-8 shadow-xl flex flex-col justify-between relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Most Popular for Hosts
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold bg-slate-800 text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider">
              Host Pro Verified
            </span>
            <h3 className="text-2xl font-black font-display">Verified Landlord</h3>
            <div className="text-3xl font-black tabular-nums text-white">
              ₹999 <span className="text-xs font-normal text-slate-400">/ 3 months</span>
            </div>
            <p className="text-xs text-slate-400">
              Fill room vacancies 3x faster with physically verified badge and top search ranking.
            </p>

            <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Official "Verified Host" green trust badge</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Priority placement in city search results</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Instant tenant enquiry SMS & email notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Token deposit collection gateway support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Digital rental agreement template</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
            >
              List Property as Verified Host
            </button>
          </div>
        </div>

        {/* Plan 3: Tiffin & Cloud Kitchens */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase tracking-wider">
              For Tiffin Kitchens
            </span>
            <h3 className="text-2xl font-black text-slate-950 font-display">Tiffin Kitchen Partner</h3>
            <div className="text-3xl font-black text-slate-950 tabular-nums">
              0% Fee <span className="text-xs font-normal text-slate-500">introductory offer</span>
            </div>
            <p className="text-xs text-slate-600">
              Deliver hot home-style meals to hundreds of young coliving tenants in your delivery zone.
            </p>

            <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Showcase weekly rotational meal menus</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Collect monthly subscription advances directly</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>FSSAI hygiene certification showcase</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dedicated delivery area routing</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Register Kitchen Partner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
