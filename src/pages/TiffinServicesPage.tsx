import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle, 
  X,
  CreditCard,
  ChefHat
} from 'lucide-react';
import { TiffinProvider } from '../types/index.ts';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface TiffinServicesPageProps {
  openAuthModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const TiffinServicesPage: React.FC<TiffinServicesPageProps> = ({ openAuthModal, setCurrentTab }) => {
  const { user } = useAuth();

  const [city, setCity] = useState('Bengaluru');
  const [dietType, setDietType] = useState('');
  const [providers, setProviders] = useState<TiffinProvider[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected for menu view or subscription
  const [selectedProvider, setSelectedProvider] = useState<TiffinProvider | null>(null);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [planType, setPlanType] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('LUNCH (12:30 PM - 1:30 PM)');
  const [subscribeSuccess, setSubscribeSuccess] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (dietType) params.append('dietType', dietType);

      const data = await apiRequest<{ providers: TiffinProvider[] }>(`/api/services/tiffin?${params.toString()}`);
      setProviders(data.providers);
    } catch (err) {
      console.error('Failed to load tiffin providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [city, dietType]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedProvider) return;

    try {
      setSubscribeError(null);
      await apiRequest('/api/services/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          providerId: selectedProvider.id,
          planType,
          address: deliveryAddress,
          deliverySlot,
        }),
      });
      setSubscribeSuccess(`Subscription confirmed! Your hot meals will start from tomorrow.`);
      setTimeout(() => {
        setSubscribeModalOpen(false);
        setSubscribeSuccess(null);
      }, 2500);
    } catch (err: any) {
      setSubscribeError(err.message || 'Failed to complete subscription.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <ChefHat className="w-4 h-4 text-amber-600" />
            Home-Style Tiffin Service
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 font-display">
            Daily Nutritious Ghar Ka Khana
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            FSSAI compliant, zero baking soda, low oil meals delivered in insulated containers across tech cities.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          Register as Tiffin Kitchen
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="w-48">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">City</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <div className="w-56">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Diet Type</label>
          <select
            value={dietType}
            onChange={e => setDietType(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All Diets</option>
            <option value="PURE_VEG">100% Pure Veg (Satvik)</option>
            <option value="JAIN_SPECIAL">Jain Special (No Onion/Garlic)</option>
            <option value="VEG_AND_NON_VEG">Veg & Non-Veg</option>
          </select>
        </div>
      </div>

      {/* Tiffin Providers Grid */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading hygienic tiffin kitchens...</div>
        ) : providers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No tiffin providers in this selection</h3>
            <p className="text-xs text-slate-500 mt-1">Try switching to All Diets or select another metro city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {providers.map(provider => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-52 relative overflow-hidden bg-slate-100">
                    <img
                      src={provider.imageUrl || '/src/assets/images/tiffin_food_thali_1791254883521.jpg'}
                      alt={provider.businessName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {provider.dietType.replace(/_/g, ' ')}
                      </span>
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> FSSAI: {provider.fssaiNumber}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{provider.hygieneRating} / 5</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950 font-display">
                        {provider.businessName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Serves: {provider.deliveryAreas.join(', ')} ({provider.city})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {provider.description}
                      </p>
                    </div>

                    {/* Sample Menu Teaser */}
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-200/60 text-xs">
                      <div className="font-bold text-amber-900 mb-1 flex items-center justify-between">
                        <span>Sample Weekly Menu:</span>
                        <span className="text-[11px] text-amber-700 font-normal">Fresh Rotis + Sabzi + Dal + Rice</span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {provider.sampleMenu[0]?.lunch || '4 Phulkas, Paneer Masala, Dal Tadka, Jeera Rice, Salad'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                  <div>
                    <div className="text-xs text-slate-400">Monthly Plan (Lunch + Dinner)</div>
                    <div className="text-lg font-black text-slate-950 tabular-nums">
                      ₹{provider.monthlySubscriptionPrice.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> /mo</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProvider(provider);
                      setSubscribeModalOpen(true);
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Subscribe to Meal Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {subscribeModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-950 font-display">
                  Subscribe to {selectedProvider.businessName}
                </h3>
                <p className="text-xs text-slate-500">FSSAI Certified Fresh Tiffins</p>
              </div>
              <button onClick={() => setSubscribeModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {subscribeSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-bold">
                {subscribeSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Subscription Term</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlanType('WEEKLY')}
                      className={`p-2.5 rounded-xl border text-center font-bold ${
                        planType === 'WEEKLY'
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <div>Weekly Trial (7 Days)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">₹{selectedProvider.pricePerMeal * 7}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanType('MONTHLY')}
                      className={`p-2.5 rounded-xl border text-center font-bold ${
                        planType === 'MONTHLY'
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <div>Monthly Pass (30 Days)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">₹{selectedProvider.monthlySubscriptionPrice}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Delivery Slot</label>
                  <select
                    value={deliverySlot}
                    onChange={e => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="LUNCH (12:30 PM - 1:30 PM)">Lunch Slot (12:30 PM - 1:30 PM)</option>
                    <option value="DINNER (7:30 PM - 8:30 PM)">Dinner Slot (7:30 PM - 8:30 PM)</option>
                    <option value="BOTH (LUNCH & DINNER)">Both Lunch & Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Address & Flat/PG No.</label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full flat address, floor number, society name..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  Payments are protected. If you are away on weekends, you can pause tiffin delivery via your Dashboard.
                </div>

                {subscribeError && (
                  <div className="p-2.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-lg border border-rose-200">
                    {subscribeError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Confirm & Activate Subscription</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
