import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Sparkles, 
  Shirt, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar, 
  CheckCircle,
  X
} from 'lucide-react';
import { LocalService } from '../types/index.ts';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ServicesPageProps {
  openAuthModal: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ openAuthModal }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<LocalService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [city, setCity] = useState('Bengaluru');
  const [loading, setLoading] = useState(false);

  // Booking modal
  const [bookingModal, setBookingModal] = useState<LocalService | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (city) params.append('city', city);

      const data = await apiRequest<{ services: LocalService[] }>(`/api/services/local?${params.toString()}`);
      setServices(data.services);
    } catch (err) {
      console.error('Failed to load local services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, city]);

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setBookSuccess('Service booking requested! The service coordinator will call you to confirm your slot.');
    setTimeout(() => {
      setBookingModal(null);
      setBookSuccess(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 font-display">
          Essential Coliving & Relocation Services
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hassle-free move-in assistance, deep bathroom & flat cleaning, and doorstep laundry with upfront rates.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setSelectedCategory('MOVERS_PACKERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'MOVERS_PACKERS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            🚚 Movers & Packers
          </button>
          <button
            onClick={() => setSelectedCategory('HOUSEKEEPING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'HOUSEKEEPING'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ Deep Cleaning
          </button>
          <button
            onClick={() => setSelectedCategory('LAUNDRY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'LAUNDRY'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            🧺 Laundry & Steam Press
          </button>
        </div>

        <div className="w-44">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
          >
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading verified service partners...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={service.imageUrl || '/src/assets/images/property_modern_apartment_1791254862331.jpg'}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded">
                      {service.category.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">{service.city}</span>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        {service.rating} ({service.reviewsCount})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-950 font-display">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Starting from</div>
                    <div className="text-base font-black text-slate-950 tabular-nums">
                      ₹{service.startingPrice}
                      <span className="text-xs font-normal text-slate-500"> / {service.pricingUnit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingModal(service)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    Book Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 font-display">Book {bookingModal.title}</h3>
              <button onClick={() => setBookingModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {bookSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-bold">
                {bookSuccess}
              </div>
            ) : (
              <form onSubmit={handleBookService} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Service Date</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address & Instructions</label>
                  <textarea
                    rows={3}
                    required
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Provide flat number, society name, and any specific packing / cleaning requests..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-[11px]">
                  Estimated Starting Price: ₹{bookingModal.startingPrice} ({bookingModal.pricingUnit}). Final quote confirmed over call.
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  Confirm Service Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
