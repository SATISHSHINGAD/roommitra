// RoomMitra Universal Data Types & Contracts

export type UserRole = 
  | 'USER'
  | 'PROPERTY_OWNER'
  | 'ROOMMATE'
  | 'SERVICE_PROVIDER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'MODERATOR'
  | 'SUPPORT'
  | 'CONTENT_MANAGER'
  | 'FINANCE_MANAGER';

export type AdminPermission =
  | 'users.read'
  | 'users.edit'
  | 'users.suspend'
  | 'users.delete'
  | 'properties.read'
  | 'properties.approve'
  | 'properties.delete'
  | 'services.manage'
  | 'bookings.read'
  | 'bookings.manage'
  | 'payments.read'
  | 'payments.refund'
  | 'reports.manage'
  | 'reviews.manage'
  | 'messages.inspect'
  | 'content.manage'
  | 'marketing.manage'
  | 'admins.manage'
  | 'settings.manage'
  | 'audit.read';

export type PropertyType = 'PG' | 'FLAT' | 'ROOM' | 'SHARED' | 'STUDIO';

export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_PLUS';

export type GenderPreference = 'MALE' | 'FEMALE' | 'UNISEX' | 'ANY';

export type ListingStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'EXPIRED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type FoodPreference = 'VEG' | 'NON_VEG' | 'JAIN' | 'EGGETARIAN' | 'ANY';

export type SleepSchedule = 'EARLY_BIRD' | 'NIGHT_OWL' | 'FLEXIBLE';

export type CleanlinessLevel = 'VERY_CLEAN' | 'MODERATE' | 'RELAXED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type ServiceCategory = 
  | 'ROOMS' 
  | 'PG_HOSTEL' 
  | 'ROOMMATES' 
  | 'TIFFIN' 
  | 'LAUNDRY' 
  | 'LIBRARY' 
  | 'MOVERS_PACKERS' 
  | 'FURNITURE_RENTAL' 
  | 'HOUSEKEEPING' 
  | 'MAINTENANCE';

export type ReportCategory = 'FRAUD' | 'FAKE_LISTING' | 'ABUSIVE_BEHAVIOR' | 'INCORRECT_PRICING' | 'OTHER';

export type ReportStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  city?: string;
  occupation?: string;
  companyOrCollege?: string;
  bio?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  permissions?: AdminPermission[];
  lastActiveAt?: string;
  loginCount?: number;
  privacySettings: {
    hidePhone: boolean;
    hideEmail: boolean;
    allowDirectMessages: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  title: string;
  propertyType: PropertyType;
  roomType: RoomType;
  genderPreference: GenderPreference;
  address: string;
  city: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
  rentPerMonth: number;
  securityDeposit: number;
  maintenanceIncluded: boolean;
  availableFrom: string;
  occupancyCount: number;
  amenities: string[];
  rules: string[];
  description: string;
  images: string[];
  status: ListingStatus;
  rejectionReason?: string;
  isVerified: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoommateProfile {
  id: string;
  userId: string;
  userName: string;
  userAge?: number;
  userGender: 'MALE' | 'FEMALE' | 'OTHER';
  avatarUrl?: string;
  city: string;
  preferredAreas: string[];
  budgetMin: number;
  budgetMax: number;
  occupation: string;
  companyOrCollege?: string;
  foodPreference: FoodPreference;
  smokingPreference: boolean;
  drinkingPreference: boolean;
  petsAllowed: boolean;
  sleepSchedule: SleepSchedule;
  cleanliness: CleanlinessLevel;
  moveInDate: string;
  bio: string;
  interests: string[];
  contactPreference: 'IN_APP' | 'PHONE';
  isActive: boolean;
  createdAt: string;
}

export interface MatchScore {
  score: number; // 0 - 100
  budgetMatch: boolean;
  locationMatch: boolean;
  foodMatch: boolean;
  smokingMatch: boolean;
  sleepMatch: boolean;
  cleanlinessMatch: boolean;
  commonalities: string[];
  commonInterests: string[];
  differences: string[];
}

export interface TiffinProvider {
  id: string;
  providerId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  deliveryAreas: string[];
  dietType: 'PURE_VEG' | 'VEG_AND_NON_VEG' | 'JAIN_SPECIAL';
  mealTypes: ('BREAKFAST' | 'LUNCH' | 'DINNER')[];
  pricePerMeal: number;
  monthlySubscriptionPrice: number;
  hygieneRating: number;
  fssaiNumber: string;
  verificationStatus: VerificationStatus;
  sampleMenu: {
    day: string;
    lunch: string;
    dinner: string;
  }[];
  description: string;
  imageUrl: string;
  isAcceptingOrders: boolean;
  createdAt: string;
}

export interface LocalService {
  id: string;
  providerId: string;
  title: string;
  category: ServiceCategory;
  city: string;
  areasServed: string[];
  startingPrice: number;
  pricingUnit: string;
  rating: number;
  reviewsCount: number;
  description: string;
  phone: string;
  isVerified: boolean;
  imageUrl: string;
  createdAt: string;
}

export interface PropertyApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  applicantId: string;
  applicantName: string;
  applicantPhone?: string;
  applicantEmail: string;
  ownerId: string;
  proposedMoveInDate: string;
  durationMonths: number;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  ownerId: string;
  roomType: string;
  rentPerMonth: number;
  depositAmount: number;
  totalPaid: number;
  status: BookingStatus;
  paymentStatus?: string;
  paymentId: string;
  moveInDate: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId?: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  paymentMethod: string;
  gateway?: string;
  gatewayTransactionId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    userId: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
  }[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  relatedPropertyId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 
    | 'MESSAGE'
    | 'LISTING_APPROVED'
    | 'LISTING_REJECTED'
    | 'BOOKING_UPDATE'
    | 'APPLICATION_UPDATE'
    | 'PAYMENT_UPDATE'
    | 'SECURITY_ALERT'
    | 'ANNOUNCEMENT';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'PROPERTY' | 'USER' | 'MESSAGE' | 'SERVICE';
  targetId: string;
  targetTitleOrName: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  propertyOwners: number;
  propertiesTotal: number;
  propertiesApproved: number;
  propertiesPending: number;
  roommateProfiles: number;
  tiffinProviders: number;
  totalBookings: number;
  revenueTotal: number;
  openReports: number;
  auditEventsCount: number;
}

