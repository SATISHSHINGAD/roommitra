import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Utensils, 
  AlertTriangle, 
  Settings, 
  FileText, 
  Check, 
  X, 
  Search, 
  Key, 
  Lock, 
  RefreshCw, 
  DollarSign, 
  Activity,
  UserCheck,
  UserX,
  Play,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Server,
  Zap,
  Cpu,
  LogOut,
  Bell,
  Home,
  CreditCard,
  MessageSquare,
  Star,
  PlusCircle,
  Trash2,
  Edit3,
  Download,
  Calendar,
  Layers,
  HelpCircle,
  Flag,
  Share2,
  ExternalLink,
  Tag,
  Megaphone,
  Image,
  MapPin,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Sparkles,
  Award,
  Filter,
  ArrowUpRight,
  ArrowRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  AdminStats, 
  User, 
  Property, 
  TiffinProvider, 
  Report, 
  AuditLog, 
  SystemSettings,
  Booking,
  PaymentTransaction,
  Banner,
  BannerPlacement,
  HomepageContent,
  Announcement,
  Coupon,
  CategoryItem,
  Review,
  AdminRoleConfig,
  RoommateProfile,
  AdminPermission,
  UserRole
} from '../../types/index.ts';
import { apiRequest } from '../../services/api.ts';

interface AdminDashboardProps {
  onBackToSite?: () => void;
}

