import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { 
  User, 
  Property, 
  RoommateProfile, 
  TiffinProvider, 
  LocalService, 
  PropertyApplication, 
  Booking, 
  PaymentTransaction, 
  Conversation, 
  Message, 
  Notification, 
  Report, 
  AuditLog, 
  SystemSettings,
  Banner,
  Announcement,
  Coupon,
  CategoryItem,
  Review,
  AdminRoleConfig,
  AdminPermission,
  UserRole
} from '../src/types/index.ts';

export interface UserCredentials {
  userId: string;
  passwordHash: string;
  salt: string;
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToVerify = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToVerify, 'hex'));
}

interface DatabaseSchema {
  users: User[];
  credentials: UserCredentials[];
  properties: Property[];
  roommateProfiles: RoommateProfile[];
  tiffinProviders: TiffinProvider[];
  localServices: LocalService[];
  applications: PropertyApplication[];
  bookings: Booking[];
  payments: PaymentTransaction[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  auditLogs: AuditLog[];
  savedProperties: { userId: string; propertyId: string }[];
  blockedUsers: { userId: string; blockedUserId: string }[];
  settings: SystemSettings;
  banners: Banner[];
  announcements: Announcement[];
  coupons: Coupon[];
  categories: CategoryItem[];
  reviews: Review[];
  adminRoles: AdminRoleConfig[];
}

function getInitialData(): DatabaseSchema {
  const defaultUsers: User[] = [
    {
      id: 'usr_super_admin_1',
      name: 'Arjun Verma',
      email: 'superadmin@roommitra.com',
      phone: '+91 98112 00001',
      role: 'SUPER_ADMIN',
      city: 'Bengaluru',
      occupation: 'System Architect',
      companyOrCollege: 'RoomMitra HQ',
      bio: 'Platform founder and infrastructure security officer.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isSuspended: false,
      isBanned: false,
      privacySettings: { hidePhone: false, hideEmail: false, allowDirectMessages: true },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr_admin_1',
      name: 'Priya Sharma',
      email: 'admin@roommitra.com',
      phone: '+91 98112 00002',
      role: 'ADMIN',
      city: 'Delhi NCR',
      occupation: 'Lead Moderator',
      companyOrCollege: 'RoomMitra Trust & Safety',
      bio: 'Property verification and community safety manager.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isSuspended: false,
      isBanned: false,
      privacySettings: { hidePhone: false, hideEmail: false, allowDirectMessages: true },
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'usr_owner_1',
      name: 'Rajesh Iyer',
      email: 'owner@roommitra.com',
      phone: '+91 98200 45678',
      role: 'PROPERTY_OWNER',
      city: 'Bengaluru',
      occupation: 'Real Estate Host & Investor',
      companyOrCollege: 'Iyer Living Spaces',
      bio: 'Hosting premium verified student and techie co-living stays in Koramangala & HSR.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isSuspended: false,
      isBanned: false,
      privacySettings: { hidePhone: false, hideEmail: false, allowDirectMessages: true },
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'usr_roommate_1',
      name: 'Ananya Deshmukh',
      email: 'roommate@roommitra.com',
      phone: '+91 97654 32109',
      role: 'ROOMMATE',
      city: 'Pune',
      occupation: 'Senior UX Designer',
      companyOrCollege: 'Fintech Unicorn, Viman Nagar',
      bio: 'Vegetarian, calm reader, early riser looking for clean flatmate in Viman Nagar/Kalyani Nagar.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isSuspended: false,
      isBanned: false,
      privacySettings: { hidePhone: true, hideEmail: true, allowDirectMessages: true },
      createdAt: '2026-01-15T12:00:00.000Z',
      updatedAt: '2026-01-15T12:00:00.000Z',
    },
    {
      id: 'usr_provider_1',
      name: 'Annapurna Kitchens',
      email: 'tiffin@roommitra.com',
      phone: '+91 99887 76655',
      role: 'SERVICE_PROVIDER',
      city: 'Bengaluru',
      occupation: 'FSSAI Certified Cloud Kitchen Chef',
      companyOrCollege: 'Annapurna Foodworks LLP',
      bio: 'Fresh, nutritious ghar-ka-khana home-style tiffins delivered on time every single day.',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isSuspended: false,
      isBanned: false,
      privacySettings: { hidePhone: false, hideEmail: false, allowDirectMessages: true },
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-01-20T08:00:00.000Z',
    },
    {
      id: 'usr_tenant_1',
      name: 'Rohan Patel',
      email: 'user@roommitra.com',
      phone: '+91 91234 56780',
      role: 'USER',
      city: 'Bengaluru',
      occupation: 'Software Engineer',
      companyOrCollege: 'SaaS Startup, Indiranagar',
      bio: 'Relocated recently from Ahmedabad. Looking for single occupancy room or chill flatmates.',
      isEmailVerified: true,
      isPhoneVerified: false,
      isIdentityVerified: false,
      isSuspended: false,
      isBanned: false,
      privacySettings: { hidePhone: false, hideEmail: true, allowDirectMessages: true },
      createdAt: '2026-02-01T14:30:00.000Z',
      updatedAt: '2026-02-01T14:30:00.000Z',
    },
  ];

  // Never hardcode credentials. Seed credentials are generated from explicit
  // environment variables during database initialization.
  const defaultCredentials: UserCredentials[] = [];

  const defaultProperties: Property[] = [
    {
      id: 'prop_blr_101',
      ownerId: 'usr_owner_1',
      ownerName: 'Rajesh Iyer',
      ownerPhone: '+91 98200 45678',
      title: 'Zest Stays Luxury Co-Living & Studio PG',
      propertyType: 'PG',
      roomType: 'SINGLE',
      genderPreference: 'UNISEX',
      address: '14th Main Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      area: 'Koramangala',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
      rentPerMonth: 14500,
      securityDeposit: 20000,
      maintenanceIncluded: true,
      availableFrom: '2026-10-15',
      occupancyCount: 1,
      amenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Daily Housekeeping', 'RO Water Purifier', 'Attached Bathroom', 'Washing Machine', 'Security / CCTV', '3-Time Meals Included'],
      rules: ['No loud music after 11 PM', 'No smoking inside rooms', 'Guests permitted until 8 PM'],
      description: 'Ultra-modern co-living studio with ergonomic study setup, hi-speed fiber internet, and home-cooked chef meals. Located 2 minutes from Sony World Signal.',
      images: [
        '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
        '/src/assets/images/roommate_community_lounge_1791254872925.jpg'
      ],
      status: 'APPROVED',
      isVerified: true,
      viewsCount: 342,
      createdAt: '2026-02-10T11:00:00.000Z',
      updatedAt: '2026-02-10T11:00:00.000Z',
    },
    {
      id: 'prop_blr_102',
      ownerId: 'usr_owner_1',
      ownerName: 'Rajesh Iyer',
      ownerPhone: '+91 98200 45678',
      title: 'Green Meadows 2BHK Furnished Tech Flat',
      propertyType: 'FLAT',
      roomType: 'DOUBLE',
      genderPreference: 'ANY',
      address: '27th Main, Sector 1, HSR Layout',
      city: 'Bengaluru',
      area: 'HSR Layout',
      pincode: '560102',
      latitude: 12.9121,
      longitude: 77.6446,
      rentPerMonth: 18000,
      securityDeposit: 35000,
      maintenanceIncluded: false,
      availableFrom: '2026-10-20',
      occupancyCount: 2,
      amenities: ['High-speed Wi-Fi', 'Power Backup', 'Geyser', 'Washing Machine', 'Refrigerator', 'Covered Two-Wheeler Parking', 'Lift Access', 'Modular Kitchen'],
      rules: ['No late night loud parties', 'Pets allowed on prior discussion'],
      description: 'Fully furnished spacious master bedroom in a quiet residential gated society. Walkable to tech parks, cafes, and 24x7 supermarkets.',
      images: [
        '/src/assets/images/property_modern_apartment_1791254862331.jpg',
        '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'
      ],
      status: 'APPROVED',
      isVerified: true,
      viewsCount: 289,
      createdAt: '2026-02-15T09:30:00.000Z',
      updatedAt: '2026-02-15T09:30:00.000Z',
    },
    {
      id: 'prop_pune_201',
      ownerId: 'usr_owner_1',
      ownerName: 'Rajesh Iyer',
      ownerPhone: '+91 98200 45678',
      title: 'Serene Heights Premium Girls PG',
      propertyType: 'PG',
      roomType: 'DOUBLE',
      genderPreference: 'FEMALE',
      address: 'Plot 42, Clover Park, Viman Nagar',
      city: 'Pune',
      area: 'Viman Nagar',
      pincode: '411014',
      latitude: 18.5679,
      longitude: 73.9143,
      rentPerMonth: 10500,
      securityDeposit: 15000,
      maintenanceIncluded: true,
      availableFrom: '2026-10-10',
      occupancyCount: 2,
      amenities: ['High-speed Wi-Fi', '24x7 Biometric Security', 'Daily Cleaning', 'RO Water', 'Nutritious Food', 'Geyser', 'Power Backup'],
      rules: ['Female residents only', 'Visiting hours till 7:30 PM', 'Smoking strictly prohibited'],
      description: 'Safe, premium female-only PG with biometric entrance, full CCTV surveillance, home-style food, and quiet study areas. Walkable to Symbiosis and tech parks.',
      images: [
        '/src/assets/images/roommate_community_lounge_1791254872925.jpg',
        '/src/assets/images/hero_roommitra_pg_1791254850665.jpg'
      ],
      status: 'APPROVED',
      isVerified: true,
      viewsCount: 198,
      createdAt: '2026-02-18T14:00:00.000Z',
      updatedAt: '2026-02-18T14:00:00.000Z',
    },
    {
      id: 'prop_hyd_301',
      ownerId: 'usr_owner_1',
      ownerName: 'Rajesh Iyer',
      ownerPhone: '+91 98200 45678',
      title: 'Cyber Nest Executive Coliving Suites',
      propertyType: 'PG',
      roomType: 'SINGLE',
      genderPreference: 'MALE',
      address: 'Near Mindspace IT Park, Madhapur',
      city: 'Hyderabad',
      area: 'Hitec City',
      pincode: '500081',
      latitude: 17.4435,
      longitude: 78.3772,
      rentPerMonth: 13000,
      securityDeposit: 18000,
      maintenanceIncluded: true,
      availableFrom: '2026-10-12',
      occupancyCount: 1,
      amenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Gym Access', 'Daily Housekeeping', 'South & North Meals'],
      rules: ['Quiet hours post 11:30 PM', 'Clean common spaces after use'],
      description: 'Ideal stay for tech professionals working in Mindspace and Cyber Towers. 24x7 high speed Wi-Fi, laundry facilities, and healthy meal options.',
      images: [
        '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
        '/src/assets/images/property_modern_apartment_1791254862331.jpg'
      ],
      status: 'APPROVED',
      isVerified: true,
      viewsCount: 215,
      createdAt: '2026-02-22T16:00:00.000Z',
      updatedAt: '2026-02-22T16:00:00.000Z',
    },
    {
      id: 'prop_pending_01',
      ownerId: 'usr_owner_1',
      ownerName: 'Rajesh Iyer',
      ownerPhone: '+91 98200 45678',
      title: 'Skyline Studio 1RK Apartment',
      propertyType: 'STUDIO',
      roomType: 'SINGLE',
      genderPreference: 'ANY',
      address: 'B-Block, Cyber City View, Gurugram',
      city: 'Delhi NCR',
      area: 'Cyber City',
      pincode: '122002',
      latitude: 28.4906,
      longitude: 77.0908,
      rentPerMonth: 21000,
      securityDeposit: 30000,
      maintenanceIncluded: false,
      availableFrom: '2026-11-01',
      occupancyCount: 1,
      amenities: ['Air Conditioning', 'High-speed Wi-Fi', 'Balcony', 'Modular Kitchen', 'Power Backup', '24x7 Guard'],
      rules: ['Advance notice of 1 month before vacating'],
      description: 'Newly finished modern 1RK studio with private balcony and granite kitchenette. Rapid Metro Cyber City is just 500 meters away.',
      images: [
        '/src/assets/images/property_modern_apartment_1791254862331.jpg'
      ],
      status: 'PENDING_REVIEW',
      isVerified: false,
      viewsCount: 12,
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    }
  ];

  const defaultRoommateProfiles: RoommateProfile[] = [
    {
      id: 'rm_prof_1',
      userId: 'usr_roommate_1',
      userName: 'Ananya Deshmukh',
      userAge: 25,
      userGender: 'FEMALE',
      avatarUrl: '',
      city: 'Pune',
      preferredAreas: ['Viman Nagar', 'Kalyani Nagar', 'Koregaon Park'],
      budgetMin: 8000,
      budgetMax: 15000,
      occupation: 'Senior UX Designer',
      companyOrCollege: 'Fintech Studio',
      foodPreference: 'VEG',
      smokingPreference: false,
      drinkingPreference: false,
      petsAllowed: true,
      sleepSchedule: 'EARLY_BIRD',
      cleanliness: 'VERY_CLEAN',
      moveInDate: '2026-10-25',
      bio: 'Calm, respectful flatmate who loves indoor plants, yoga, and weekend baking. Looking for like-minded working women to share a 2BHK.',
      interests: ['Design', 'Yoga', 'Reading', 'Baking', 'Coffee'],
      contactPreference: 'IN_APP',
      isActive: true,
      createdAt: '2026-02-05T10:00:00.000Z',
    },
    {
      id: 'rm_prof_2',
      userId: 'usr_tenant_1',
      userName: 'Rohan Patel',
      userAge: 24,
      userGender: 'MALE',
      avatarUrl: '',
      city: 'Bengaluru',
      preferredAreas: ['Koramangala', 'HSR Layout', 'Indiranagar'],
      budgetMin: 10000,
      budgetMax: 18000,
      occupation: 'Software Engineer',
      companyOrCollege: 'Tech Startup',
      foodPreference: 'EGGETARIAN',
      smokingPreference: false,
      drinkingPreference: false,
      petsAllowed: false,
      sleepSchedule: 'NIGHT_OWL',
      cleanliness: 'MODERATE',
      moveInDate: '2026-11-01',
      bio: 'Developer working in hybrid mode. Keeps common areas neat, respects quiet time during work hours, enjoys gaming on weekends.',
      interests: ['Coding', 'Gaming', 'Football', 'Podcasts'],
      contactPreference: 'IN_APP',
      isActive: true,
      createdAt: '2026-02-12T15:00:00.000Z',
    },
    {
      id: 'rm_prof_3',
      userId: 'usr_dummy_3',
      userName: 'Tanvi Kulkarni',
      userAge: 26,
      userGender: 'FEMALE',
      avatarUrl: '',
      city: 'Bengaluru',
      preferredAreas: ['Koramangala', 'BTM Layout'],
      budgetMin: 11000,
      budgetMax: 17000,
      occupation: 'Product Analyst',
      companyOrCollege: 'E-commerce Corp',
      foodPreference: 'VEG',
      smokingPreference: false,
      drinkingPreference: false,
      petsAllowed: true,
      sleepSchedule: 'FLEXIBLE',
      cleanliness: 'VERY_CLEAN',
      moveInDate: '2026-10-30',
      bio: 'Chilled out, respectful housemate looking for a clean, peaceful place with friendly flatmates.',
      interests: ['Cinema', 'Photography', 'Badminton'],
      contactPreference: 'IN_APP',
      isActive: true,
      createdAt: '2026-02-14T11:00:00.000Z',
    }
  ];

  const defaultTiffinProviders: TiffinProvider[] = [
    {
      id: 'tif_01',
      providerId: 'usr_provider_1',
      businessName: 'Annapurna Satvik Tiffins',
      contactPerson: 'Chef Ramesh',
      phone: '+91 99887 76655',
      email: 'tiffin@roommitra.com',
      city: 'Bengaluru',
      deliveryAreas: ['Koramangala', 'HSR Layout', 'BTM Layout', 'Indiranagar'],
      dietType: 'PURE_VEG',
      mealTypes: ['LUNCH', 'DINNER'],
      pricePerMeal: 110,
      monthlySubscriptionPrice: 3200,
      hygieneRating: 4.9,
      fssaiNumber: '11223344556677',
      verificationStatus: 'VERIFIED',
      sampleMenu: [
        { day: 'Monday', lunch: '4 Phulkas, Paneer Butter Masala, Dal Tadka, Jeera Rice, Salad', dinner: '3 Parathas, Aloo Gobi, Curd, Green Moong Khichdi' },
        { day: 'Tuesday', lunch: '4 Phulkas, Mixed Veg Handi, Yellow Dal, Steamed Rice, Gulab Jamun', dinner: '4 Rotis, Rajma Masala, Steamed Rice, Kachumber' },
        { day: 'Wednesday', lunch: '4 Phulkas, Chana Masala, Gujarati Dal, Veg Pulao, Raita', dinner: '3 Methi Theplas, Dum Aloo, Curd, Buttermilk' },
        { day: 'Thursday', lunch: '4 Phulkas, Matar Paneer, Dal Fry, Jeera Rice, Sweet', dinner: '4 Rotis, Bhindi Masala, Dal Makhani, Steamed Rice' },
        { day: 'Friday', lunch: '4 Phulkas, Palak Paneer, Masoor Dal, Lemon Rice, Papad', dinner: 'Veg Biryani, Mirchi ka Salan, Boondi Raita, Kheer' },
      ],
      description: 'Zero soda, low oil, 100% home-style nutritious food prepared daily in an ultra-clean FSSAI kitchen. Insulated tiffin delivery hot at your doorstep.',
      imageUrl: '/src/assets/images/tiffin_food_thali_1791254883521.jpg',
      isAcceptingOrders: true,
      createdAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 'tif_02',
      providerId: 'usr_dummy_provider_2',
      businessName: 'Maa Ki Rasoi Homemade Food',
      contactPerson: 'Sunita Devi',
      phone: '+91 98450 11223',
      email: 'maakirasoi@example.com',
      city: 'Pune',
      deliveryAreas: ['Viman Nagar', 'Kalyani Nagar', 'Magarpatta', 'Wakad'],
      dietType: 'VEG_AND_NON_VEG',
      mealTypes: ['BREAKFAST', 'LUNCH', 'DINNER'],
      pricePerMeal: 125,
      monthlySubscriptionPrice: 3600,
      hygieneRating: 4.8,
      fssaiNumber: '22334455667788',
      verificationStatus: 'VERIFIED',
      sampleMenu: [
        { day: 'Monday', lunch: '4 Chapati, Chicken Curry / Shahi Paneer, Rice, Dal', dinner: 'Khichdi, Kadhi, Papad, Achar' },
        { day: 'Wednesday', lunch: 'Egg Curry / Dum Aloo, 4 Rotis, Rice, Dal Fry', dinner: 'Pulao, Raita, Mixed Sabzi' },
      ],
      description: 'North & Maharashtrian fusion comfort food. Hot brass-catered homestyle lunch and dinner.',
      imageUrl: '/src/assets/images/tiffin_food_thali_1791254883521.jpg',
      isAcceptingOrders: true,
      createdAt: '2026-02-08T12:00:00.000Z',
    }
  ];

  const defaultLocalServices: LocalService[] = [
    {
      id: 'svc_01',
      providerId: 'usr_srv_packers',
      title: 'CitySwift Movers & Packers',
      category: 'MOVERS_PACKERS',
      city: 'Bengaluru',
      areasServed: ['All Bengaluru Metro Areas'],
      startingPrice: 1499,
      pricingUnit: 'Per Room / Shift',
      rating: 4.9,
      reviewsCount: 140,
      description: 'Bubble-wrap packing, careful transit, and unboxing assistance. No hidden charges.',
      phone: '+91 99000 88771',
      isVerified: true,
      imageUrl: '/src/assets/images/property_modern_apartment_1791254862331.jpg',
      createdAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 'svc_02',
      providerId: 'usr_srv_cleaning',
      title: 'SparkleClean Deep Cleaning & Sanitization',
      category: 'HOUSEKEEPING',
      city: 'Bengaluru',
      areasServed: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Bellandur'],
      startingPrice: 899,
      pricingUnit: 'Per Flat / PG Session',
      rating: 4.8,
      reviewsCount: 95,
      description: 'Deep bathroom scrubbing, kitchen de-greasing, vacuuming, and eco-friendly disinfectants.',
      phone: '+91 99000 88772',
      isVerified: true,
      imageUrl: '/src/assets/images/roommate_community_lounge_1791254872925.jpg',
      createdAt: '2026-02-05T10:00:00.000Z',
    },
    {
      id: 'svc_03',
      providerId: 'usr_srv_laundry',
      title: 'WashExpress Doorstep Laundry & Ironing',
      category: 'LAUNDRY',
      city: 'Pune',
      areasServed: ['Viman Nagar', 'Kalyani Nagar', 'Hinjawadi'],
      startingPrice: 399,
      pricingUnit: 'Per 5 Kg Wash & Fold',
      rating: 4.7,
      reviewsCount: 82,
      description: 'Pick-up and drop within 24 hours. Fabric-safe detergents and neat steam pressing.',
      phone: '+91 99000 88773',
      isVerified: true,
      imageUrl: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
      createdAt: '2026-02-08T10:00:00.000Z',
    }
  ];

  const defaultApplications: PropertyApplication[] = [
    {
      id: 'app_101',
      propertyId: 'prop_blr_101',
      propertyTitle: 'Zest Stays Luxury Co-Living & Studio PG',
      applicantId: 'usr_tenant_1',
      applicantName: 'Rohan Patel',
      applicantPhone: '+91 91234 56780',
      applicantEmail: 'user@roommitra.com',
      ownerId: 'usr_owner_1',
      proposedMoveInDate: '2026-10-18',
      durationMonths: 6,
      message: 'Hello Mr. Rajesh, I am a software engineer looking for a quiet single room. Would love to schedule a visit this Saturday afternoon.',
      status: 'PENDING',
      createdAt: '2026-03-01T15:00:00.000Z',
    }
  ];

  const defaultBookings: Booking[] = [
    {
      id: 'bk_201',
      propertyId: 'prop_blr_102',
      propertyTitle: 'Green Meadows 2BHK Furnished Tech Flat',
      userId: 'usr_roommate_1',
      userName: 'Ananya Deshmukh',
      ownerId: 'usr_owner_1',
      roomType: 'DOUBLE',
      rentPerMonth: 18000,
      depositAmount: 5000,
      totalPaid: 5000,
      status: 'CONFIRMED',
      paymentId: 'pay_tx_901',
      moveInDate: '2026-10-22',
      createdAt: '2026-02-28T16:00:00.000Z',
    }
  ];

  const defaultPayments: PaymentTransaction[] = [
    {
      id: 'pay_tx_901',
      bookingId: 'bk_201',
      userId: 'usr_roommate_1',
      amount: 5000,
      currency: 'INR',
      description: 'Token Deposit for Green Meadows 2BHK',
      status: 'SUCCESS',
      paymentMethod: 'UPI / NetBanking',
      gatewayTransactionId: 'RM_GATEWAY_TXN_998124',
      createdAt: '2026-02-28T16:00:00.000Z',
    }
  ];

  const defaultConversations: Conversation[] = [
    {
      id: 'conv_1',
      participants: [
        { userId: 'usr_tenant_1', name: 'Rohan Patel', role: 'USER' },
        { userId: 'usr_owner_1', name: 'Rajesh Iyer', role: 'PROPERTY_OWNER' },
      ],
      lastMessage: 'Sure Rohan, Saturday at 3 PM works fine for the property walkthrough!',
      lastMessageAt: '2026-03-01T16:30:00.000Z',
      unreadCount: 0,
      relatedPropertyId: 'prop_blr_101',
    }
  ];

  const defaultMessages: Message[] = [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'usr_tenant_1',
      senderName: 'Rohan Patel',
      receiverId: 'usr_owner_1',
      text: 'Hi Rajesh sir, is the single room available from Oct 18th?',
      isRead: true,
      createdAt: '2026-03-01T16:00:00.000Z',
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'usr_owner_1',
      senderName: 'Rajesh Iyer',
      receiverId: 'usr_tenant_1',
      text: 'Sure Rohan, Saturday at 3 PM works fine for the property walkthrough!',
      isRead: true,
      createdAt: '2026-03-01T16:30:00.000Z',
    }
  ];

