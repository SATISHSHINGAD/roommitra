import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Filter, 
  Heart, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Send,
  CreditCard,
  Building,
  Sparkles
} from 'lucide-react';
import { Property, PropertyType, RoomType, GenderPreference } from '../types/index.ts';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface FindPropertiesPageProps {
  initialSearch?: { city: string; area: string; roomType: string; genderPreference: string };
  selectedPropertyModal?: Property | null;
  setSelectedPropertyModal: (property: Property | null) => void;
  openAuthModal: () => void;
}

export const FindPropertiesPage: React.FC<FindPropertiesPageProps> = ({
  initialSearch,
  selectedPropertyModal,
  setSelectedPropertyModal,
  openAuthModal,
}) => {
  const { user } = useAuth();

  // Filters state
  const [city, setCity] = useState(initialSearch?.city || 'Bengaluru');
  const [area, setArea] = useState(initialSearch?.area || '');
  const [propertyType, setPropertyType] = useState<string>('ALL');
  const [roomType, setRoomType] = useState<string>(initialSearch?.roomType || 'ANY');
  const [genderPreference, setGenderPreference] = useState<string>(initialSearch?.genderPreference || 'ANY');
  const [maxRent, setMaxRent] = useState<number>(30000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('');

  // Results
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Application & Booking state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyDate, setApplyDate] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('INCORRECT_PRICING');
  const [reportText, setReportText] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (area) params.append('area', area);
      if (propertyType !== 'ALL') params.append('propertyType', propertyType);
      if (roomType !== 'ANY') params.append('roomType', roomType);
      if (genderPreference !== 'ANY') params.append('genderPreference', genderPreference);
      if (maxRent) params.append('maxRent', String(maxRent));
      if (verifiedOnly) params.append('verifiedOnly', 'true');
      if (selectedAmenity) params.append('amenity', selectedAmenity);
      params.append('page', String(page));
      params.append('limit', '9');

      const data = await apiRequest<{ properties: Property[]; pagination: { totalPages: number } }>(
        `/api/properties?${params.toString()}`
      );
      setProperties(data.properties);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!user) return;
    try {
      const data = await apiRequest<{ savedProperties: Property[] }>('/api/properties/saved/list');
      setSavedIds(data.savedProperties.map(p => p.id));
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, propertyType, roomType, genderPreference, maxRent, verifiedOnly, selectedAmenity, page]);

  useEffect(() => {
    fetchSaved();
  }, [user]);

  const toggleSave = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await apiRequest<{ isSaved: boolean }>(`/api/properties/${propertyId}/save`, {
        method: 'POST',
      });
      if (res.isSaved) {
        setSavedIds(prev => [...prev, propertyId]);
      } else {
        setSavedIds(prev => prev.filter(id => id !== propertyId));
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const [actionError, setActionError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedPropertyModal) return;
    setActionError(null);

    try {
      await apiRequest(`/api/properties/${selectedPropertyModal.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          proposedMoveInDate: applyDate || selectedPropertyModal.availableFrom,
          durationMonths: 6,
          message: applyMessage,
        }),
      });
      setApplySuccess('Your visit request was dispatched to the landlord! They will contact you shortly.');
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess(null);
      }, 2000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit application.');
    }
  };

  const handleInstantBooking = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedPropertyModal) return;
    setActionError(null);

    try {
      await apiRequest('/api/bookings/create', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: selectedPropertyModal.id,
          moveInDate: selectedPropertyModal.availableFrom,
          tokenDepositAmount: 5000,
        }),
      });
      setBookingSuccess('Booking successfully reserved! Receipt generated in your Dashboard.');
      setTimeout(() => setBookingSuccess(null), 3500);
    } catch (err: any) {
      setActionError(err.message || 'Booking reservation could not be completed.');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedPropertyModal) return;
    setActionError(null);

    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'PROPERTY',
          targetId: selectedPropertyModal.id,
          targetTitleOrName: selectedPropertyModal.title,
          category: reportReason,
          description: reportText,
        }),
      });
      setReportSuccess('Report submitted to safety team for investigation.');
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(null);
      }, 2000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit safety report.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 font-display">
          Find Verified Rooms & Co-Living PGs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Direct from landlords. Zero broker fees, transparent deposits, and pre-screened properties.
        </p>
      </div>

      {/* Multi-facet Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">City</label>
            <select
              value={city}
              onChange={e => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          {/* Area search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Area / Locality</label>
            <div className="relative">
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchProperties(); } }}
                placeholder="e.g. Koramangala, Viman Nagar"
                className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => { setPage(1); fetchProperties(); }}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={e => { setPropertyType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="PG">Co-Living PG</option>
              <option value="FLAT">Full Apartment / Flat</option>
              <option value="STUDIO">1RK / Studio</option>
              <option value="ROOM">Single Room in Flat</option>
            </select>
          </div>

          {/* Room Occupancy */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Room Occupancy</label>
            <select
              value={roomType}
              onChange={e => { setRoomType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="ANY">Any Occupancy</option>
              <option value="SINGLE">Single Private Room</option>
              <option value="DOUBLE">Double Sharing</option>
              <option value="TRIPLE">Triple Sharing</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-center pt-2 border-t border-slate-100">
          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Gender Restriction</label>
            <select
              value={genderPreference}
              onChange={e => { setGenderPreference(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="ANY">Any / Co-Ed</option>
              <option value="MALE">Male Only</option>
              <option value="FEMALE">Female Only</option>
              <option value="UNISEX">Unisex / Coliving</option>
            </select>
          </div>

          {/* Max Rent Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase mb-1">
              <span>Max Monthly Rent</span>
              <span className="text-amber-600 tabular-nums">₹{maxRent.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="40000"
              step="1000"
              value={maxRent}
              onChange={e => setMaxRent(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Amenity Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Key Amenity</label>
            <select
              value={selectedAmenity}
              onChange={e => { setSelectedAmenity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">All Amenities</option>
              <option value="Wi-Fi">High-speed Wi-Fi</option>
              <option value="Air Conditioning">Air Conditioning (AC)</option>
              <option value="Power Backup">Power Backup</option>
              <option value="Meals">Food Included</option>
              <option value="Housekeeping">Daily Housekeeping</option>
              <option value="Washing Machine">Washing Machine</option>
            </select>
          </div>

          {/* Verified Only Toggle */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={verifiedOnly}
              onChange={e => { setVerifiedOnly(e.target.checked); setPage(1); }}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="verifiedOnly" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Only
            </label>
          </div>
        </div>
      </div>

      {/* Property Results List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{properties.length}</strong> available properties in {city}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading verified accommodations...</div>
        ) : properties.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No properties match your current filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try expanding your budget range or selecting "Any" room occupancy to see more options in {city}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => {
              const isSaved = savedIds.includes(property.id);
              return (
                <div
                  key={property.id}
                  onClick={() => setSelectedPropertyModal(property)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group relative"
                >
                  <div className="h-52 relative overflow-hidden bg-slate-100">
                    <img
                      src={property.images[0] || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
                      alt={property.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        {property.propertyType} · {property.roomType}
                      </span>
                      {property.isVerified && (
                        <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={(e) => toggleSave(property.id, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 transition-colors shadow-sm"
                      title={isSaved ? 'Remove from saved' : 'Save property'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                      {property.genderPreference}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{property.area}, {property.city}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-950 font-display line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {property.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {property.description}
                      </p>

                      {/* Key Amenities */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {property.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400">Monthly Rent</div>
                        <div className="text-lg font-black text-slate-950 tabular-nums">
                          ₹{property.rentPerMonth.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-slate-500"> /mo</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg group-hover:bg-amber-100 transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    {selectedPropertyModal.propertyType}
                  </span>
                  {selectedPropertyModal.isVerified && (
                    <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Physically Verified
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-950 font-display mt-1">
                  {selectedPropertyModal.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedPropertyModal.address}, {selectedPropertyModal.area}, {selectedPropertyModal.city}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPropertyModal(null)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Photo Showcase */}
              <div className="grid grid-cols-2 gap-2 h-64 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={selectedPropertyModal.images[0] || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
                  alt={selectedPropertyModal.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover col-span-2 sm:col-span-1"
                />
                <img
                  src={selectedPropertyModal.images[1] || selectedPropertyModal.images[0] || '/src/assets/images/property_modern_apartment_1791254862331.jpg'}
                  alt="Room detail"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hidden sm:block"
                />
              </div>

              {/* Pricing & Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Monthly Rent</div>
                  <div className="text-lg font-black text-slate-900 tabular-nums">
                    ₹{selectedPropertyModal.rentPerMonth.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Security Deposit</div>
                  <div className="text-lg font-black text-slate-900 tabular-nums">
                    ₹{selectedPropertyModal.securityDeposit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Room Type</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {selectedPropertyModal.roomType}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Available From</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {selectedPropertyModal.availableFrom}
                  </div>
                </div>
              </div>

              {bookingSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
                  {bookingSuccess}
                </div>
              )}

              {actionError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200">
                  {actionError}
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">About this Property</h4>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {selectedPropertyModal.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Included Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedPropertyModal.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">House Rules</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedPropertyModal.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Owner details */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-900 font-bold">Landlord / Host</div>
                  <div className="text-sm font-semibold text-slate-900">{selectedPropertyModal.ownerName}</div>
                  <div className="text-[11px] text-slate-500">Contact: {selectedPropertyModal.ownerPhone || 'In-App Messaging'}</div>
                </div>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Report Listing
                </button>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span>Zero Brokerage guaranteed · Direct Landlord Agreement</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Schedule Visit / Apply
                </button>
                <button
                  onClick={handleInstantBooking}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reserve Room (₹5,000 Deposit)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {applyModalOpen && selectedPropertyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-display">Schedule In-Person Walkthrough</h3>
              <button onClick={() => setApplyModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {applySuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-bold">
                {applySuccess}
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={applyDate}
                    onChange={e => setApplyDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message to Landlord</label>
                  <textarea
                    rows={3}
                    value={applyMessage}
                    onChange={e => setApplyMessage(e.target.value)}
                    placeholder="Introduce yourself, occupation, and move-in timeline..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  Submit Visit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      {reportModalOpen && selectedPropertyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-display">Report Property</h3>
              <button onClick={() => setReportModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-bold">
                {reportSuccess}
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="INCORRECT_PRICING">Wrong Rent / Hidden Fees</option>
                    <option value="FAKE_LISTING">Fake Photos / Property Doesn't Exist</option>
                    <option value="FRAUD">Scam / Unofficial Advance Payment Demand</option>
                    <option value="ABUSIVE_BEHAVIOR">Unresponsive or Abusive Host</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Details & Evidence</label>
                  <textarea
                    rows={3}
                    required
                    value={reportText}
                    onChange={e => setReportText(e.target.value)}
                    placeholder="Provide details regarding the issue..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                >
                  Submit Complaint
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