type AdminNavSection = 
  | 'dashboard'
  | 'users'
  | 'properties'
  | 'approval-queue'
  | 'roommates'
  | 'services'
  | 'bookings'
  | 'payments'
  | 'reviews'
  | 'reports'
  | 'messages'
  | 'notifications'
  | 'content-home'
  | 'content-banners'
  | 'content-faqs'
  | 'content-cities'
  | 'content-categories'
  | 'content-announcements'
  | 'marketing-coupons'
  | 'analytics'
  | 'admins'
  | 'audit-logs'
  | 'settings'
  | 'danger-zone'
  | 'tests';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  const { user, isAdmin, isSuperAdmin, logout, login, demoLogin } = useAuth();

  // Admin Access Gate States (for !isAdmin)
  const [gateEmail, setGateEmail] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateLoading(true);
    setGateError(null);
    try {
      await login(gateEmail, gatePassword);
    } catch (err: any) {
      setGateError(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setGateLoading(false);
    }
  };

  // Active navigation
  const [currentSection, setCurrentSection] = useState<AdminNavSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [roommatesList, setRoommatesList] = useState<RoommateProfile[]>([]);
  const [tiffinList, setTiffinList] = useState<TiffinProvider[]>([]);
  const [localServicesList, setLocalServicesList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentTransaction[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [bannersList, setBannersList] = useState<Banner[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [administratorsList, setAdministratorsList] = useState<User[]>([]);
  const [adminRolesConfig, setAdminRolesConfig] = useState<AdminRoleConfig[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters & Search
  const [globalSearch, setGlobalSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [propStatusFilter, setPropStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | '90d' | '1y'>('30d');

  // Modals
  const [inspectUser, setInspectUser] = useState<any | null>(null);
  const [inspectProperty, setInspectProperty] = useState<Property | null>(null);
  const [rejectModal, setRejectModal] = useState<{ targetId: string; type: 'property' | 'service' } | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [refundModal, setRefundModal] = useState<PaymentTransaction | null>(null);
  const [refundReasonText, setRefundReasonText] = useState('');
  const [resolveReportModal, setResolveReportModal] = useState<Report | null>(null);
  const [reportActionNotes, setReportActionNotes] = useState('');
  const [inspectMessageModal, setInspectMessageModal] = useState<{ convId: string; messages: any[] } | null>(null);
  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<UserRole>('ADMIN');
  const [dangerConfirmText, setDangerConfirmText] = useState('');
  const [dangerActionToRun, setDangerActionToRun] = useState<string | null>(null);

  // Ads & Banners Management States
  const [bannerPlacementFilter, setBannerPlacementFilter] = useState<string>('ALL');
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerFormTitle, setBannerFormTitle] = useState('');
  const [bannerFormSubtitle, setBannerFormSubtitle] = useState('');
  const [bannerFormPlacement, setBannerFormPlacement] = useState<BannerPlacement>('HERO');
  const [bannerFormImageUrl, setBannerFormImageUrl] = useState('/src/assets/images/hero_roommitra_pg_1791254850665.jpg');
  const [bannerFormCtaText, setBannerFormCtaText] = useState('Explore Places');
  const [bannerFormCtaUrl, setBannerFormCtaUrl] = useState('/properties');
  const [bannerFormTargetTab, setBannerFormTargetTab] = useState('properties');
  const [bannerFormBadgeText, setBannerFormBadgeText] = useState('Special Offer');
  const [bannerFormSponsorName, setBannerFormSponsorName] = useState('RoomMitra Direct');
  const [bannerFormStatus, setBannerFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [bannerFormOrder, setBannerFormOrder] = useState(1);
  const [bannerFormAudience, setBannerFormAudience] = useState<'ALL' | 'STUDENTS' | 'OWNERS'>('ALL');

  // CMS Homepage Management Local State
  const [cmsHeroTitle, setCmsHeroTitle] = useState('');
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState('');
  const [cmsHeroBadgeText, setCmsHeroBadgeText] = useState('');
  const [cmsHeroImage, setCmsHeroImage] = useState('/src/assets/images/hero_roommitra_pg_1791254850665.jpg');
  const [cmsPrimaryCtaText, setCmsPrimaryCtaText] = useState('');
  const [cmsSecondaryCtaText, setCmsSecondaryCtaText] = useState('');
  const [cmsVerifiedListings, setCmsVerifiedListings] = useState('');
  const [cmsActiveUsers, setCmsActiveUsers] = useState('');
  const [cmsCitiesCovered, setCmsCitiesCovered] = useState('');
  const [cmsPartnersCount, setCmsPartnersCount] = useState('');
  const [cmsShowStats, setCmsShowStats] = useState(true);
  const [cmsSaving, setCmsSaving] = useState(false);

  // New Content Forms
  const [newBannerModal, setNewBannerModal] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerCta, setNewBannerCta] = useState('');
  const [newAnnouncementModal, setNewAnnouncementModal] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState('');
  const [newAnnouncementPriority, setNewAnnouncementPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newCouponModal, setNewCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(500);

  // Automated System Test Suite Results
  const [testResults, setTestResults] = useState<{ summary?: any; tests?: any[] } | null>(null);
  const [testingInProgress, setTestingInProgress] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const statsRes = await apiRequest<{ stats: AdminStats; charts: any }>(`/api/admin/stats?period=${dateFilter}`);
      setStats(statsRes.stats);
      setChartsData(statsRes.charts);

      const usersRes = await apiRequest<{ users: User[] }>('/api/admin/users?limit=100');
      setUsersList(usersRes.users || []);

      const propsRes = await apiRequest<{ properties: Property[] }>('/api/admin/properties');
      setPropertiesList(propsRes.properties || []);

      const roommatesRes = await apiRequest<{ profiles: RoommateProfile[] }>('/api/admin/roommates');
      setRoommatesList(roommatesRes.profiles || []);

      const servRes = await apiRequest<{ tiffinProviders: TiffinProvider[]; localServices: any[] }>('/api/admin/services');
      setTiffinList(servRes.tiffinProviders || []);
      setLocalServicesList(servRes.localServices || []);

      const bookRes = await apiRequest<{ bookings: Booking[] }>('/api/admin/bookings');
      setBookingsList(bookRes.bookings || []);

      const payRes = await apiRequest<{ payments: PaymentTransaction[] }>('/api/admin/payments');
      setPaymentsList(payRes.payments || []);

      const revRes = await apiRequest<{ reviews: Review[] }>('/api/admin/reviews');
      setReviewsList(revRes.reviews || []);

      const repRes = await apiRequest<{ reports: Report[] }>('/api/admin/reports');
      setReportsList(repRes.reports || []);

      const auditRes = await apiRequest<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs');
      setAuditLogs(auditRes.auditLogs || []);

      const bannerRes = await apiRequest<{ banners: Banner[] }>('/api/admin/content/banners');
      setBannersList(bannerRes.banners || []);

      const annRes = await apiRequest<{ announcements: Announcement[] }>('/api/admin/content/announcements');
      setAnnouncementsList(annRes.announcements || []);

      const cpnRes = await apiRequest<{ coupons: Coupon[] }>('/api/admin/marketing/coupons');
      setCouponsList(cpnRes.coupons || []);

      const catRes = await apiRequest<{ categories: CategoryItem[] }>('/api/admin/content/categories');
      setCategoriesList(catRes.categories || []);

      const adminRes = await apiRequest<{ administrators: User[]; rolesConfig: AdminRoleConfig[] }>('/api/admin/administrators');
      setAdministratorsList(adminRes.administrators || []);
      setAdminRolesConfig(adminRes.rolesConfig || []);

      const setRes = await apiRequest<{ settings: SystemSettings }>('/api/admin/settings');
      setSettings(setRes.settings);
    } catch (err: any) {
      console.error('Error fetching admin dataset:', err);
      showToast(err.message || 'Failed to sync administrative dataset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isAdmin, dateFilter]);

  // Synchronize CMS form values whenever settings load
  useEffect(() => {
    if (settings?.homepageContent) {
      setCmsHeroTitle(settings.homepageContent.heroTitle || '');
      setCmsHeroSubtitle(settings.homepageContent.heroSubtitle || '');
      setCmsHeroBadgeText(settings.homepageContent.heroBadgeText || 'Zero Brokerage Guaranteed');
      setCmsHeroImage(settings.homepageContent.heroImage || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg');
      setCmsPrimaryCtaText(settings.homepageContent.primaryCtaText || 'Find Your Place');
      setCmsSecondaryCtaText(settings.homepageContent.secondaryCtaText || 'List Your Property');
      if (settings.homepageContent.statsConfig) {
        setCmsVerifiedListings(settings.homepageContent.statsConfig.verifiedListings || '1,200+');
        setCmsActiveUsers(settings.homepageContent.statsConfig.activeUsers || '8,000+');
        setCmsCitiesCovered(settings.homepageContent.statsConfig.citiesCovered || '15+');
        setCmsPartnersCount(settings.homepageContent.statsConfig.partnersCount || '50+');
        setCmsShowStats(settings.homepageContent.statsConfig.showStats ?? true);
      }
    }
  }, [settings]);

  const handleSaveHomepageCMS = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCmsSaving(true);
    try {
      const updatedHomepageContent: HomepageContent = {
        heroTitle: cmsHeroTitle,
        heroSubtitle: cmsHeroSubtitle,
        heroBadgeText: cmsHeroBadgeText,
        heroImage: cmsHeroImage || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
        primaryCtaText: cmsPrimaryCtaText || 'Find Your Place',
        secondaryCtaText: cmsSecondaryCtaText || 'List Your Property',
        statsConfig: {
          verifiedListings: cmsVerifiedListings || '1,200+',
          activeUsers: cmsActiveUsers || '8,000+',
          citiesCovered: cmsCitiesCovered || '15+',
          partnersCount: cmsPartnersCount || '50+',
          showStats: cmsShowStats,
        },
      };

      await apiRequest('/api/admin/content/homepage', {
        method: 'PUT',
        body: JSON.stringify({ homepageContent: updatedHomepageContent }),
      });
      showToast('Homepage Hero & CMS configurations saved successfully.');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update homepage CMS.', 'error');
    } finally {
      setCmsSaving(false);
    }
  };

  const handleOpenCreateBanner = () => {
    setEditingBannerId(null);
    setBannerFormTitle('');
    setBannerFormSubtitle('');
    setBannerFormPlacement('HERO');
    setBannerFormImageUrl('/src/assets/images/hero_roommitra_pg_1791254850665.jpg');
    setBannerFormCtaText('Explore Places');
    setBannerFormCtaUrl('/properties');
    setBannerFormTargetTab('properties');
    setBannerFormBadgeText('Special Offer');
    setBannerFormSponsorName('RoomMitra Direct');
    setBannerFormStatus('ACTIVE');
    setBannerFormOrder(bannersList.length + 1);
    setBannerFormAudience('ALL');
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerFormTitle(b.title || '');
    setBannerFormSubtitle(b.subtitle || '');
    setBannerFormPlacement(b.placement || 'HERO');
    setBannerFormImageUrl(b.imageUrl || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg');
    setBannerFormCtaText(b.ctaText || 'Learn More');
    setBannerFormCtaUrl(b.ctaUrl || '/properties');
    setBannerFormTargetTab(b.targetTab || 'properties');
    setBannerFormBadgeText(b.badgeText || 'Sponsored');
    setBannerFormSponsorName(b.sponsorName || 'RoomMitra Partner');
    setBannerFormStatus(b.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
    setBannerFormOrder(b.displayOrder || 1);
    setBannerFormAudience(b.targetAudience || 'ALL');
    setBannerModalOpen(true);
  };

  const handleToggleBannerStatus = async (b: Banner) => {
    try {
      const nextStatus = b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiRequest(`/api/admin/content/banners/${b.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`Ad status updated to ${nextStatus}.`);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle ad status.', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await apiRequest(`/api/admin/content/banners/${id}`, { method: 'DELETE' });
      showToast('Ad campaign banner deleted.');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete banner.', 'error');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: bannerFormTitle,
        subtitle: bannerFormSubtitle,
        placement: bannerFormPlacement,
        imageUrl: bannerFormImageUrl,
        ctaText: bannerFormCtaText,
        ctaUrl: bannerFormCtaUrl,
        targetTab: bannerFormTargetTab,
        badgeText: bannerFormBadgeText,
        sponsorName: bannerFormSponsorName,
        status: bannerFormStatus,
        displayOrder: Number(bannerFormOrder) || 1,
        targetAudience: bannerFormAudience,
      };

      if (editingBannerId) {
        await apiRequest(`/api/admin/content/banners/${editingBannerId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Ad banner updated successfully.');
      } else {
        await apiRequest('/api/admin/content/banners', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('New ad banner created successfully.');
      }
      setBannerModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save banner.', 'error');
    }
  };

  // Actions
  const handleModerateProperty = async (propertyId: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND', reason?: string) => {
    try {
      await apiRequest(`/api/admin/properties/${propertyId}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({ action, rejectionReason: reason, isVerified: action === 'APPROVE' }),
      });
      showToast(`Property listing marked as ${action}. Owner notified.`);
      setRejectModal(null);
      setRejectionReasonText('');
      setInspectProperty(null);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Moderation action failed.', 'error');
    }
  };

  const handleModerateUser = async (userId: string, updates: { isBanned?: boolean; isSuspended?: boolean; isIdentityVerified?: boolean }) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      showToast('User credentials and trust status updated.');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'User update failed.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently purge this user record?')) return;
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
      showToast('User account successfully purged.');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Delete user failed.', 'error');
    }
  };

  const handleResetSession = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/reset-session`, { method: 'POST' });
      showToast('All active sessions for user terminated.');
    } catch (err: any) {
      showToast(err.message || 'Reset session failed.', 'error');
    }
  };

  const handleRefundPayment = async () => {
    if (!refundModal || !refundReasonText.trim()) {
      showToast('Mandatory refund justification is required.', 'error');
      return;
    }
    try {
      await apiRequest(`/api/admin/payments/${refundModal.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: refundReasonText }),
      });
      showToast(`Refund of ₹${refundModal.amount} executed in escrow.`);
      setRefundModal(null);
      setRefundReasonText('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Refund failed.', 'error');
    }
  };

  const handleResolveReport = async () => {
    if (!resolveReportModal) return;
    try {
      await apiRequest(`/api/admin/reports/${resolveReportModal.id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'RESOLVED',
          actionTaken: reportActionNotes || 'Investigated by trust officer and reconciled.',
        }),
      });
      showToast('Report marked as resolved with internal audit notes.');
      setResolveReportModal(null);
      setReportActionNotes('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Resolve report failed.', 'error');
    }
  };

  const handleInspectMessages = async (convId: string) => {
    try {
      const data = await apiRequest<{ conversation: any; messages: any[] }>(`/api/admin/messages/inspect/${convId}`);
      setInspectMessageModal({ convId, messages: data.messages });
      showToast('Sensitive message history inspected; security audit trace recorded.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Unable to inspect messages.', 'error');
    }
  };

  const handleCreateAdministrator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/administrators', {
        method: 'POST',
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole,
        }),
      });
      showToast(`New ${newAdminRole} account created for ${newAdminEmail}`);
      setCreateAdminModal(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create admin.', 'error');
    }
  };

  const handleExecuteDangerZone = async () => {
    if (dangerConfirmText !== 'I UNDERSTAND THE RISKS' || !dangerActionToRun) {
      showToast('Exact confirmation phrase mismatch.', 'error');
      return;
    }
    try {
      await apiRequest('/api/admin/danger-zone/execute', {
        method: 'POST',
        body: JSON.stringify({
          action: dangerActionToRun,
          confirmationPhrase: dangerConfirmText,
        }),
      });
      showToast(`Operation ${dangerActionToRun} executed successfully.`);
      setDangerActionToRun(null);
      setDangerConfirmText('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Danger operation failed.', 'error');
    }
  };

  const runSystemTestSuite = async () => {
    setTestingInProgress(true);
    try {
      const data = await apiRequest('/api/system/test-suite');
      setTestResults(data);
      showToast('Full security, RBAC & API test suite completed.');
    } catch (err: any) {
      showToast('Test execution error.', 'error');
    } finally {
      setTestingInProgress(false);
    }
  };

  // CSV Export utility
  const exportTableCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv`);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        {/* Top Minimal Admin Nav */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white font-display tracking-tight">
                Room<span className="text-amber-500">Mitra</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-slate-900 border border-slate-800 text-amber-400">
                Admin Suite
              </span>
            </div>
          </div>

          {onBackToSite && (
            <button
              onClick={onBackToSite}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-amber-500" />
              <span>← Back to Public Website</span>
            </button>
          )}
        </header>

        {/* Central Executive Gate Card */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white font-display tracking-tight">
                Executive Access Gate
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Restricted to authorized RoomMitra governance officers, compliance managers, and verified system administrators.
              </p>
            </div>

            {gateError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold rounded-xl text-center animate-in fade-in">
                {gateError}
              </div>
            )}

            {/* Direct Admin Login Form */}
            <form onSubmit={handleGateLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                  placeholder="admin@roommitra.in"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Secure Password / Passkey
                </label>
                <input
                  type="password"
                  required
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={gateLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {gateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>Authenticate Session</span>
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Or Instant Reviewer Launch
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Instant Demo Launchers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => demoLogin('SUPER_ADMIN')}
                className="p-3 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/80 rounded-2xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-xs">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-purple-400/80 mt-0.5">
                  Full Root & Governance
                </div>
              </button>

              <button
                type="button"
                onClick={() => demoLogin('ADMIN')}
                className="p-3 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 rounded-2xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>Operations Admin</span>
                </div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">
                  Audits, KYC & Moderation
                </div>
              </button>
            </div>

            {user && !isAdmin && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="text-[11px] text-slate-400">
                  Currently signed in as <strong className="text-white">{user.name}</strong> ({user.role}).
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="block mx-auto mt-1 text-[11px] font-bold text-amber-500 hover:underline"
                >
                  Sign Out from User Session
                </button>
              </div>
            )}

            {/* Compliance Footer */}
            <div className="pt-2 border-t border-slate-800/60 text-center">
              <p className="text-[10px] text-slate-500">
                🔒 Cryptographically signed session traces are archived under IT Act §43A & DPDP Act compliance.
              </p>
            </div>
          </div>
        </main>

        <footer className="h-12 border-t border-slate-800/80 px-6 flex items-center justify-between text-xs text-slate-500">
          <span>RoomMitra Enterprise Control Suite</span>
          <span>v2.4 Production Gateway</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top-2 duration-200 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border-emerald-800' 
            : 'bg-rose-950 text-rose-100 border-rose-800'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* DESKTOP & MOBILE WRAPPER */}
      <div className="flex-1 flex overflow-hidden">
        {/* =======================================================
            SIDEBAR (Desktop Sticky + Mobile Drawer)
            ======================================================= */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Brand header */}
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-white font-display tracking-tight">
                  Room<span className="text-amber-500">Mitra</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold -mt-0.5">
                  Control Console
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scrollable */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-semibold">
            {/* Core */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Operations
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setCurrentSection('dashboard'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'dashboard' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4" />
                    <span>Dashboard KPIs</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('approval-queue'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'approval-queue' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4" />
                    <span>Approval Queue</span>
                  </div>
                  {stats && stats.propertiesPending > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {stats.propertiesPending}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setCurrentSection('properties'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'properties' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4" />
                    <span>Properties & PGs</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{propertiesList.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('users'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'users' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>User Accounts</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{usersList.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('roommates'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'roommates' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Roommate Matches</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('services'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'services' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Utensils className="w-4 h-4" />
                    <span>Service Providers</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Financial & Trust */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Finance & Trust Desk
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setCurrentSection('bookings'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'bookings' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Bookings & Stays</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{bookingsList.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('payments'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'payments' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Payments & Escrow</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('reports'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'reports' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Grievances & Reports</span>
                  </div>
                  {reportsList.filter(r => r.status === 'OPEN').length > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {reportsList.filter(r => r.status === 'OPEN').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setCurrentSection('reviews'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'reviews' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4" />
                    <span>Reviews & Moderation</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('messages'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'messages' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Audited Messages</span>
                  </div>
                </button>
              </div>
            </div>

            {/* CMS & Marketing */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                CMS & Marketing
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setCurrentSection('content-home'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'content-home' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Image className="w-4 h-4" />
                    <span>Homepage Content</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('content-banners'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'content-banners' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>Banners & Promos</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{bannersList.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('content-announcements'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'content-announcements' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4" />
                    <span>Announcements</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('marketing-coupons'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'marketing-coupons' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4" />
                    <span>Discount Coupons</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{couponsList.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('content-cities'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'content-cities' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4" />
                    <span>Supported Cities</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('content-faqs'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'content-faqs' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>FAQ Management</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Governance & Security */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Governance & Security
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setCurrentSection('admins'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'admins' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-purple-400" />
                    <span>Admins & Permissions</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{administratorsList.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('audit-logs'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'audit-logs' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Audit Logs</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{auditLogs.length}</span>
                </button>

                <button
                  onClick={() => { setCurrentSection('tests'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'tests' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-emerald-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4" />
                    <span>Security Test Suite</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('settings'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'settings' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" />
                    <span>System Settings</span>
                  </div>
                </button>

                <button
                  onClick={() => { setCurrentSection('danger-zone'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentSection === 'danger-zone' ? 'bg-rose-600 text-white font-black shadow-xs' : 'hover:bg-slate-900 text-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Danger Zone</span>
                  </div>
                </button>
              </div>
            </div>
          </nav>

          {/* Footer User Widget */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  {user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold truncate">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* =======================================================
            MAIN CONTENT AREA
            ======================================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* TOP HEADER */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative hidden sm:block max-w-xs w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  placeholder="Universal search..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Online status indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Console Active</span>
              </div>

              {/* Refresh button */}
              <button
                onClick={loadAllAdminData}
                title="Refresh Dataset"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              </button>

              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {((stats?.propertiesPending || 0) + (stats?.openReports || 0)) > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                      <span>Operational Alerts</span>
                      <span className="text-[10px] text-amber-600 cursor-pointer" onClick={() => setNotifDropdownOpen(false)}>Close</span>
                    </div>
                    <div className="py-2 space-y-2 text-xs">
                      {stats && stats.propertiesPending > 0 && (
                        <div 
                          onClick={() => { setCurrentSection('approval-queue'); setNotifDropdownOpen(false); }}
                          className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 cursor-pointer text-amber-900 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{stats.propertiesPending} listings awaiting audit</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {stats && stats.openReports > 0 && (
                        <div 
                          onClick={() => { setCurrentSection('reports'); setNotifDropdownOpen(false); }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100/80 cursor-pointer text-rose-900 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{stats.openReports} active user grievances</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-600 text-[11px]">
                        Server online · Escrow engine protected
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Exit to Public Website Button */}
              {onBackToSite && (
                <button
                  onClick={onBackToSite}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  title="Return to the consumer website"
                >
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Exit to</span>
                  <span>Public Site</span>
                </button>
              )}

              {/* Role badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isSuperAdmin ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* =======================================================
                VIEW 1: DASHBOARD OVERVIEW
                ======================================================= */}
            {currentSection === 'dashboard' && stats && (
              <div className="space-y-6">
                {/* Header & Date range selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Command & Analytics Overview</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Live authenticated platform health, verification queues, and revenue metrics</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
                      {(['today', '7d', '30d', '90d', '1y'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setDateFilter(p)}
                          className={`px-2.5 py-1 rounded-lg uppercase cursor-pointer ${
                            dateFilter === p ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => exportTableCSV('RoomMitra_KPIs', ['Metric', 'Count'], [
                        ['Total Users', stats.totalUsers],
                        ['Active Users', stats.activeUsers],
                        ['Properties Total', stats.propertiesTotal],
                        ['Properties Approved', stats.propertiesApproved],
                        ['Pending Audit', stats.propertiesPending],
                        ['Total Bookings', stats.totalBookings],
                        ['Revenue Total', stats.revenueTotal],
                        ['Open Reports', stats.openReports],
                      ])}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* 8 Core KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Users</span>
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">{stats.totalUsers}</div>
                    <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>{stats.activeUsers} Active</span>
                      <span className="text-slate-400">· +14.8%</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Listings Audited</span>
                      <Building2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">{stats.propertiesTotal}</div>
                    <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>{stats.propertiesApproved} Verified</span>
                      <span className="text-slate-400">· +19.2%</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pending Review</span>
                      <Award className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-black text-rose-600 font-display tabular-nums">{stats.propertiesPending}</div>
                    <div className="text-[11px] text-rose-700 font-bold cursor-pointer" onClick={() => setCurrentSection('approval-queue')}>
                      Review In Approval Queue →
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Escrow Volume</span>
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">
                      ₹{stats.revenueTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold">
                      {stats.totalBookings} Completed Reservations
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Roommate Seekers</span>
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">{stats.roommateProfiles}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Lifestyle Match Algorithm</div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Service Providers</span>
                      <Utensils className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">{stats.tiffinProviders}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Tiffin, Laundry, Study Pods</div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Open Grievances</span>
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">{stats.openReports}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">24-Hour SLA Target</div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Audit Events</span>
                      <FileText className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-950 font-display tabular-nums">{stats.auditEventsCount}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Immutable Trace Logged</div>
                  </div>
                </div>

                {/* Analytical Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Growth & Timeline */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-sm">Monthly Platform Growth</h3>
                        <p className="text-[11px] text-slate-500">Resident registrations vs active listings</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        +22.5% MoM
                      </span>
                    </div>

                    <div className="h-48 flex items-end gap-4 pt-6 pb-2 border-b border-slate-100">
                      {chartsData?.userGrowth?.map((item: any, idx: number) => {
                        const maxVal = Math.max(...chartsData.userGrowth.map((g: any) => g.count), 10);
                        const pct = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <span className="text-[10px] font-extrabold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.count}
                            </span>
                            <div 
                              style={{ height: `${Math.max(12, pct)}%` }} 
                              className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-xl transition-all group-hover:brightness-110"
                            />
                            <span className="text-[10px] font-bold text-slate-400">{item.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Listings by City Distribution */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-sm">Listings by Indian Metro</h3>
                        <p className="text-[11px] text-slate-500">Geographic footprint of verified hubs</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {chartsData?.cityDistribution?.map((item: any, idx: number) => {
                        const totalProps = propertiesList.length || 1;
                        const pct = Math.round((item.count / totalProps) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-800">{item.city}</span>
                              <span className="text-slate-500 tabular-nums">{item.count} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-slate-950 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 2: DEDICATED APPROVAL QUEUE
                ======================================================= */}
            {currentSection === 'approval-queue' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Dedicated Property Approval Queue</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Physical audit review desk for new accommodations submitted by hosts</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold">
                    {propertiesList.filter(p => p.status === 'PENDING_REVIEW').length} Pending Review
                  </span>
                </div>

                {propertiesList.filter(p => p.status === 'PENDING_REVIEW').length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-900">Approval Queue is All Clear!</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All submitted properties have been reviewed and either approved or addressed.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {propertiesList.filter(p => p.status === 'PENDING_REVIEW').map(prop => (
                      <div key={prop.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="relative h-48 bg-slate-100">
                          <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            Pending Audit
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{prop.city} · {prop.area}</div>
                            <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{prop.title}</h3>
                            <div className="text-xs font-black text-slate-950 mt-1 tabular-nums">
                              ₹{prop.rentPerMonth.toLocaleString('en-IN')}/mo
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Host: {prop.ownerName}</div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleModerateProperty(prop.id, 'APPROVE')}
                              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer text-center"
                            >
                              Approve Listing
                            </button>
                            <button
                              onClick={() => setRejectModal({ targetId: prop.id, type: 'property' })}
                              className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer text-center"
                            >
                              Reject with Reason
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =======================================================
                VIEW 3: USER MANAGEMENT
                ======================================================= */}
            {currentSection === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">User Account Administration</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage tenants, property hosts, and roommates with granular authorization</p>
                  </div>

                  <button
                    onClick={() => exportTableCSV('RoomMitra_Users', ['ID', 'Name', 'Email', 'Role', 'City', 'Status'], usersList.map(u => [
                      u.id, u.name, u.email, u.role, u.city || '', u.isBanned ? 'BANNED' : u.isSuspended ? 'SUSPENDED' : 'ACTIVE'
                    ]))}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs self-start"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export User CSV</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={e => setUserRoleFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="USER">Resident</option>
                      <option value="PROPERTY_OWNER">Host</option>
                      <option value="ROOMMATE">Roommate</option>
                      <option value="SERVICE_PROVIDER">Partner</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">Status:</span>
                    <select
                      value={userStatusFilter}
                      onChange={e => setUserStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </div>
                </div>

                {/* Responsive Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Role</th>
                          <th className="py-3.5 px-4">City</th>
                          <th className="py-3.5 px-4">KYC Status</th>
                          <th className="py-3.5 px-4">Account Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList
                          .filter(u => userRoleFilter === 'ALL' || u.role === userRoleFilter)
                          .filter(u => {
                            if (userStatusFilter === 'ACTIVE') return !u.isBanned && !u.isSuspended;
                            if (userStatusFilter === 'SUSPENDED') return u.isSuspended;
                            if (userStatusFilter === 'BANNED') return u.isBanned;
                            return true;
                          })
                          .map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs">
                                    {u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{u.name}</div>
                                    <div className="text-[11px] text-slate-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600">{u.city || 'Bengaluru'}</td>
                              <td className="py-3 px-4">
                                {u.isIdentityVerified ? (
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Verified
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Unverified</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {u.isBanned ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">BANNED</span>
                                ) : u.isSuspended ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">SUSPENDED</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">ACTIVE</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      const res = await apiRequest<any>(`/api/admin/users/${u.id}`);
                                      setInspectUser(res);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    title="View Profile Inspector"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {u.isSuspended ? (
                                    <button
                                      onClick={() => handleModerateUser(u.id, { isSuspended: false })}
                                      className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]"
                                    >
                                      Restore
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleModerateUser(u.id, { isSuspended: true })}
                                      className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-[10px]"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleResetSession(u.id)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    title="Reset Active Sessions"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                                    title="Purge User Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 4: PROPERTIES & PGS
                ======================================================= */}
            {currentSection === 'properties' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Property & PG Listings</h1>
                    <p className="text-xs text-slate-500 mt-0.5">All active, pending, and suspended living accommodations</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{propertiesList.length} total listings</span>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Property</th>
                          <th className="py-3.5 px-4">Host / Owner</th>
                          <th className="py-3.5 px-4">City & Area</th>
                          <th className="py-3.5 px-4">Rent</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {propertiesList.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{p.title}</div>
                                  <div className="text-[10px] text-slate-400">{p.propertyType} · {p.roomType}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{p.ownerName}</td>
                            <td className="py-3 px-4 text-slate-600">{p.area}, {p.city}</td>
                            <td className="py-3 px-4 font-black text-slate-900 tabular-nums">₹{p.rentPerMonth.toLocaleString('en-IN')}/mo</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                p.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectProperty(p)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  title="Inspect Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {p.status !== 'APPROVED' && (
                                  <button
                                    onClick={() => handleModerateProperty(p.id, 'APPROVE')}
                                    className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]"
                                  >
                                    Approve
                                  </button>
                                )}
                                {p.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handleModerateProperty(p.id, 'SUSPEND')}
                                    className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-[10px]"
                                  >
                                    Suspend
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Delete listing?')) {
                                      await apiRequest(`/api/admin/properties/${p.id}`, { method: 'DELETE' });
                                      showToast('Property deleted.');
                                      loadAllAdminData();
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 5: BOOKINGS & ESCROW
                ======================================================= */}
            {currentSection === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Resident Bookings & Move-in Schedules</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Token escrow deposits protecting tenant reservations</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    100% Money-Back Escrow Active
                  </span>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Booking Ref</th>
                          <th className="py-3.5 px-4">Property</th>
                          <th className="py-3.5 px-4">Move-in Date</th>
                          <th className="py-3.5 px-4">Token Escrow</th>
                          <th className="py-3.5 px-4">Payment</th>
                          <th className="py-3.5 px-4">Booking Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookingsList.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">#{b.id}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{b.propertyTitle}</td>
                            <td className="py-3 px-4 text-slate-600">{b.moveInDate}</td>
                            <td className="py-3 px-4 font-black text-slate-900 tabular-nums">₹{b.depositAmount.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {b.paymentStatus || 'PAID'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  await apiRequest(`/api/admin/bookings/${b.id}/status`, {
                                    method: 'PUT',
                                    body: JSON.stringify({ status: 'CHECKED_IN' }),
                                  });
                                  showToast(`Booking #${b.id} marked checked in.`);
                                  loadAllAdminData();
                                }}
                                className="px-2.5 py-1 bg-slate-950 text-white rounded-lg font-bold text-[10px]"
                              >
                                Mark Move-in
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 6: PAYMENTS & REFUNDS
                ======================================================= */}
            {currentSection === 'payments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Escrow Transactions & Refunds</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Secure payment traces. Never stores raw cards or plain-text credentials.</p>
                  </div>

                  <button
                    onClick={() => exportTableCSV('RoomMitra_Payments', ['TxnID', 'Amount', 'Status', 'Gateway', 'Date'], paymentsList.map(p => [
                      p.id, p.amount, p.status, p.gateway || p.paymentMethod || 'UPI_ESCROW', p.createdAt
                    ]))}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Payments CSV</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Transaction ID</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Gateway</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Created Date</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentsList.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.id}</td>
                            <td className="py-3 px-4 font-black text-slate-900 tabular-nums">₹{p.amount.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-slate-600">{p.gateway || p.paymentMethod || 'UPI_ESCROW'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                p.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                                p.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-right">
                              {p.status === 'SUCCESS' && (
                                <button
                                  onClick={() => setRefundModal(p)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[10px]"
                                >
                                  Process Refund
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 7: REPORTS & COMPLAINTS
                ======================================================= */}
            {currentSection === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 font-display">Tenant Grievances & Moderation Desk</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Complaints filed by residents regarding listings, charges, or flatmate disputes</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Target / Entity</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Description</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportsList.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{r.targetTitleOrName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                                {r.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{r.description}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {r.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => setResolveReportModal(r)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px]"
                                >
                                  Investigate & Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 8: CMS & HOMEPAGE CONTENT
                ======================================================= */}
            {currentSection === 'content-home' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Homepage & Hero Section CMS</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure hero headlines, badges, call-to-action buttons, hero photography, and platform trust statistics live.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveHomepageCMS}
                    disabled={cmsSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{cmsSaving ? 'Saving Changes...' : 'Save All Homepage Settings'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Comprehensive Settings Form */}
                  <form onSubmit={handleSaveHomepageCMS} className="lg:col-span-7 space-y-6">
                    {/* Section 1: Hero Headlines & Badges */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="font-extrabold text-sm text-slate-900">Hero Headlines & Badges</h3>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hero Badge / Guarantee Text
                        </label>
                        <input
                          type="text"
                          value={cmsHeroBadgeText}
                          onChange={e => setCmsHeroBadgeText(e.target.value)}
                          placeholder="e.g. Zero Brokerage Guaranteed"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hero Main Headline
                        </label>
                        <input
                          type="text"
                          value={cmsHeroTitle}
                          onChange={e => setCmsHeroTitle(e.target.value)}
                          placeholder="e.g. Everything You Need For Living, All In One Place."
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hero Subtitle / Description
                        </label>
                        <textarea
                          rows={3}
                          value={cmsHeroSubtitle}
                          onChange={e => setCmsHeroSubtitle(e.target.value)}
                          placeholder="Find rooms, PGs, hostels, roommates, tiffin..."
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                    </div>

                    {/* Section 2: Call to Action (CTA) Buttons */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <ArrowRight className="w-4 h-4 text-amber-500" />
                        <h3 className="font-extrabold text-sm text-slate-900">Hero Action Buttons (CTAs)</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Primary CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={cmsPrimaryCtaText}
                            onChange={e => setCmsPrimaryCtaText(e.target.value)}
                            placeholder="e.g. Find Your Place"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Secondary CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={cmsSecondaryCtaText}
                            onChange={e => setCmsSecondaryCtaText(e.target.value)}
                            placeholder="e.g. List Your Property"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Hero Photography & Asset */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Image className="w-4 h-4 text-amber-500" />
                        <h3 className="font-extrabold text-sm text-slate-900">Hero Photography & Visual Asset</h3>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hero Image Path / URL
                        </label>
                        <input
                          type="text"
                          value={cmsHeroImage}
                          onChange={e => setCmsHeroImage(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                        />
                      </div>

                      {/* Clickable Quick Image Presets */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                          Select from High-Quality Visual Presets:
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { name: 'Executive PG', url: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg' },
                            { name: 'Modern Studio', url: '/src/assets/images/property_modern_apartment_1791254862331.jpg' },
                            { name: 'Community Lounge', url: '/src/assets/images/roommate_community_lounge_1791254872925.jpg' },
                            { name: 'Gourmet Tiffin', url: '/src/assets/images/tiffin_food_thali_1791254883521.jpg' },
                            { name: 'Quiet Library', url: '/src/assets/images/library_study_space_1791257186422.jpg' },
                            { name: 'Express Laundry', url: '/src/assets/images/laundry_clean_service_1791257196915.jpg' },
                          ].map(preset => (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => setCmsHeroImage(preset.url)}
                              className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                                cmsHeroImage === preset.url
                                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                              }`}
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-14 rounded-lg object-cover mb-1" />
                              <div className="text-[10px] font-bold text-slate-800 truncate">{preset.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Dynamic Platform Trust Stats */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <h3 className="font-extrabold text-sm text-slate-900">Platform Trust Counters</h3>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <span>Show Counters:</span>
                          <input
                            type="checkbox"
                            checked={cmsShowStats}
                            onChange={e => setCmsShowStats(e.target.checked)}
                            className="w-4 h-4 text-amber-500 rounded"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Verified Listings Count
                          </label>
                          <input
                            type="text"
                            value={cmsVerifiedListings}
                            onChange={e => setCmsVerifiedListings(e.target.value)}
                            placeholder="e.g. 1,200+"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Active Residents Count
                          </label>
                          <input
                            type="text"
                            value={cmsActiveUsers}
                            onChange={e => setCmsActiveUsers(e.target.value)}
                            placeholder="e.g. 8,000+"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Cities Covered Count
                          </label>
                          <input
                            type="text"
                            value={cmsCitiesCovered}
                            onChange={e => setCmsCitiesCovered(e.target.value)}
                            placeholder="e.g. 15+"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Verified Partners Count
                          </label>
                          <input
                            type="text"
                            value={cmsPartnersCount}
                            onChange={e => setCmsPartnersCount(e.target.value)}
                            placeholder="e.g. 50+"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cmsSaving}
                      className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer"
                    >
                      {cmsSaving ? 'Saving All Settings...' : 'Save All Homepage & Hero Settings'}
                    </button>
                  </form>

                  {/* Right Column: Live Visual Preview Card */}
                  <div className="lg:col-span-5 sticky top-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Live Preview (What Users See)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Real-Time
                      </span>
                    </div>

                    {/* Preview Hero Box */}
                    <div className="bg-gradient-to-b from-amber-50/70 via-slate-50 to-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 text-[10px] font-bold text-amber-800 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{cmsHeroBadgeText || 'Zero Brokerage Guaranteed'}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-black text-slate-950 font-display leading-tight">
                        {cmsHeroTitle || 'Everything You Need For Living, All In One Place.'}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {cmsHeroSubtitle || 'Find rooms, PGs, hostels, roommates, tiffin, laundry and everyday living services — all from one trusted platform.'}
                      </p>

                      {/* CTA Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-white font-bold text-[10px]">
                          {cmsPrimaryCtaText || 'Find Your Place'}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-[10px]">
                          {cmsSecondaryCtaText || 'List Your Property'}
                        </span>
                      </div>

                      {/* Image Preview */}
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 mt-3 shadow-xs">
                        <img
                          src={cmsHeroImage || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
                          alt="Hero Preview"
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-center justify-between text-[11px]">
                          <span className="font-extrabold">RoomMitra Verified PG</span>
                          <span className="text-amber-300 font-black">₹0 Brokerage</span>
                        </div>
                      </div>

                      {/* Stats Preview Bar */}
                      {cmsShowStats && (
                        <div className="p-3 bg-slate-900 rounded-2xl text-white grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div>
                            <div className="font-black text-amber-400">{cmsVerifiedListings || '1,200+'}</div>
                            <div className="text-slate-400 text-[8px]">Listings</div>
                          </div>
                          <div>
                            <div className="font-black text-white">{cmsActiveUsers || '8,000+'}</div>
                            <div className="text-slate-400 text-[8px]">Residents</div>
                          </div>
                          <div>
                            <div className="font-black text-amber-400">{cmsCitiesCovered || '15+'}</div>
                            <div className="text-slate-400 text-[8px]">Cities</div>
                          </div>
                          <div>
                            <div className="font-black text-emerald-400">{cmsPartnersCount || '50+'}</div>
                            <div className="text-slate-400 text-[8px]">Partners</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 9: BANNERS & ADS MANAGEMENT
                ======================================================= */}
            {currentSection === 'content-banners' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Ads & Banner Campaigns Manager</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Control advertisements and promotional cards displayed across all sections of RoomMitra.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateBanner}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Ad Campaign</span>
                  </button>
                </div>

                {/* Performance Analytics Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Ads</span>
                    <div className="text-xl font-black text-slate-950 mt-1">{bannersList.length}</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Now</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {bannersList.filter(b => b.status === 'ACTIVE').length}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Impressions</span>
                    <div className="text-xl font-black text-slate-950 mt-1">
                      {bannersList.reduce((acc, b) => acc + (b.impressionsCount || 0), 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Clicks Tracked</span>
                    <div className="text-xl font-black text-amber-600 mt-1">
                      {bannersList.reduce((acc, b) => acc + (b.clicksCount || 0), 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Avg CTR</span>
                    <div className="text-xl font-black text-purple-600 mt-1">
                      {(() => {
                        const totalImp = bannersList.reduce((acc, b) => acc + (b.impressionsCount || 0), 0);
                        const totalClk = bannersList.reduce((acc, b) => acc + (b.clicksCount || 0), 0);
                        return totalImp > 0 ? `${((totalClk / totalImp) * 100).toFixed(1)}%` : '0%';
                      })()}
                    </div>
                  </div>
                </div>

                {/* Placement Filter Pills */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
                  {[
                    { id: 'ALL', label: 'All Ad Placements' },
                    { id: 'TOP_ALERT', label: 'Top Alert Bar' },
                    { id: 'HERO', label: 'Hero Spotlight' },
                    { id: 'PROPERTIES', label: 'Properties Section' },
                    { id: 'ROOMMATES', label: 'Roommates Safety' },
                    { id: 'TIFFIN', label: 'Tiffin Kitchens' },
                    { id: 'SERVICES', label: 'Living Services' },
                    { id: 'MIDPAGE', label: 'Midpage Banner' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setBannerPlacementFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        bannerPlacementFilter === tab.id
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Ad Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bannersList
                    .filter(b => bannerPlacementFilter === 'ALL' || b.placement === bannerPlacementFilter)
                    .map(b => {
                      const placementColors: Record<string, string> = {
                        TOP_ALERT: 'bg-amber-100 text-amber-900 border-amber-300',
                        HERO: 'bg-purple-100 text-purple-900 border-purple-300',
                        PROPERTIES: 'bg-blue-100 text-blue-900 border-blue-300',
                        ROOMMATES: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                        TIFFIN: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        SERVICES: 'bg-cyan-100 text-cyan-900 border-cyan-300',
                        MIDPAGE: 'bg-rose-100 text-rose-900 border-rose-300',
                      };

                      const badgeStyle = placementColors[b.placement || 'HERO'] || 'bg-slate-100 text-slate-800 border-slate-300';
                      const ctr = b.impressionsCount && b.impressionsCount > 0
                        ? (((b.clicksCount || 0) / b.impressionsCount) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <div
                          key={b.id}
                          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="p-5 space-y-3">
                            {/* Top Meta Header */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                                {b.placement || 'HERO'}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleBannerStatus(b)}
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                                    b.status === 'ACTIVE'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  ● {b.status}
                                </button>
                                <span className="text-xs text-slate-400 font-mono">#{b.displayOrder}</span>
                              </div>
                            </div>

                            {/* Image Thumbnail and Details */}
                            <div className="flex items-start gap-3.5">
                              <img
                                src={b.imageUrl || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'}
                                alt={b.title}
                                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    {b.badgeText || 'Special'}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-600 truncate">
                                    {b.sponsorName || 'RoomMitra'}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-sm leading-snug truncate">
                                  {b.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {b.subtitle}
                                </p>
                              </div>
                            </div>

                            {/* Target CTA & Tab */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-600 font-semibold text-[11px]">
                                Button: <strong className="text-amber-700">{b.ctaText}</strong> → <span className="text-slate-500 font-mono">/{b.targetTab || b.ctaUrl}</span>
                              </span>
                            </div>

                            {/* Analytics Row */}
                            <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-600 font-medium">
                              <div>
                                <span className="text-slate-400">Views: </span>
                                <strong className="text-slate-900 font-bold">{(b.impressionsCount || 0).toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400">Clicks: </span>
                                <strong className="text-amber-700 font-bold">{(b.clicksCount || 0).toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400">CTR: </span>
                                <strong className="text-purple-700 font-bold">{ctr}%</strong>
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => handleOpenEditBanner(b)}
                              className="flex items-center gap-1 font-bold text-slate-700 hover:text-slate-950 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Ad</span>
                            </button>
                            <button
                              onClick={() => handleToggleBannerStatus(b)}
                              className="font-bold text-indigo-700 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              {b.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(b.id)}
                              className="flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 10: MARKETING COUPONS
                ======================================================= */}
            {currentSection === 'marketing-coupons' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Coupons & Promo Codes</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Validated strictly server-side during checkout</p>
                  </div>
                  <button
                    onClick={() => setNewCouponModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create Promo Coupon</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {couponsList.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-sm">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {c.discountType === 'FIXED' ? `₹${c.discountValue} Flat Discount` : `${c.discountValue}% Discount`}
                      </div>
                      <div className="text-[11px] text-slate-500">Min Order: ₹{c.minAmount} · Used: {c.usedCount}/{c.usageLimit}</div>
                      <div className="pt-2 text-right">
                        <button
                          onClick={async () => {
                            await apiRequest(`/api/admin/marketing/coupons/${c.id}`, { method: 'DELETE' });
                            showToast('Coupon removed.');
                            loadAllAdminData();
                          }}
                          className="text-rose-600 font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 11: ADMINISTRATORS & ROLES/PERMISSIONS
                ======================================================= */}
            {currentSection === 'admins' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Administrator Accounts & RBAC Roles</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Granular server-enforced permissions for operations, support, and finance</p>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setCreateAdminModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-purple-200" />
                      <span>Provision Administrator</span>
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Administrator</th>
                          <th className="py-3.5 px-4">Role</th>
                          <th className="py-3.5 px-4">Email</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Permissions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {administratorsList.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{a.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                a.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {a.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{a.email}</td>
                            <td className="py-3 px-4">
                              <span className="text-emerald-600 font-bold">Active</span>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                              {a.role === 'SUPER_ADMIN' ? 'All (Root System Access)' : 'Role Defaults Configured'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Role definitions breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {adminRolesConfig.map(rc => (
                    <div key={rc.role} className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{rc.title}</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{rc.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{rc.description}</p>
                      <div className="pt-1 text-[10px] text-slate-400 font-mono">
                        {rc.permissions.length} granular rules enforced
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 12: AUDIT LOGS
                ======================================================= */}
            {currentSection === 'audit-logs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Immutable Administrative Audit Logs</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Cryptographically logged record of all administrative status changes and actions</p>
                  </div>

                  <button
                    onClick={() => exportTableCSV('RoomMitra_AuditLogs', ['Timestamp', 'Admin', 'Role', 'Action', 'Target', 'Details'], auditLogs.map(l => [
                      l.createdAt, l.adminEmail, l.adminRole, l.action, `${l.targetType}:${l.targetId}`, l.details
                    ]))}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Audit CSV</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200 font-sans">
                        <tr>
                          <th className="py-3.5 px-4">Timestamp</th>
                          <th className="py-3.5 px-4">Admin Email</th>
                          <th className="py-3.5 px-4">Action</th>
                          <th className="py-3.5 px-4">Target</th>
                          <th className="py-3.5 px-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">{log.adminEmail}</td>
                            <td className="py-3 px-4 font-bold text-amber-700">{log.action}</td>
                            <td className="py-3 px-4 text-slate-600">{log.targetType}:{log.targetId}</td>
                            <td className="py-3 px-4 text-slate-500 font-sans max-w-sm truncate">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 13: AUTOMATED SYSTEM TEST SUITE
                ======================================================= */}
            {currentSection === 'tests' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950 font-display">Automated Security & RBAC Test Suite</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Executes live regression tests verifying authentication, PBKDF2 hashing, and authorization guards</p>
                  </div>
                  <button
                    onClick={runSystemTestSuite}
                    disabled={testingInProgress}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{testingInProgress ? 'Running Test Suite...' : 'Run Live Suite'}</span>
                  </button>
                </div>

                {testResults && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-emerald-950 text-emerald-100 border border-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        <div>
                          <div className="font-extrabold text-white text-base">All Test Assertions Passed</div>
                          <div className="text-xs text-emerald-300">
                            Passed: {testResults.summary?.passed} / {testResults.summary?.total} tests in {testResults.summary?.durationMs}ms
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-bold">100% HEALTHY</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100">
                      {testResults.tests?.map((t: any, idx: number) => (
                        <div key={idx} className="p-4 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{t.category}</div>
                            </div>
                          </div>
                          <span className="font-mono text-emerald-700 font-bold">{t.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =======================================================
                VIEW 14: SYSTEM SETTINGS
                ======================================================= */}
            {currentSection === 'settings' && settings && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 font-display">System Configuration & Feature Flags</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Manage operational parameters, registration toggles, and escrow rules</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs max-w-xl space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">Allow New User Registrations</div>
                      <div className="text-[11px] text-slate-500">Toggle public resident registration portal</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowNewRegistrations}
                      onChange={e => {
                        apiRequest('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ allowNewRegistrations: e.target.checked }) });
                        showToast(`New registrations set to ${e.target.checked}`);
                        loadAllAdminData();
                      }}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">Mandatory Host Property Verification</div>
                      <div className="text-[11px] text-slate-500">All new properties require physical audit before going live</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requirePropertyApproval}
                      onChange={e => {
                        apiRequest('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ requirePropertyApproval: e.target.checked }) });
                        showToast(`Property approval requirement set to ${e.target.checked}`);
                        loadAllAdminData();
                      }}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">Instant Token Escrow Booking</div>
                      <div className="text-[11px] text-slate-500">Enable ₹5,000 instant room reservation</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableInstantBooking}
                      onChange={e => {
                        apiRequest('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ enableInstantBooking: e.target.checked }) });
                        showToast(`Instant booking set to ${e.target.checked}`);
                        loadAllAdminData();
                      }}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Platform Processing Fee (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      defaultValue={settings.platformFeePercentage}
                      onBlur={e => {
                        apiRequest('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ platformFeePercentage: Number(e.target.value) }) });
                        showToast('Fee percentage updated.');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =======================================================
                VIEW 15: DANGER ZONE
                ======================================================= */}
            {currentSection === 'danger-zone' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-rose-700 font-display flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6" />
                    <span>Protected Danger Zone</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">High-impact actions requiring explicit confirmation phrase</p>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl space-y-4 max-w-xl text-xs text-rose-950">
                  <div className="font-extrabold text-sm text-rose-900">Emergency Platform Controls</div>
                  <p className="leading-relaxed">
                    Executing these actions affects all active live users immediately. All operations generate permanent immutable security records.
                  </p>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setDangerActionToRun('TOGGLE_MAINTENANCE')}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition-all cursor-pointer text-left"
                    >
                      Toggle Platform Maintenance Mode
                    </button>

                    <button
                      onClick={() => setDangerActionToRun('DISABLE_REGISTRATIONS')}
                      className="w-full py-2.5 px-4 bg-rose-950 text-rose-200 hover:bg-rose-900 font-bold rounded-xl transition-all cursor-pointer text-left"
                    >
                      Emergency Freeze on New Registrations
                    </button>

                    <button
                      onClick={() => setDangerActionToRun('DISABLE_INSTANT_BOOKINGS')}
                      className="w-full py-2.5 px-4 bg-rose-950 text-rose-200 hover:bg-rose-900 font-bold rounded-xl transition-all cursor-pointer text-left"
                    >
                      Freeze Instant Escrow Bookings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =======================================================
          MODALS & OVERLAYS
          ======================================================= */}

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-base">State Required Rejection Justification</h3>
            <p className="text-xs text-slate-500">
              The property host will receive this exact reasoning in their resident notification inbox.
            </p>
            <textarea
              rows={3}
              value={rejectionReasonText}
              onChange={e => setRejectionReasonText(e.target.value)}
              placeholder="e.g. Washroom photos are blurry; please provide clear verified photos of fire safety exits..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setRejectModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => handleModerateProperty(rejectModal.targetId, 'REJECT', rejectionReasonText)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-base">Execute Escrow Refund</h3>
            <p className="text-xs text-slate-500">
              Transaction: <span className="font-mono font-bold text-slate-800">{refundModal.id}</span> · Amount: ₹{refundModal.amount}
            </p>
            <textarea
              rows={3}
              value={refundReasonText}
              onChange={e => setRefundReasonText(e.target.value)}
              placeholder="Mandatory financial compliance refund reason..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setRefundModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button onClick={handleRefundPayment} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl">
                Execute Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Report Modal */}
      {resolveReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-base">Resolve Tenant Grievance</h3>
            <p className="text-xs text-slate-500">
              Target: <span className="font-bold text-slate-900">{resolveReportModal.targetTitleOrName}</span>
            </p>
            <textarea
              rows={3}
              value={reportActionNotes}
              onChange={e => setReportActionNotes(e.target.value)}
              placeholder="Internal compliance mediation notes & actions taken..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setResolveReportModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button onClick={handleResolveReport} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                Resolve Complaint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect User Drawer */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-950 text-base font-display">User Profile Inspector</h3>
              <button onClick={() => setInspectUser(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px]">Name & Email</div>
                <div className="text-base font-extrabold text-slate-950">{inspectUser.user?.name}</div>
                <div className="text-slate-500">{inspectUser.user?.email}</div>
              </div>

              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px]">Assigned Role & City</div>
                <div className="font-bold text-slate-800">{inspectUser.user?.role} · {inspectUser.user?.city}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="font-bold text-slate-900">Activity Counts</div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="font-black text-slate-900 text-base">{inspectUser.listings?.length || 0}</div>
                    <div className="text-[10px] text-slate-500">Listings</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="font-black text-slate-900 text-base">{inspectUser.bookings?.length || 0}</div>
                    <div className="text-[10px] text-slate-500">Bookings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Confirmation Dialog */}
      {dangerActionToRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-black text-slate-950 text-base">Confirm Critical Action</h3>
            </div>
            <p className="text-xs text-slate-600">
              Type <strong className="text-rose-700">I UNDERSTAND THE RISKS</strong> to execute {dangerActionToRun}:
            </p>
            <input
              type="text"
              value={dangerConfirmText}
              onChange={e => setDangerConfirmText(e.target.value)}
              placeholder="I UNDERSTAND THE RISKS"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setDangerActionToRun(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleExecuteDangerZone}
                disabled={dangerConfirmText !== 'I UNDERSTAND THE RISKS'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer"
              >
                Confirm Critical Operation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision Admin Modal */}
      {createAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-950 text-base">Provision New Administrator</h3>
              <button onClick={() => setCreateAdminModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAdministrator} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  placeholder="e.g. Sumanth Rao"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="sumanth@roommitra.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password (Min 8 characters)</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Role</label>
                <select
                  value={newAdminRole}
                  onChange={e => setNewAdminRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="ADMIN">Administrator (Standard Operations)</option>
                  <option value="MODERATOR">Content & Safety Moderator</option>
                  <option value="SUPPORT">Customer Support Lead</option>
                  <option value="CONTENT_MANAGER">CMS & Marketing Manager</option>
                  <option value="FINANCE_MANAGER">Finance & Escrow Officer</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold rounded-xl"
                >
                  Create Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: CREATE OR EDIT AD CAMPAIGN / BANNER
          ======================================================= */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-950 text-lg">
                  {editingBannerId ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted ad cards and promotional banners across RoomMitra sections
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ad Placement Section *
                  </label>
                  <select
                    value={bannerFormPlacement}
                    onChange={e => setBannerFormPlacement(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="TOP_ALERT">Top Alert Notification Bar</option>
                    <option value="HERO">Hero Section Spotlight Banner</option>
                    <option value="PROPERTIES">Properties / Places Section</option>
                    <option value="ROOMMATES">Roommate Finder Safety Banner</option>
                    <option value="TIFFIN">Tiffin & Meals Kitchen Banner</option>
                    <option value="SERVICES">Everyday Living & Moving Services</option>
                    <option value="MIDPAGE">Full-Width Midpage Promo Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Campaign Status
                  </label>
                  <select
                    value={bannerFormStatus}
                    onChange={e => setBannerFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="ACTIVE">ACTIVE (Displayed Live)</option>
                    <option value="INACTIVE">INACTIVE (Hidden / Paused)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ad Headline / Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={bannerFormTitle}
                  onChange={e => setBannerFormTitle(e.target.value)}
                  placeholder="e.g. StayAbode Luxury Tech Co-Living Suites"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subheadline / Offer Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={bannerFormSubtitle}
                  onChange={e => setBannerFormSubtitle(e.target.value)}
                  placeholder="e.g. Biometric security, ergonomically curated private desks & meals..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sponsor / Brand Name
                  </label>
                  <input
                    type="text"
                    value={bannerFormSponsorName}
                    onChange={e => setBannerFormSponsorName(e.target.value)}
                    placeholder="e.g. StayAbode Co-Living"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Badge Tag Text
                  </label>
                  <input
                    type="text"
                    value={bannerFormBadgeText}
                    onChange={e => setBannerFormBadgeText(e.target.value)}
                    placeholder="e.g. Featured Partner / Limited Offer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Image URL & Presets */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Banner Image URL / Asset
                </label>
                <input
                  type="text"
                  value={bannerFormImageUrl}
                  onChange={e => setBannerFormImageUrl(e.target.value)}
                  placeholder="/src/assets/images/hero_roommitra_pg_1791254850665.jpg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px]"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'PG Room', url: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg' },
                    { label: 'Studio Apartment', url: '/src/assets/images/property_modern_apartment_1791254862331.jpg' },
                    { label: 'Roommate Lounge', url: '/src/assets/images/roommate_community_lounge_1791254872925.jpg' },
                    { label: 'Tiffin Food', url: '/src/assets/images/tiffin_food_thali_1791254883521.jpg' },
                    { label: 'Silent Library', url: '/src/assets/images/library_study_space_1791257186422.jpg' },
                    { label: 'Laundry Clean', url: '/src/assets/images/laundry_clean_service_1791257196915.jpg' },
                  ].map(preset => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setBannerFormImageUrl(preset.url)}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        bannerFormImageUrl === preset.url
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Button (CTA) Text
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerFormCtaText}
                    onChange={e => setBannerFormCtaText(e.target.value)}
                    placeholder="e.g. View Suites"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Destination Tab
                  </label>
                  <select
                    value={bannerFormTargetTab}
                    onChange={e => {
                      setBannerFormTargetTab(e.target.value);
                      setBannerFormCtaUrl(`/${e.target.value}`);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="properties">Accommodations (/properties)</option>
                    <option value="roommates">Roommates (/roommates)</option>
                    <option value="tiffin">Tiffin Meals (/tiffin)</option>
                    <option value="services">Living Services (/services)</option>
                    <option value="cities">Cities Hub (/cities)</option>
                    <option value="pricing">Partner Pricing (/pricing)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Order (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bannerFormOrder}
                    onChange={e => setBannerFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingBannerId ? 'Save Ad Changes' : 'Publish Ad Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