  const defaultNotifications: Notification[] = [
    {
      id: 'notif_1',
      userId: 'usr_tenant_1',
      title: 'Application Received',
      message: 'Your visit request for Zest Stays Luxury Co-Living was submitted successfully.',
      type: 'APPLICATION_UPDATE',
      link: '/dashboard',
      isRead: false,
      createdAt: '2026-03-01T15:01:00.000Z',
    },
    {
      id: 'notif_2',
      userId: 'usr_owner_1',
      title: 'New Visit Request',
      message: 'Rohan Patel requested a visit for Zest Stays Luxury Co-Living.',
      type: 'APPLICATION_UPDATE',
      link: '/dashboard',
      isRead: false,
      createdAt: '2026-03-01T15:01:00.000Z',
    }
  ];

  const defaultReports: Report[] = [
    {
      id: 'rep_01',
      reporterId: 'usr_tenant_1',
      reporterName: 'Rohan Patel',
      targetType: 'PROPERTY',
      targetId: 'prop_blr_102',
      targetTitleOrName: 'Green Meadows 2BHK',
      category: 'INCORRECT_PRICING',
      description: 'The listing mentioned maintenance included in the header but excluded in terms.',
      status: 'OPEN',
      createdAt: '2026-03-02T12:00:00.000Z',
    }
  ];

