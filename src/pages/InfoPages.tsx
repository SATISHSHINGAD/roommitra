import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

interface InfoPageProps {
  type: 'how-it-works' | 'about' | 'contact' | 'faq' | 'terms' | 'privacy' | 'refund' | 'community' | 'blog';
}

export const InfoPages: React.FC<InfoPageProps> = ({ type }) => {
  const [faqCategory, setFaqCategory] = useState<'TENANTS' | 'LANDLORDS' | 'TIFFIN'>('TENANTS');
  const [contactSuccess, setContactSuccess] = useState(false);

  if (type === 'how-it-works') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Simple & Transparent</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display mt-1">
            How RoomMitra Works
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            The quickest, safest path to a verified home, compatible flatmate, and daily home-cooked food.
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950">Search Verified Accommodations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by tech park, metro corridor, single vs double sharing, and budget. Every property displays true verified photos, amenities, and honest deposit amounts.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950">Schedule a Walkthrough or Message Directly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send an in-app visit request or message the property owner directly without any broker involvement. Your personal phone number stays protected until you decide to share.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950">Roommate Matching Compatibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Looking to split a 2BHK or 3BHK? Fill in your lifestyle preferences (sleep schedule, vegetarian/non-vegetarian, cleanliness) and our algorithm calculates compatibility percentages with active seekers.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950">Reserve with Token Deposit & Enjoy Fresh Tiffins</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lock in your room with an instant token deposit (₹5,000) that generates an official digital payment receipt. Subscribe to FSSAI certified tiffin kitchens for daily doorstep meals.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Our Purpose</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display mt-1">
            About RoomMitra
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Rebuilding trust in India's rental housing and coliving ecosystem.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            Every year, over 5 million students and young professionals relocate to Bengaluru, Pune, Hyderabad, Gurugram, and Mumbai. Despite the digital age, their search for a basic room is plagued by unscrupulous brokers, fake photos, unreturned deposits, and mismatched flatmates.
          </p>
          <p>
            <strong>RoomMitra</strong> was created to solve this from the ground up: a zero-brokerage platform where listings are physically verified, flatmate compatibility is measured scientifically, and nutritious homemade food is just a tap away.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-lg tabular-nums">10,000+</h4>
              <p className="text-xs text-slate-500 mt-1">Verified Rooms & PGs across 5 major metros</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-lg tabular-nums">₹12+ Crore</h4>
              <p className="text-xs text-slate-500 mt-1">Brokerage saved for young tenants</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h4 className="font-bold text-slate-900 text-lg tabular-nums">94%</h4>
              <p className="text-xs text-slate-500 mt-1">Successful roommate retention rate past 6 months</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'blog') {
    const articles = [
      {
        title: "How to Choose Between a PG, Shared Flat, or Studio in 2026",
        category: "Housing Guide",
        readTime: "5 min read",
        date: "Oct 2026",
        summary: "A practical breakdown of living costs, privacy tradeoffs, food options, and hidden maintenance fees for students and young tech professionals.",
        tag: "Budget & Coliving",
      },
      {
        title: "Roommate Compatibility Checklist: 7 Questions You Must Ask",
        category: "Roommate Tips",
        readTime: "4 min read",
        date: "Oct 2026",
        summary: "From sleep cycles and AC temperature preferences to chore schedules and weekend guests — how to avoid conflicts before moving in together.",
        tag: "Roommates",
      },
      {
        title: "The Ultimate Guide to Doorstep Tiffin Subscriptions in Bengaluru & Pune",
        category: "Food & Health",
        readTime: "6 min read",
        date: "Sep 2026",
        summary: "Why home-cooked style dabbas beat daily food delivery apps in nutrition, cost-efficiency, and digestive comfort for working bachelors.",
        tag: "Tiffin & Food",
      },
      {
        title: "Security Deposit Laws & Tenant Rights in India: What Every Migrant Must Know",
        category: "Legal & Safety",
        readTime: "7 min read",
        date: "Sep 2026",
        summary: "How to draft a fair rental agreement, safeguard your deposit escrow, and protect yourself against unfair deduction claims upon move-out.",
        tag: "Tenant Rights",
      },
    ];

    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Living Insights & Advice</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display mt-1">
            RoomMitra Living Blog & Resources
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Expert advice, local city insights, and practical guides for navigating shared living, flatmates, and daily services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art, idx) => (
            <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    {art.category}
                  </span>
                  <span className="text-slate-400">{art.readTime} · {art.date}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">#{art.tag}</span>
                <span className="text-amber-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Full Guide →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display mt-1">
            Contact Support & Trust Desk
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Need help with a listing, verification dispute, or deposit escrow? Our dedicated team is here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Customer Support</h4>
                <p className="text-xs text-slate-500">support@roommitra.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Trust, Safety & Grievances</h4>
                <p className="text-xs text-slate-500">safety@roommitra.com (24hr SLA)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Landlord & Host Helpline</h4>
                <p className="text-xs text-slate-500">+91 (080) 4567-8900 (10 AM - 7 PM)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Headquarters</h4>
                <p className="text-xs text-slate-500">RoomMitra Tower, 100ft Road, Koramangala 4th Block, Bengaluru 560034</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Send a Direct Inquiry</h4>
            {contactSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center">
                Message received! Our team will respond to your email within 2 hours.
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input type="text" placeholder="Your name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" placeholder="name@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea rows={3} placeholder="How can our support team assist you?" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <button
                  type="button"
                  onClick={() => setContactSuccess(true)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'faq') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Help & Answers</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display mt-1">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setFaqCategory('TENANTS')}
            className={`px-3 py-1.5 rounded-lg ${faqCategory === 'TENANTS' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            For Tenants & Roommates
          </button>
          <button
            onClick={() => setFaqCategory('LANDLORDS')}
            className={`px-3 py-1.5 rounded-lg ${faqCategory === 'LANDLORDS' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            For Property Owners
          </button>
          <button
            onClick={() => setFaqCategory('TIFFIN')}
            className={`px-3 py-1.5 rounded-lg ${faqCategory === 'TIFFIN' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            For Tiffin Services
          </button>
        </div>

        <div className="space-y-4">
          {faqCategory === 'TENANTS' && (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Is RoomMitra genuinely zero brokerage?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yes, 100%. RoomMitra does not charge tenants or flatmates any brokerage or finder fees. You communicate directly with verified hosts and roommates.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">How does RoomMitra verify properties?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Before a property receives the green "Verified" badge, an official RoomMitra field auditor visits the premise to confirm electricity meters, cleanliness, room dimensions, Wi-Fi speed, and matches ownership paperwork.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">What happens to my ₹5,000 token deposit?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The token deposit reserves the room exclusively for you and is credited directly against your first month's rent invoice upon move-in.
                </p>
              </div>
            </>
          )}

          {faqCategory === 'LANDLORDS' && (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">How long does property approval take?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our trust team reviews all new property submissions within 12 to 24 hours. Once ownership and contact records are authenticated, the listing goes live instantly.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Can I screen tenants before accepting?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Absolutely. Every applicant provides their occupation, company/college, and move-in timeline. You can schedule in-person walkthroughs or message in-app before finalizing.
                </p>
              </div>
            </>
          )}

          {faqCategory === 'TIFFIN' && (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Is an FSSAI license mandatory?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yes. To safeguard health standards for our community, all tiffin meal providers must supply their valid 14-digit FSSAI registration number during verification.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Legal policies
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Legal Document</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display mt-1">
          {type === 'terms' && 'Terms and Conditions'}
          {type === 'privacy' && 'Privacy & Data Governance Policy'}
          {type === 'refund' && 'Refund & Security Deposit Policy'}
          {type === 'community' && 'Community Safety & Anti-Discrimination Guidelines'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 · RoomMitra Legal Affairs</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {type === 'terms' && (
          <>
            <h3 className="font-bold text-slate-900 text-base">1. Platform Scope & Acceptance</h3>
            <p>
              By accessing RoomMitra, you agree to comply with our binding service terms. RoomMitra acts as a discovery and management network facilitating direct connections between tenants, accommodation hosts, flatmates, and certified tiffin providers.
            </p>
            <h3 className="font-bold text-slate-900 text-base">2. User Verification & Truthful Information</h3>
            <p>
              Users agree to provide accurate information regarding personal identification, property conditions, pricing, and dietary certifications. Misrepresenting rent figures, fake photos, or subletting without proper authorization constitutes grounds for immediate permanent expulsion.
            </p>
            <h3 className="font-bold text-slate-900 text-base">3. Prohibited Conduct</h3>
            <p>
              Users may not demand unauthorized cash commissions, engage in hate speech, discriminate based on religion, caste, gender or sexual orientation, or solicit fraudulent advance wire transfers.
            </p>
          </>
        )}

        {type === 'privacy' && (
          <>
            <h3 className="font-bold text-slate-900 text-base">1. Privacy By Design Principles</h3>
            <p>
              We prioritize data minimization and user confidentiality. Passwords are never stored in plaintext and are salted with PBKDF2 cryptography. Private phone numbers and personal emails are concealed by default.
            </p>
            <h3 className="font-bold text-slate-900 text-base">2. Consent & Data Control</h3>
            <p>
              You maintain sovereign control over your profile visibility. You may toggle phone masking, export your data, or permanently delete your account and all associated messages at any time from your Dashboard settings.
            </p>
            <h3 className="font-bold text-slate-900 text-base">3. No Sale of User Data</h3>
            <p>
              RoomMitra does not sell, rent, or trade user contact lists, rental histories, or private chat logs to third-party telemarketers or external broker syndicates.
            </p>
          </>
        )}

        {type === 'refund' && (
          <>
            <h3 className="font-bold text-slate-900 text-base">1. Token Deposit Protection</h3>
            <p>
              If a host fails to provide the agreed room upon move-in date or if the property materially differs from the verified listing photos, the tenant is entitled to a 100% full refund of their reservation token deposit.
            </p>
            <h3 className="font-bold text-slate-900 text-base">2. Tenant Cancellation Rules</h3>
            <p>
              Cancellations made greater than 7 days prior to the agreed move-in date are eligible for full refund minus processing fees. Cancellations within 48 hours of move-in date may be subject to landlord compensation forfeiture.
            </p>
            <h3 className="font-bold text-slate-900 text-base">3. Tiffin Meal Subscriptions</h3>
            <p>
              Unserved meals during paused periods or quality grievances substantiated through the complaint desk are credited back directly to the customer's wallet or original payment source.
            </p>
          </>
        )}

        {type === 'community' && (
          <>
            <h3 className="font-bold text-slate-900 text-base">1. Zero Tolerance for Discrimination</h3>
            <p>
              RoomMitra enforces a strict anti-discrimination standard. Property hosts and roommate seekers may not reject applicants based on religion, caste, ethnicity, regional origin, or sexual orientation.
            </p>
            <h3 className="font-bold text-slate-900 text-base">2. Harassment & Safety</h3>
            <p>
              Unsolicited advances, stalking, abusive language, or persistent unwanted messaging after a block will result in immediate session revocation and permanent account termination.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
