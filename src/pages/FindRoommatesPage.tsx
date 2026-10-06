import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Check, 
  X as CloseIcon, 
  Sparkles, 
  MessageSquare, 
  Briefcase, 
  Clock, 
  Heart, 
  ShieldCheck,
  Percent,
  SlidersHorizontal
} from 'lucide-react';
import { RoommateProfile, MatchScore } from '../types/index.ts';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface FindRoommatesPageProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const FindRoommatesPage: React.FC<FindRoommatesPageProps> = ({ setCurrentTab, openAuthModal }) => {
  const { user } = useAuth();

  // Filters
  const [city, setCity] = useState('Bengaluru');
  const [gender, setGender] = useState('ALL');
  const [foodPreference, setFoodPreference] = useState('');
  const [sleepSchedule, setSleepSchedule] = useState('');
  const [smoking, setSmoking] = useState<string>('');

  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [matches, setMatches] = useState<{ profile: RoommateProfile; match: MatchScore }[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected candidate for deep compatibility view
  const [selectedMatch, setSelectedMatch] = useState<{ profile: RoommateProfile; match?: MatchScore } | null>(null);

  // Message modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      if (user) {
        // Fetch calculated matches based on user's profile
        const data = await apiRequest<{ matches: { profile: RoommateProfile; match: MatchScore }[] }>('/api/roommates/matches');
        setMatches(data.matches);
        setProfiles(data.matches.map(m => m.profile));
      } else {
        // Public list
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (gender !== 'ALL') params.append('gender', gender);
        if (foodPreference) params.append('foodPreference', foodPreference);
        if (sleepSchedule) params.append('sleepSchedule', sleepSchedule);
        if (smoking) params.append('smoking', smoking);

        const data = await apiRequest<{ profiles: RoommateProfile[] }>(`/api/roommates?${params.toString()}`);
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error('Failed to load roommate profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user, city, gender, foodPreference, sleepSchedule, smoking]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedMatch || !messageText.trim()) return;

    try {
      setMessageError(null);
      await apiRequest('/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selectedMatch.profile.userId,
          text: messageText,
        }),
      });
      setMessageSuccess('Message sent! You can continue the conversation in your Dashboard Messages.');
      setTimeout(() => {
        setMessageModalOpen(false);
        setMessageSuccess(null);
        setMessageText('');
      }, 2000);
    } catch (err: any) {
      setMessageError(err.message || 'Failed to send message.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 font-display">
          Roommate Discovery & Compatibility
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Find like-minded, verified flatmates based on sleep rhythms, food habits, budget, and lifestyle.
        </p>
      </div>

      {/* User profile prompt banner if logged in */}
      {user && (
        <div className="p-4 bg-amber-500/10 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-950">
                Compatibility Scoring Active for {user.name}
              </h4>
              <p className="text-xs text-slate-600">
                Profiles below are ranked using your dietary preferences, budget alignment, and sleep schedules.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Update My Preferences
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">City</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Gender</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="ALL">Any Gender</option>
            <option value="FEMALE">Female Flatmate</option>
            <option value="MALE">Male Flatmate</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Food Preference</label>
          <select
            value={foodPreference}
            onChange={e => setFoodPreference(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">Any Diet</option>
            <option value="VEG">Vegetarian</option>
            <option value="NON_VEG">Non-Vegetarian</option>
            <option value="JAIN">Jain</option>
            <option value="EGGETARIAN">Eggetarian</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sleep Rhythm</label>
          <select
            value={sleepSchedule}
            onChange={e => setSleepSchedule(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">Any Rhythm</option>
            <option value="EARLY_BIRD">Early Riser (6 AM)</option>
            <option value="NIGHT_OWL">Night Owl (Post 12 AM)</option>
            <option value="FLEXIBLE">Flexible</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Smoking</label>
          <select
            value={smoking}
            onChange={e => setSmoking(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">Any</option>
            <option value="false">Strictly Non-Smoking</option>
            <option value="true">Open to Smoking</option>
          </select>
        </div>
      </div>

      {/* Profiles Grid */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Calculating compatibility matches...</div>
        ) : profiles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No roommate profiles match this filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the diet or sleep schedule filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => {
              const matchObj = matches.find(m => m.profile.id === profile.id);
              const score = matchObj ? matchObj.match.score : 85;

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header with avatar & compatibility score */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-base">
                          {profile.userName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">{profile.userName}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>{profile.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{score}% Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      "{profile.bio}"
                    </p>

                    {/* Key Attributes */}
                    <div className="space-y-2 text-xs border-y border-slate-100 py-3">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Occupation
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[140px]">{profile.occupation}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Sleep Rhythm
                        </span>
                        <span className="font-semibold text-slate-900">{profile.sleepSchedule.replace('_', ' ')}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Dietary Habit</span>
                        <span className="font-semibold text-slate-900">{profile.foodPreference}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Budget Range</span>
                        <span className="font-bold text-amber-700 tabular-nums">
                          ₹{profile.budgetMin.toLocaleString('en-IN')} - ₹{profile.budgetMax.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Interests tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {profile.interests.map((interest, i) => (
                        <span key={i} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedMatch({ profile, match: matchObj?.match })}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Match Breakdown
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMatch({ profile, match: matchObj?.match });
                        setMessageModalOpen(true);
                      }}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compatibility Modal */}
      {selectedMatch && !messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-950 font-display">
                  Compatibility with {selectedMatch.profile.userName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMatch.profile.occupation} · {selectedMatch.profile.city}
                </p>
              </div>
              <button onClick={() => setSelectedMatch(null)}>
                <CloseIcon className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            {/* Score pill */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <div className="text-2xl font-black text-emerald-900 tabular-nums">
                {selectedMatch.match?.score || 88}%
              </div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-0.5">
                Calculated Lifestyle Compatibility
              </div>
            </div>

            {/* Commonalities */}
            <div>
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> What You Have In Common
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {(selectedMatch.match?.commonalities || [
                  'Both prefer clean and quiet living space',
                  'Aligned vegetarian food preferences',
                  'Budget fits in expected range',
                ]).map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Differences */}
            <div>
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Points to Discuss
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {(selectedMatch.match?.differences && selectedMatch.match.differences.length > 0 ? selectedMatch.match.differences : [
                  'Slight variance in wake-up times (flexible)',
                  'Weekend guest policies to be clarified',
                ]).map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => setMessageModalOpen(true)}
                className="px-5 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Message {selectedMatch.profile.userName.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct In-App Message Modal */}
      {messageModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-display">
                Send In-App Message to {selectedMatch.profile.userName}
              </h3>
              <button onClick={() => setMessageModalOpen(false)}>
                <CloseIcon className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {messageSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-bold">
                {messageSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={`Hi ${selectedMatch.profile.userName.split(' ')[0]}, saw your profile on RoomMitra! I am looking for a flatmate in ${selectedMatch.profile.city}...`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Your phone number and email remain private. All communications take place securely through RoomMitra.
                </div>
                {messageError && (
                  <div className="p-2.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-lg border border-rose-200">
                    {messageError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Send Private Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