  const defaultAuditLogs: AuditLog[] = [
    {
      id: 'audit_01',
      adminId: 'usr_admin_1',
      adminEmail: 'admin@roommitra.com',
      adminRole: 'ADMIN',
      action: 'APPROVE_LISTING',
      targetType: 'PROPERTY',
      targetId: 'prop_blr_101',
      details: 'Approved after verifying electricity bill and ownership documentation.',
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      createdAt: '2026-02-10T11:05:00.000Z',
    },
    {
      id: 'audit_02',
      adminId: 'usr_super_admin_1',
      adminEmail: 'superadmin@roommitra.com',
      adminRole: 'SUPER_ADMIN',
      action: 'UPDATE_SYSTEM_SETTINGS',
      targetType: 'SETTINGS',
      targetId: 'GLOBAL',
      details: 'Enforced mandatory admin verification for new rental listings.',
      ipAddress: '127.0.0.1',
      result: 'SUCCESS',
      createdAt: '2026-02-12T09:00:00.000Z',
    }
  ];

  const defaultSettings: SystemSettings = {
    allowNewRegistrations: true,
    requirePropertyApproval: true,
    requireProviderApproval: true,
    enableInstantBooking: true,
    maintenanceMode: false,
    platformFeePercentage: 2.5,
    homepageContent: {
      heroTitle: 'Everything You Need For Living, All In One Place.',
      heroSubtitle: 'Find rooms, PGs, hostels, roommates, tiffin, laundry and everyday living services — all from one trusted platform.',
      heroBadgeText: 'Zero Brokerage Guaranteed',
      statsConfig: {
        verifiedListings: '1,200+',
        activeUsers: '8,000+',
        citiesCovered: '15+',
        partnersCount: '50+',
        showStats: true,
      },
    },
    popularCities: [
      {
        id: 'city-blr',
        name: 'Bengaluru',
        state: 'Karnataka',
        tagline: 'Tech Capital · 180+ Hubs',
        listingCount: 420,
        imageUrl: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
        slug: 'bengaluru',
        isActive: true,
      },
      {
        id: 'city-pun',
        name: 'Pune',
        state: 'Maharashtra',
        tagline: 'IT & Student Hub · 95+ Hubs',
        listingCount: 280,
        imageUrl: '/src/assets/images/property_modern_apartment_1791254862331.jpg',
        slug: 'pune',
        isActive: true,
      },
      {
        id: 'city-hyd',
        name: 'Hyderabad',
        state: 'Telangana',
        tagline: 'Cyber Towers · 110+ Hubs',
        listingCount: 310,
        imageUrl: '/src/assets/images/roommate_community_lounge_1791254872925.jpg',
        slug: 'hyderabad',
        isActive: true,
      },
    ],
    faqs: [
      {
        id: 'faq-1',
        question: 'Is there truly zero brokerage on RoomMitra?',
        answer: 'Yes, 100%. Tenants connect directly with verified owners with no middleman commission.',
        category: 'GENERAL',
      },
    ],
  };