export interface PopularCity {
  id: string;
  name: string;
  state: string;
  tagline: string;
  listingCount: number;
  imageUrl: string;
  slug: string;
  isActive: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'GENERAL' | 'ROOMS_PG' | 'ROOMMATES' | 'TIFFIN' | 'SERVICES' | 'PARTNERS';
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText: string;
  heroImage?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  statsConfig: {
    verifiedListings: string;
    activeUsers: string;
    citiesCovered: string;
    partnersCount: string;
    showStats: boolean;
  };
  announcementBanner?: {
    text: string;
    isActive: boolean;
  };
}

export interface SystemSettings {
  allowNewRegistrations: boolean;
  requirePropertyApproval: boolean;
  requireProviderApproval: boolean;
  enableInstantBooking: boolean;
  maintenanceMode: boolean;
  platformFeePercentage: number;
  homepageContent: HomepageContent;
  popularCities: PopularCity[];
  faqs: FAQItem[];
  brandName?: string;
  supportEmail?: string;
  supportPhone?: string;
  emergencyAlert?: string;
}

export type BannerPlacement = 
  | 'HERO' 
  | 'PROPERTIES' 
  | 'TIFFIN' 
  | 'ROOMMATES' 
  | 'SERVICES' 
  | 'MIDPAGE' 
  | 'TOP_ALERT';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  placement?: BannerPlacement;
  badgeText?: string;
  sponsorName?: string;
  targetTab?: string;
  clicksCount?: number;
  impressionsCount?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'PAUSED' | 'DRAFT';
  displayOrder: number;
  targetAudience?: 'ALL' | 'STUDENTS' | 'OWNERS';
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'ALL' | 'PROPERTY_OWNERS' | 'SERVICE_PROVIDERS' | 'ADMINS';
  startDate: string;
  endDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  status: 'ACTIVE' | 'DISABLED';
  displayOrder: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetType: 'PROPERTY' | 'SERVICE' | 'ROOMMATE';
  targetId: string;
  targetTitle: string;
  rating: number;
  comment: string;
  status: 'PUBLISHED' | 'HIDDEN' | 'FLAGGED';
  moderationReason?: string;
  createdAt: string;
}

export interface AdminRoleConfig {
  role: UserRole;
  title: string;
  description: string;
  permissions: AdminPermission[];
  userCount?: number;
}

