import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Home, 
  Heart, 
  FileText, 
  Users, 
  MessageSquare, 
  CreditCard, 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  Eye, 
  Lock, 
  Send,
  Building,
  DollarSign,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Property, 
  PropertyApplication, 
  Booking, 
  PaymentTransaction, 
  Conversation, 
  Message, 
  Notification, 
  Report,
  RoommateProfile 
} from '../../types/index.ts';
import { apiRequest } from '../../services/api.ts';

interface UserDashboardProps {
  onSelectProperty?: (property: Property) => void;
  setCurrentTab: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onSelectProperty, setCurrentTab }) => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'profile'
    | 'my-listings'
    | 'saved'
    | 'applications'
    | 'messages'
    | 'bookings'
    | 'notifications'
    | 'reports'
    | 'security'
  >('overview');

  // State
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<PropertyApplication[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for Create Property
  const [createPropertyModal, setCreatePropertyModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'PG' | 'FLAT' | 'STUDIO' | 'ROOM'>('PG');
  const [newRoomType, setNewRoomType] = useState<'SINGLE' | 'DOUBLE' | 'TRIPLE'>('SINGLE');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE' | 'UNISEX' | 'ANY'>('ANY');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState(user?.city || 'Bengaluru');
  const [newArea, setNewArea] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAmenities, setNewAmenities] = useState('High-speed Wi-Fi, Power Backup, Geyser, Attached Bathroom, RO Purifier');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Complaint Form
  const [complaintTarget, setComplaintTarget] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<'FRAUD' | 'FAKE_LISTING' | 'ABUSIVE_BEHAVIOR' | 'INCORRECT_PRICING' | 'OTHER'>('INCORRECT_PRICING');
  const [complaintDesc, setComplaintDesc] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'PROPERTY_OWNER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        const propData = await apiRequest<{ properties: Property[] }>(`/api/properties?ownerId=${user.id}`);
        setMyProperties(propData.properties);
      }

      const savedData = await apiRequest<{ savedProperties: Property[] }>('/api/properties/saved/list');
      setSavedProperties(savedData.savedProperties);

      const bookData = await apiRequest<{ bookings: Booking[] }>('/api/bookings');
      setBookings(bookData.bookings);

      const convData = await apiRequest<{ conversations: Conversation[] }>('/api/messages/conversations');
      setConversations(convData.conversations);
      if (convData.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(convData.conversations[0]);
      }

      const notifData = await apiRequest<{ notifications: Notification[] }>('/api/notifications');
      setNotifications(notifData.notifications);

      const repData = await apiRequest<{ reports: Report[] }>('/api/reports/my');
      setReports(repData.reports);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const data = await apiRequest<{ messages: Message[] }>(`/api/messages/conversations/${selectedConversation.id}`);
        setMessages(data.messages);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessageText.trim() || !user) return;

    const otherParticipant = selectedConversation.participants.find(p => p.userId !== user.id);
    if (!otherParticipant) return;

    try {
      const data = await apiRequest<{ message: Message }>('/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: otherParticipant.userId,
          text: newMessageText.trim(),
        }),
      });
      setMessages(prev => [...prev, data.message]);
      setNewMessageText('');
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to send message.');
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const res = await apiRequest<{ message: string; property: Property }>('/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          propertyType: newType,
          roomType: newRoomType,
          genderPreference: newGender,
          address: newAddress,
          city: newCity,
          area: newArea,
          rentPerMonth: Number(newRent),
          securityDeposit: Number(newDeposit) || Number(newRent),
          description: newDesc,
          amenities: newAmenities.split(',').map(s => s.trim()),
          rules: ['No smoking inside rooms', 'Guests permitted till 8 PM', 'Quiet hours post 11 PM'],
          images: ['/src/assets/images/hero_roommitra_pg_1791254850665.jpg'],
        }),
      });
      setStatusMessage(res.message);
      setCreatePropertyModal(false);
      loadData();
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to create listing.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setStatusMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setStatusMessage(err.message || 'Password update failed.');
    }
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'PROPERTY',
          targetId: complaintTarget || 'GENERAL',
          targetTitleOrName: complaintTarget,
          category: complaintCategory,
          description: complaintDesc,
        }),
      });
      setStatusMessage('Grievance logged! A trust representative will review within 24 hours.');
      setComplaintTarget('');
      setComplaintDesc('');
      loadData();
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to submit grievance.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-slate-900 font-display">Please Sign In to Access Your Dashboard</h2>
        <p className="text-xs text-slate-500 mt-2">Manage your listings, roommate matches, applications, and bookings.</p>
      </div>
    );
  }

  const isOwner = user.role === 'PROPERTY_OWNER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* EXECUTIVE HEADER PANEL */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black font-display text-white">{user.name}</h1>
              <span className="text-[11px] font-extrabold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {user.role.replace('_', ' ')}
              </span>
              {user.isIdentityVerified ? (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> KYC Verified
                </span>
              ) : (
                <span className="text-amber-300 text-xs font-bold flex items-center gap-1 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">
                  Standard Resident
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-0.5">
              <span>{user.email}</span>
              {user.phone && <span>· {user.phone}</span>}
              <span>· {user.city || 'Bengaluru'}</span>
              {user.occupation && <span>· {user.occupation}</span>}
            </div>
          </div>
        </div>

        {/* Quick Dashboard Action CTA */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {isOwner && (
            <button
              onClick={() => setCreatePropertyModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Property</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('properties')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Explore Rooms
          </button>

          <button
            onClick={logout}
            className="px-3 py-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* DASHBOARD WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Resident Workspace
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-amber-500" />
              <span>Overview</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4 text-amber-500" />
              <span>Profile & Privacy</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('my-listings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'my-listings' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-amber-500" />
                <span>My Listings</span>
              </div>
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                {myProperties.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'saved' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-amber-500" />
              <span>Saved Shortlists</span>
            </div>
            <span className="text-slate-400 text-xs font-bold">{savedProperties.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'messages' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Messages</span>
            </div>
            {conversations.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {conversations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Bookings & Deposits</span>
            </div>
            <span className="text-slate-400 text-xs font-bold">{bookings.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'notifications' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Notifications</span>
            </div>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'reports' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Grievances & Reports</span>
            </div>
            <span className="text-slate-400 text-xs font-bold">{reports.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Security & Password</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Content Viewport */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs min-h-[540px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">Resident Activity Overview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status of your accommodation requests and applications</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase">
                    <span>Reserved Bookings</span>
                    <CreditCard className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-950 mt-2 tabular-nums">{bookings.length}</div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">₹5,000 Token Escrow Active</div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 uppercase">
                    <span>Shortlisted Rooms</span>
                    <Heart className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-950 mt-2 tabular-nums">{savedProperties.length}</div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">Saved for Quick Walkthrough</div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 uppercase">
                    <span>Active Inquiries</span>
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-950 mt-2 tabular-nums">{conversations.length}</div>
                  <div className="text-[11px] text-blue-800 font-semibold mt-1">Direct Landlord & Flatmate Chats</div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions for Today</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setCurrentTab('properties')}
                    className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-slate-900 text-xs group-hover:text-amber-800">Browse Rooms in {user.city}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Filter by Single PG & Coliving</div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('roommates')}
                    className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-800">Match Compatible Flatmates</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Filter by habits & sleep schedule</div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('tiffin')}
                    className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-800">Order Daily Tiffin Thali</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">FSSAI certified hot meals</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & PRIVACY */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">Resident Profile & Privacy Controls</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your credentials, workplace info, and public privacy preferences</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    defaultValue={user.occupation || ''}
                    onBlur={e => updateProfile({ occupation: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / College Name</label>
                  <input
                    type="text"
                    defaultValue={user.companyOrCollege || ''}
                    onBlur={e => updateProfile({ companyOrCollege: e.target.value })}
                    placeholder="e.g. Google Bengaluru, Symbiosis Pune"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    defaultValue={user.city || 'Bengaluru'}
                    onBlur={e => updateProfile({ city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={user.phone || ''}
                    onBlur={e => updateProfile({ phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Bio / About Yourself</label>
                  <textarea
                    rows={3}
                    defaultValue={user.bio || ''}
                    onBlur={e => updateProfile({ bio: e.target.value })}
                    placeholder="Introduce yourself to landlords and prospective roommates..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Privacy & Masking</h4>

                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mask Phone Number on Public Profile</div>
                    <div className="text-[11px] text-slate-500">Only verified users with active in-app chats can request your contact.</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={user.privacySettings.hidePhone}
                    onChange={e => updateProfile({ privacySettings: { ...user.privacySettings, hidePhone: e.target.checked } })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hide Personal Email Address</div>
                    <div className="text-[11px] text-slate-500">Prevent external broker spam by routing all inquiries through RoomMitra.</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={user.privacySettings.hideEmail}
                    onChange={e => updateProfile({ privacySettings: { ...user.privacySettings, hideEmail: e.target.checked } })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: MY LISTINGS (OWNERS) */}
          {activeTab === 'my-listings' && isOwner && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 font-display">My Property Listings</h2>
                  <p className="text-xs text-slate-500">Manage vacancies and track moderation review status</p>
                </div>
                <button
                  onClick={() => setCreatePropertyModal(true)}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>List New Property</span>
                </button>
              </div>

              {myProperties.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  You haven't listed any properties yet. Click "List New Property" to receive verified tenants.
                </div>
              ) : (
                <div className="space-y-4">
                  {myProperties.map(property => (
                    <div
                      key={property.id}
                      className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              property.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                              property.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {property.status}
                            </span>
                            <span className="text-xs text-slate-400">{property.propertyType} · {property.roomType}</span>
                          </div>
                          <h4 className="font-bold text-slate-950 text-sm">{property.title}</h4>
                          <div className="text-xs text-slate-500">{property.area}, {property.city}</div>
                          <div className="text-xs font-bold text-slate-900 tabular-nums">₹{property.rentPerMonth.toLocaleString('en-IN')}/mo</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectProperty && (
                          <button
                            onClick={() => onSelectProperty(property)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                          >
                            Preview Listing
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED PROPERTIES */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">Shortlisted Accommodations</h2>
                <p className="text-xs text-slate-500">Rooms and PGs you've saved for consideration</p>
              </div>

              {savedProperties.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No properties saved yet. Click the heart icon on any accommodation card to shortlist it here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedProperties.map(p => (
                    <div key={p.id} className="p-4 border border-slate-200 rounded-2xl flex gap-3 hover:shadow-xs transition-shadow">
                      <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{p.title}</h4>
                        <div className="text-[11px] text-slate-500">{p.area}, {p.city}</div>
                        <div className="text-xs font-black text-slate-950 tabular-nums">₹{p.rentPerMonth.toLocaleString('en-IN')}/mo</div>
                        {onSelectProperty && (
                          <button
                            onClick={() => onSelectProperty(p)}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 pt-1 block"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">In-App Private Messaging</h2>
                <p className="text-xs text-slate-500">Communicate directly with landlords and flatmates without sharing phone numbers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-slate-200 rounded-3xl overflow-hidden min-h-[460px]">
                {/* Conversation Threads Sidebar */}
                <div className="md:col-span-5 border-r border-slate-200 bg-slate-50 p-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase px-2 mb-2">Conversations</div>
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No active message threads yet.</div>
                  ) : (
                    conversations.map(conv => {
                      const other = conv.participants.find(p => p.userId !== user.id);
                      const isSelected = selectedConversation?.id === conv.id;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer ${
                            isSelected ? 'bg-white shadow-xs border border-slate-200 font-semibold' : 'hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-950 font-bold">{other?.name || 'Resident'}</span>
                            <span className="text-[10px] text-slate-400">{other?.role.toLowerCase()}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage || 'No messages'}</p>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Message Bubble History */}
                <div className="md:col-span-7 p-4 flex flex-col justify-between">
                  {selectedConversation ? (
                    <>
                      <div className="space-y-3 overflow-y-auto max-h-72 mb-4 pr-1">
                        {messages.map(m => {
                          const isMe = m.senderId === user.id;
                          return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                                isMe ? 'bg-slate-950 text-white rounded-br-none' : 'bg-slate-100 text-slate-900 rounded-bl-none'
                              }`}>
                                <div>{m.text}</div>
                                <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={e => setNewMessageText(e.target.value)}
                          placeholder="Type your response..."
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="text-center py-24 text-xs text-slate-400">
                      Select a conversation thread to view messages.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">Confirmed Bookings & Digital Receipts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your official token deposit receipts and move-in schedules</p>
              </div>

              {bookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No confirmed bookings yet. Reserve any room with a token deposit to secure your stay.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => (
                    <div key={b.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                            {b.status}
                          </span>
                          <span className="text-xs text-slate-400">Booking Ref: #{b.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-950 text-base">{b.propertyTitle}</h4>
                        <div className="text-xs text-slate-500">Move-in Date: {b.moveInDate} · Room: {b.roomType}</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-[11px] text-slate-500 font-medium">Token Escrow Paid</div>
                        <div className="text-xl font-black text-slate-950 tabular-nums">
                          ₹{b.depositAmount.toLocaleString('en-IN')}
                        </div>
                        <button
                          type="button"
                          onClick={() => setStatusMessage(`Official Deposit Receipt #${b.id} for "${b.propertyTitle}": ₹${b.depositAmount.toLocaleString('en-IN')} held in RoomMitra Escrow.`)}
                          className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 justify-end cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">Notification Center</h2>
                <p className="text-xs text-slate-500 mt-0.5">Application status updates, booking receipts, and trust alerts</p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                      <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-950 text-xs">{n.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: GRIEVANCES & REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">24-Hour Grievance Redressal Desk</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deposit disputes? Unreturned token? Report directly to RoomMitra trust officers with 24hr resolution SLA.
                </p>
              </div>

              <form onSubmit={handleFileComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property or Host Name</label>
                  <input
                    type="text"
                    required
                    value={complaintTarget}
                    onChange={e => setComplaintTarget(e.target.value)}
                    placeholder="e.g. Green Meadows Flat #201 or Host Rajesh Iyer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grievance Category</label>
                  <select
                    value={complaintCategory}
                    onChange={e => setComplaintCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="INCORRECT_PRICING">Incorrect Pricing / Hidden Maintenance</option>
                    <option value="FAKE_LISTING">Fake Images / Address Does Not Match</option>
                    <option value="FRAUD">Fraudulent Demands</option>
                    <option value="ABUSIVE_BEHAVIOR">Abusive Language</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Details & Desired Resolution</label>
                  <textarea
                    rows={3}
                    required
                    value={complaintDesc}
                    onChange={e => setComplaintDesc(e.target.value)}
                    placeholder="Detail the issue and what outcome you seek..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Submit Grievance to Trust Officers
                </button>
              </form>
            </div>
          )}

          {/* TAB 9: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950 font-display">Security & Credentials</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your password and review active authentication protection</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password (Min. 8 characters)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* CREATE PROPERTY LISTING MODAL */}
      {createPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-950 font-display text-lg">List New Accommodation</h3>
                <p className="text-xs text-slate-500">Reach thousands of background-checked working professionals</p>
              </div>
              <button onClick={() => setCreatePropertyModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Executive Single Room Coliving PG in HSR Layout"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="PG">Coliving PG</option>
                    <option value="FLAT">Full Flat</option>
                    <option value="STUDIO">Studio 1RK</option>
                    <option value="ROOM">Single Room</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={newRoomType}
                    onChange={e => setNewRoomType(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">2-Sharing</option>
                    <option value="TRIPLE">3-Sharing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="ANY">Any / Co-Ed</option>
                    <option value="MALE">Male Only</option>
                    <option value="FEMALE">Female Only</option>
                    <option value="UNISEX">Coliving Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area / Locality</label>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={e => setNewArea(e.target.value)}
                    placeholder="e.g. HSR Sector 2, Koramangala 4th Block"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="e.g. #42, 14th Main, Near Sony World Signal"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={newRent}
                    onChange={e => setNewRent(e.target.value)}
                    placeholder="14500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={e => setNewDeposit(e.target.value)}
                    placeholder="20000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={newAmenities}
                  onChange={e => setNewAmenities(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Detail room features, meals, study desk, Wi-Fi speed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-200/60">
                Notice: All listings require admin physical audit to earn the verified trust badge.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Submit Listing for Moderation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