    const defaultBanners: Banner[] = [
      {
        id: 'bnr_hero',
        title: 'Zero Brokerage Fest 2026',
        subtitle: 'Save up to ₹25,000 in broker fees. Verified coliving & PG spaces with 100% deposit protection.',
        imageUrl: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
        ctaText: 'Claim Free Move-In Pass',
        ctaUrl: '/properties',
        placement: 'HERO',
        badgeText: 'Festival Special',
        sponsorName: 'RoomMitra Direct',
        targetTab: 'properties',
        clicksCount: 312,
        impressionsCount: 2450,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'ALL',
      },
      {
        id: 'bnr_top_alert',
        title: 'Semester Move-In Perk: 1st Month High-Speed WiFi & Weekly Laundry Included Free on All Verified Single PGs',
        subtitle: 'Valid for new tenants moving in this month',
        imageUrl: '/src/assets/images/property_modern_apartment_1791254862331.jpg',
        ctaText: 'Explore PGs',
        ctaUrl: '/properties',
        placement: 'TOP_ALERT',
        badgeText: 'Limited Offer',
        sponsorName: 'RoomMitra Campus',
        targetTab: 'properties',
        clicksCount: 145,
        impressionsCount: 4200,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'STUDENTS',
      },
      {
        id: 'bnr_props',
        title: 'StayAbode Luxury Tech Co-Living Suites',
        subtitle: 'Biometric security, ergonomically curated private desks, 300 Mbps fiber & 3-time chef meals in HSR & Koramangala.',
        imageUrl: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
        ctaText: 'View Suites from ₹13,500',
        ctaUrl: '/properties',
        placement: 'PROPERTIES',
        badgeText: 'Featured Partner',
        sponsorName: 'StayAbode Co-Living',
        targetTab: 'properties',
        clicksCount: 184,
        impressionsCount: 1980,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'ALL',
      },
      {
        id: 'bnr_tiffin',
        title: 'Annapurna Gourmet Homestyle Tiffin',
        subtitle: 'Zero baking soda, low oil, FSSAI certified. Free weekend sweet dish + cooling buttermilk on all monthly passes.',
        imageUrl: '/src/assets/images/tiffin_food_thali_1791254883521.jpg',
        ctaText: 'Start 7-Day Trial at ₹80/meal',
        ctaUrl: '/tiffin',
        placement: 'TIFFIN',
        badgeText: 'Certified Kitchen',
        sponsorName: 'Annapurna Cloud Kitchens',
        targetTab: 'tiffin',
        clicksCount: 228,
        impressionsCount: 2150,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'ALL',
      },
      {
        id: 'bnr_roommates',
        title: 'Flatmate Background & Lifestyle Verification',
        subtitle: 'Protect your peace of mind. Get instant ID authentication, college/workplace verification & roommate compatibility index.',
        imageUrl: '/src/assets/images/roommate_community_lounge_1791254872925.jpg',
        ctaText: 'Find Compatible Flatmates',
        ctaUrl: '/roommates',
        placement: 'ROOMMATES',
        badgeText: 'Safety First',
        sponsorName: 'RoomMitra Trust Bureau',
        targetTab: 'roommates',
        clicksCount: 96,
        impressionsCount: 1640,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'ALL',
      },
      {
        id: 'bnr_services',
        title: 'SpeedyMove Express Packers & Movers',
        subtitle: 'Special student luggage relocation between cities & local tempo shifting. Safe handling with real-time GPS tracking.',
        imageUrl: '/src/assets/images/laundry_clean_service_1791257196915.jpg',
        ctaText: 'Book Shifting at 20% Off',
        ctaUrl: '/services',
        placement: 'SERVICES',
        badgeText: 'Verified Partner',
        sponsorName: 'SpeedyMove Relocations',
        targetTab: 'services',
        clicksCount: 78,
        impressionsCount: 1120,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'ALL',
      },
      {
        id: 'bnr_midpage',
        title: 'Relocating to Bengaluru, Pune or Hyderabad for Work?',
        subtitle: 'Get a fully furnished studio, pre-vetted roommates, and hot home-cooked meals delivered from day one. Zero stress, zero brokerage.',
        imageUrl: '/src/assets/images/property_modern_apartment_1791254862331.jpg',
        ctaText: 'Get Free Relocation Consultation',
        ctaUrl: '/properties',
        placement: 'MIDPAGE',
        badgeText: 'Prime Relocation',
        sponsorName: 'RoomMitra Concierge',
        targetTab: 'properties',
        clicksCount: 420,
        impressionsCount: 3890,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
        displayOrder: 1,
        targetAudience: 'ALL',
      },
    ];

    const defaultAnnouncements: Announcement[] = [
      {
        id: 'anc_1',
        title: 'Mandatory Physical Audit Standards Update',
        message: 'All PG properties must complete verified fire safety checks and electrical audit by Oct 2026.',
        audience: 'ALL',
        startDate: '2026-09-01',
        endDate: '2026-12-31',
        priority: 'HIGH',
        status: 'ACTIVE',
        createdAt: '2026-09-01T10:00:00.000Z',
      },
      {
        id: 'anc_2',
        title: 'Direct UPI Token Deposit Escrow Protection',
        message: 'Tenants are protected by 100% money-back escrow on all reserved accommodations.',
        audience: 'ALL',
        startDate: '2026-08-15',
        endDate: '2026-11-30',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        createdAt: '2026-08-15T09:00:00.000Z',
      },
    ];

    const defaultCoupons: Coupon[] = [
      {
        id: 'cpn_1',
        code: 'ROOMMITRA1000',
        discountType: 'FIXED',
        discountValue: 1000,
        minAmount: 5000,
        maxDiscount: 1000,
        usageLimit: 500,
        usedCount: 68,
        perUserLimit: 1,
        startDate: '2026-01-01',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
      },
      {
        id: 'cpn_2',
        code: 'STUDENT10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minAmount: 3000,
        maxDiscount: 1500,
        usageLimit: 1000,
        usedCount: 142,
        perUserLimit: 1,
        startDate: '2026-01-01',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
      },
      {
        id: 'cpn_3',
        code: 'TIFFIN250',
        discountType: 'FIXED',
        discountValue: 250,
        minAmount: 2000,
        usageLimit: 250,
        usedCount: 39,
        perUserLimit: 1,
        startDate: '2026-01-01',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
      },
    ];

    const defaultCategories: CategoryItem[] = [
      { id: 'cat_rooms', name: 'Rooms', slug: 'rooms', icon: '🏠', description: 'Furnished & semi-furnished rooms', status: 'ACTIVE', displayOrder: 1 },
      { id: 'cat_pg', name: 'PG / Hostel', slug: 'pg-hostel', icon: '🏢', description: 'Affordable stays for students & professionals', status: 'ACTIVE', displayOrder: 2 },
      { id: 'cat_roommates', name: 'Roommates', slug: 'roommates', icon: '👥', description: 'Compatible flatmate matching', status: 'ACTIVE', displayOrder: 3 },
      { id: 'cat_tiffin', name: 'Tiffin / Food', slug: 'tiffin', icon: '🍱', description: 'Homely daily food deliveries', status: 'ACTIVE', displayOrder: 4 },
      { id: 'cat_laundry', name: 'Laundry', slug: 'laundry', icon: '🧺', description: 'Weight-based doorstep wash & iron', status: 'ACTIVE', displayOrder: 5 },
      { id: 'cat_library', name: 'Library', slug: 'library', icon: '📚', description: '24/7 quiet study spaces', status: 'ACTIVE', displayOrder: 6 },
      { id: 'cat_cleaning', name: 'Cleaning & Housekeeping', slug: 'cleaning', icon: '✨', description: 'Move-in sanitization and maintenance', status: 'ACTIVE', displayOrder: 7 },
      { id: 'cat_movers', name: 'Movers & Packers', slug: 'movers', icon: '🚚', description: 'Mini-tempo student relocation', status: 'ACTIVE', displayOrder: 8 },
    ];

    const defaultReviews: Review[] = [
      {
        id: 'rev_1',
        userId: 'usr_tenant_1',
        userName: 'Aarav Sharma',
        targetType: 'PROPERTY',
        targetId: 'prop_blr_101',
        targetTitle: 'Urban Oasis Luxury Executive PG',
        rating: 5,
        comment: 'Super clean single room with AC and fast Wi-Fi. What was shown in the app matched exactly. Zero brokerage was genuine!',
        status: 'PUBLISHED',
        createdAt: '2026-09-20T14:30:00.000Z',
      },
      {
        id: 'rev_2',
        userId: 'usr_tenant_2',
        userName: 'Priya Deshmukh',
        targetType: 'SERVICE',
        targetId: 'tif_blr_1',
        targetTitle: 'Annapurna Home Kitchens',
        rating: 5,
        comment: 'Hot rotis and fresh dal every single day without fail. The pause feature came in very handy when I traveled for Diwali.',
        status: 'PUBLISHED',
        createdAt: '2026-09-28T11:15:00.000Z',
      },
    ];

    const defaultAdminRoles: AdminRoleConfig[] = [
      {
        role: 'SUPER_ADMIN',
        title: 'Super Administrator',
        description: 'Root system access, role assignment, configuration & financial controls',
        permissions: [
          'users.read', 'users.edit', 'users.suspend', 'users.delete',
          'properties.read', 'properties.approve', 'properties.delete',
          'services.manage', 'bookings.read', 'bookings.manage',
          'payments.read', 'payments.refund', 'reports.manage',
          'reviews.manage', 'messages.inspect', 'content.manage',
          'marketing.manage', 'admins.manage', 'settings.manage', 'audit.read'
        ],
        userCount: 1,
      },
      {
        role: 'ADMIN',
        title: 'Administrator',
        description: 'Full day-to-day operations, user management, and listing approvals',
        permissions: [
          'users.read', 'users.edit', 'users.suspend',
          'properties.read', 'properties.approve',
          'services.manage', 'bookings.read', 'bookings.manage',
          'payments.read', 'reports.manage', 'reviews.manage',
          'content.manage', 'marketing.manage', 'audit.read'
        ],
        userCount: 1,
      },
      {
        role: 'MODERATOR',
        title: 'Content & Safety Moderator',
        description: 'Review listings, resolve tenant grievances, and enforce community standards',
        permissions: [
          'properties.read', 'properties.approve',
          'users.read', 'users.suspend',
          'reports.manage', 'reviews.manage'
        ],
        userCount: 0,
      },
      {
        role: 'SUPPORT',
        title: 'Customer Support Lead',
        description: 'Tenant assistance, booking inquiry verification, and dispute coordination',
        permissions: [
          'users.read', 'properties.read', 'bookings.read',
          'reports.manage', 'payments.read'
        ],
        userCount: 0,
      },
      {
        role: 'CONTENT_MANAGER',
        title: 'CMS & Marketing Manager',
        description: 'Manage homepage content, banners, FAQs, promo codes, and city guides',
        permissions: [
          'content.manage', 'marketing.manage', 'properties.read'
        ],
        userCount: 0,
      },
      {
        role: 'FINANCE_MANAGER',
        title: 'Finance & Escrow Officer',
        description: 'Escrow verification, payment transaction auditing, and refund issuance',
        permissions: [
          'payments.read', 'payments.refund', 'bookings.read', 'properties.read'
        ],
        userCount: 0,
      },
    ];

    return {
      users: defaultUsers,
      credentials: defaultCredentials,
      properties: defaultProperties,
      roommateProfiles: defaultRoommateProfiles,
      tiffinProviders: defaultTiffinProviders,
      localServices: defaultLocalServices,
      applications: defaultApplications,
      bookings: defaultBookings,
      payments: defaultPayments,
      conversations: defaultConversations,
      messages: defaultMessages,
      notifications: defaultNotifications,
      reports: defaultReports,
      auditLogs: defaultAuditLogs,
      savedProperties: [{ userId: 'usr_tenant_1', propertyId: 'prop_blr_101' }],
      blockedUsers: [],
      settings: defaultSettings,
      banners: defaultBanners,
      announcements: defaultAnnouncements,
      coupons: defaultCoupons,
      categories: defaultCategories,
      reviews: defaultReviews,
      adminRoles: defaultAdminRoles,
    };
  }

  const ADMIN_ROLE_SET = new Set<UserRole>([
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'SUPPORT',
    'CONTENT_MANAGER',
    'FINANCE_MANAGER',
  ]);

  function getProductionData(): DatabaseSchema {
    const initial = getInitialData();
    return {
      ...initial,
      users: [],
      credentials: [],
      properties: [],
      roommateProfiles: [],
      tiffinProviders: [],
      localServices: [],
      applications: [],
      bookings: [],
      payments: [],
      conversations: [],
      messages: [],
      notifications: [],
      reports: [],
      auditLogs: [],
      savedProperties: [],
      blockedUsers: [],
      banners: [],
      announcements: [],
      coupons: [],
      reviews: [],
      categories: initial.categories,
      adminRoles: initial.adminRoles,
      settings: initial.settings,
    };
  }

  class RoomMitraDatabase {
    private data: DatabaseSchema;
    private readonly sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
    private readyPromise: Promise<void>;
    private initialized = false;
    private saveQueue: Promise<void> = Promise.resolve();

    constructor() {
      this.data = getProductionData();
      this.readyPromise = this.initialize();
    }

    public async ready(): Promise<void> {
      return this.readyPromise;
    }

    private async initialize(): Promise<void> {
      if (!this.sql) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DATABASE_URL is required in production.');
        }
        this.data = process.env.DEMO_MODE === 'true' ? getInitialData() : getProductionData();
        this.initialized = true;
        return;
      }

      await this.sql`
        CREATE TABLE IF NOT EXISTS roommitra_state (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      const rows = await this.sql`
        SELECT data
        FROM roommitra_state
        WHERE id = 'default'
        LIMIT 1
      `;

      if (rows.length > 0) {
        const stored = rows[0]?.data;
        const initial = getProductionData();
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        this.data = this.normalizeData({ ...initial, ...(parsed || {}) });
      } else {
        this.data = process.env.DEMO_MODE === 'true' ? getInitialData() : getProductionData();
      }

      this.ensureInitialAdmin();

      this.initialized = true;
      await this.persistNow();
    }

    private normalizeData(parsed: Partial<DatabaseSchema>): DatabaseSchema {
      const initial = getProductionData();
      return {
        ...initial,
        ...parsed,
        users: Array.isArray(parsed.users) ? parsed.users : initial.users,
        credentials: Array.isArray(parsed.credentials) ? parsed.credentials : initial.credentials,
        properties: Array.isArray(parsed.properties) ? parsed.properties : initial.properties,
        roommateProfiles: Array.isArray(parsed.roommateProfiles) ? parsed.roommateProfiles : initial.roommateProfiles,
        tiffinProviders: Array.isArray(parsed.tiffinProviders) ? parsed.tiffinProviders : initial.tiffinProviders,
        localServices: Array.isArray(parsed.localServices) ? parsed.localServices : initial.localServices,
        applications: Array.isArray(parsed.applications) ? parsed.applications : initial.applications,
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : initial.bookings,
        payments: Array.isArray(parsed.payments) ? parsed.payments : initial.payments,
        conversations: Array.isArray(parsed.conversations) ? parsed.conversations : initial.conversations,
        messages: Array.isArray(parsed.messages) ? parsed.messages : initial.messages,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : initial.notifications,
        reports: Array.isArray(parsed.reports) ? parsed.reports : initial.reports,
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : initial.auditLogs,
        savedProperties: Array.isArray(parsed.savedProperties) ? parsed.savedProperties : initial.savedProperties,
        blockedUsers: Array.isArray(parsed.blockedUsers) ? parsed.blockedUsers : initial.blockedUsers,
        banners: Array.isArray(parsed.banners) ? parsed.banners : initial.banners,
        announcements: Array.isArray(parsed.announcements) ? parsed.announcements : initial.announcements,
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : initial.coupons,
        categories: Array.isArray(parsed.categories) ? parsed.categories : initial.categories,
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : initial.reviews,
        adminRoles: Array.isArray(parsed.adminRoles) ? parsed.adminRoles : initial.adminRoles,
        settings: { ...initial.settings, ...(parsed.settings || {}) },
      };
    }

    private ensureInitialAdmin(): void {
      const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      const password = process.env.INITIAL_ADMIN_PASSWORD;
      if (!email || !password) return;
      if (password.length < 12) {
        throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters long.');
      }

      const existingAdmin = this.data.users.find((user) => ADMIN_ROLE_SET.has(user.role));
      const emailTaken = this.data.users.find((user) => user.email.toLowerCase() === email);
      if (existingAdmin || emailTaken) return;

      const now = new Date().toISOString();
      const userId = `usr_${crypto.randomUUID()}`;
      const salt = generateSalt();

      const adminUser: User = {
        id: userId,
        name: process.env.INITIAL_ADMIN_NAME?.trim() || 'RoomMitra Administrator',
        email,
        phone: process.env.INITIAL_ADMIN_PHONE?.trim() || '',
        role: 'SUPER_ADMIN',
        city: process.env.INITIAL_ADMIN_CITY?.trim() || 'Ahmedabad',
        occupation: 'Platform Administrator',
        companyOrCollege: 'RoomMitra',
        bio: 'Initial platform administrator account.',
        isEmailVerified: true,
        isPhoneVerified: Boolean(process.env.INITIAL_ADMIN_PHONE),
        isIdentityVerified: true,
        isSuspended: false,
        isBanned: false,
        privacySettings: { hidePhone: true, hideEmail: true, allowDirectMessages: false },
        createdAt: now,
        updatedAt: now,
      };

      this.data.users.push(adminUser);
      this.data.credentials.push({
        userId,
        passwordHash: hashPassword(password, salt),
        salt,
      });
    }

    private async persistNow(): Promise<void> {
      if (!this.sql) return;
      const payload = JSON.stringify(this.data);
      await this.sql`
        INSERT INTO roommitra_state (id, data, updated_at)
        VALUES ('default', ${payload}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }

    public save(): void {
      if (!this.sql || !this.initialized) return;
      this.saveQueue = this.saveQueue
        .then(() => this.persistNow())
        .catch((err) => {
          console.error('[RoomMitra] PostgreSQL persistence error:', err);
        });
    }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User, password: string): User {
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    
    this.data.users.push(user);
    this.data.credentials.push({
      userId: user.id,
      passwordHash,
      salt,
    });
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[index];
  }

  public updatePassword(userId: string, newPassword: string): boolean {
    const credIndex = this.data.credentials.findIndex(c => c.userId === userId);
    if (credIndex === -1) return false;

    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);
    this.data.credentials[credIndex] = { userId, passwordHash, salt };
    this.save();
    return true;
  }

  public getCredentials(userId: string): UserCredentials | undefined {
    return this.data.credentials.find(c => c.userId === userId);
  }

  public deleteUser(userId: string): boolean {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    this.data.users.splice(userIndex, 1);
    this.data.credentials = this.data.credentials.filter(c => c.userId !== userId);
    this.data.properties = this.data.properties.filter(p => p.ownerId !== userId);
    this.data.roommateProfiles = this.data.roommateProfiles.filter(r => r.userId !== userId);
    this.save();
    return true;
  }

  // Properties
  public getProperties(): Property[] {
    return this.data.properties;
  }

  public getPropertyById(id: string): Property | undefined {
    return this.data.properties.find(p => p.id === id);
  }

  public createProperty(property: Property): Property {
    this.data.properties.push(property);
    this.save();
    return property;
  }

  public updateProperty(id: string, updates: Partial<Property>): Property | undefined {
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.data.properties[index] = {
      ...this.data.properties[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.properties[index];
  }

  public deleteProperty(id: string): boolean {
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.properties.splice(index, 1);
    this.save();
    return true;
  }

  // Roommates
  public getRoommateProfiles(): RoommateProfile[] {
    return this.data.roommateProfiles;
  }

  public getRoommateProfileByUserId(userId: string): RoommateProfile | undefined {
    return this.data.roommateProfiles.find(r => r.userId === userId);
  }

  public upsertRoommateProfile(profile: RoommateProfile): RoommateProfile {
    const index = this.data.roommateProfiles.findIndex(r => r.userId === profile.userId);
    if (index >= 0) {
      this.data.roommateProfiles[index] = profile;
    } else {
      this.data.roommateProfiles.push(profile);
    }
    this.save();
    return profile;
  }

  public updateRoommateProfile(idOrUserId: string, updates: Partial<RoommateProfile>): RoommateProfile | undefined {
    const index = this.data.roommateProfiles.findIndex(r => r.id === idOrUserId || r.userId === idOrUserId);
    if (index === -1) return undefined;
    this.data.roommateProfiles[index] = { ...this.data.roommateProfiles[index], ...updates };
    this.save();
    return this.data.roommateProfiles[index];
  }

  // Tiffin & Local Services
  public getTiffinProviders(): TiffinProvider[] {
    return this.data.tiffinProviders;
  }

  public createTiffinProvider(provider: TiffinProvider): TiffinProvider {
    this.data.tiffinProviders.push(provider);
    this.save();
    return provider;
  }

  public updateTiffinProvider(id: string, updates: Partial<TiffinProvider>): TiffinProvider | undefined {
    const index = this.data.tiffinProviders.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.data.tiffinProviders[index] = { ...this.data.tiffinProviders[index], ...updates };
    this.save();
    return this.data.tiffinProviders[index];
  }

  public getLocalServices(): LocalService[] {
    return this.data.localServices;
  }

  public createLocalService(service: LocalService): LocalService {
    this.data.localServices.push(service);
    this.save();
    return service;
  }

  // Applications
  public getApplications(): PropertyApplication[] {
    return this.data.applications;
  }

  public createApplication(app: PropertyApplication): PropertyApplication {
    this.data.applications.push(app);
    this.save();
    return app;
  }

  public updateApplicationStatus(id: string, status: PropertyApplication['status']): PropertyApplication | undefined {
    const app = this.data.applications.find(a => a.id === id);
    if (!app) return undefined;
    app.status = status;
    this.save();
    return app;
  }

  // Bookings & Payments
  public getBookings(): Booking[] {
    return this.data.bookings;
  }

  public createBooking(booking: Booking): Booking {
    this.data.bookings.push(booking);
    this.save();
    return booking;
  }

  public getPayments(): PaymentTransaction[] {
    return this.data.payments;
  }

  public createPayment(payment: PaymentTransaction): PaymentTransaction {
    this.data.payments.push(payment);
    this.save();
    return payment;
  }

  // Messaging
  public getConversations(): Conversation[] {
    return this.data.conversations;
  }

  public getConversationsForUser(userId: string): Conversation[] {
    return this.data.conversations.filter(c => 
      c.participants.some(p => p.userId === userId)
    );
  }

  public getConversationById(id: string): Conversation | undefined {
    return this.data.conversations.find(c => c.id === id);
  }

  public createConversation(conversation: Conversation): Conversation {
    this.data.conversations.push(conversation);
    this.save();
    return conversation;
  }

  public getMessagesForConversation(convId: string): Message[] {
    return this.data.messages.filter(m => m.conversationId === convId);
  }

  public createMessage(message: Message): Message {
    this.data.messages.push(message);
    const conv = this.data.conversations.find(c => c.id === message.conversationId);
    if (conv) {
      conv.lastMessage = message.text;
      conv.lastMessageAt = message.createdAt;
    }
    this.save();
    return message;
  }

  // Notifications
  public getNotificationsForUser(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public createNotification(notification: Notification): Notification {
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications
      .filter(n => n.userId === userId)
      .forEach(n => { n.isRead = true; });
    this.save();
  }

  // Saved Properties
  public getSavedProperties(userId: string): string[] {
    return this.data.savedProperties
      .filter(s => s.userId === userId)
      .map(s => s.propertyId);
  }

  public toggleSaveProperty(userId: string, propertyId: string): boolean {
    const index = this.data.savedProperties.findIndex(s => s.userId === userId && s.propertyId === propertyId);
    let isSaved = false;
    if (index >= 0) {
      this.data.savedProperties.splice(index, 1);
      isSaved = false;
    } else {
      this.data.savedProperties.push({ userId, propertyId });
      isSaved = true;
    }
    this.save();
    return isSaved;
  }

  // Blocked users
  public isUserBlocked(userId: string, targetUserId: string): boolean {
    return this.data.blockedUsers.some(b => 
      (b.userId === userId && b.blockedUserId === targetUserId) ||
      (b.userId === targetUserId && b.blockedUserId === userId)
    );
  }

  public blockUser(userId: string, blockedUserId: string): void {
    if (!this.data.blockedUsers.some(b => b.userId === userId && b.blockedUserId === blockedUserId)) {
      this.data.blockedUsers.push({ userId, blockedUserId });
      this.save();
    }
  }

  // Reports
  public getReports(): Report[] {
    return this.data.reports;
  }

  public createReport(report: Report): Report {
    this.data.reports.unshift(report);
    this.save();
    return report;
  }

  public updateReport(id: string, updates: Partial<Report>): Report | undefined {
    const report = this.data.reports.find(r => r.id === id);
    if (!report) return undefined;
    Object.assign(report, updates);
    this.save();
    return report;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // Deletions & Purge
  public deleteTiffinProvider(id: string): boolean {
    const idx = this.data.tiffinProviders.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.tiffinProviders.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public deleteLocalService(id: string): boolean {
    const idx = this.data.localServices.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.localServices.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Bookings management
  public updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return undefined;
    Object.assign(booking, updates);
    this.save();
    return booking;
  }

  // Payments management & refund
  public refundPayment(transactionId: string, reason: string): PaymentTransaction | undefined {
    const payment = this.data.payments.find(p => p.id === transactionId);
    if (!payment) return undefined;
    payment.status = 'REFUNDED';
    this.save();

    // If related booking exists, update booking
    if (payment.bookingId) {
      const booking = this.data.bookings.find(b => b.id === payment.bookingId);
      if (booking) {
        booking.status = 'CANCELLED';
        booking.paymentStatus = 'REFUNDED';
        this.save();
      }
    }
    return payment;
  }

  // Banners
  public getBanners(): Banner[] {
    return this.data.banners || [];
  }

  public createBanner(banner: Banner): Banner {
    this.data.banners = this.data.banners || [];
    this.data.banners.unshift(banner);
    this.save();
    return banner;
  }

  public updateBanner(id: string, updates: Partial<Banner>): Banner | undefined {
    this.data.banners = this.data.banners || [];
    const banner = this.data.banners.find(b => b.id === id);
    if (!banner) return undefined;
    Object.assign(banner, updates);
    this.save();
    return banner;
  }

  public deleteBanner(id: string): boolean {
    this.data.banners = this.data.banners || [];
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.banners.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public recordBannerClick(id: string): Banner | undefined {
    this.data.banners = this.data.banners || [];
    const banner = this.data.banners.find(b => b.id === id);
    if (!banner) return undefined;
    banner.clicksCount = (banner.clicksCount || 0) + 1;
    this.save();
    return banner;
  }

  public recordBannerImpression(id: string): Banner | undefined {
    this.data.banners = this.data.banners || [];
    const banner = this.data.banners.find(b => b.id === id);
    if (!banner) return undefined;
    banner.impressionsCount = (banner.impressionsCount || 0) + 1;
    this.save();
    return banner;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return this.data.announcements || [];
  }

  public createAnnouncement(announcement: Announcement): Announcement {
    this.data.announcements = this.data.announcements || [];
    this.data.announcements.unshift(announcement);
    this.save();
    return announcement;
  }

  public deleteAnnouncement(id: string): boolean {
    this.data.announcements = this.data.announcements || [];
    const idx = this.data.announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.announcements.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons || [];
  }

  public createCoupon(coupon: Coupon): Coupon {
    this.data.coupons = this.data.coupons || [];
    this.data.coupons.unshift(coupon);
    this.save();
    return coupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    this.data.coupons = this.data.coupons || [];
    const coupon = this.data.coupons.find(c => c.id === id);
    if (!coupon) return undefined;
    Object.assign(coupon, updates);
    this.save();
    return coupon;
  }

  public deleteCoupon(id: string): boolean {
    this.data.coupons = this.data.coupons || [];
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.coupons.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): CategoryItem[] {
    return this.data.categories || [];
  }

  public updateCategory(id: string, updates: Partial<CategoryItem>): CategoryItem | undefined {
    this.data.categories = this.data.categories || [];
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return undefined;
    Object.assign(cat, updates);
    this.save();
    return cat;
  }

  // Reviews
  public getReviews(): Review[] {
    return this.data.reviews || [];
  }

  public createReview(review: Review): Review {
    this.data.reviews = this.data.reviews || [];
    this.data.reviews.unshift(review);
    this.save();
    return review;
  }

  public updateReview(id: string, updates: Partial<Review>): Review | undefined {
    this.data.reviews = this.data.reviews || [];
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return undefined;
    Object.assign(rev, updates);
    this.save();
    return rev;
  }

  public deleteReview(id: string): boolean {
    this.data.reviews = this.data.reviews || [];
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.reviews.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Admin Roles
  public getAdminRoles(): AdminRoleConfig[] {
    return this.data.adminRoles || [];
  }

  public updateAdminRole(role: UserRole, permissions: AdminPermission[]): AdminRoleConfig | undefined {
    this.data.adminRoles = this.data.adminRoles || [];
    const roleConfig = this.data.adminRoles.find(r => r.role === role);
    if (!roleConfig) return undefined;
    roleConfig.permissions = permissions;
    this.save();
    return roleConfig;
  }
}

export const db = new RoomMitraDatabase();
