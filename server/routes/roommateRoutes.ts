import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';
import { RoommateProfile, MatchScore } from '../../src/types/index.ts';

const router = express.Router();

export function calculateRoommateCompatibility(
  myProfile: Partial<RoommateProfile>,
  candidate: RoommateProfile
): MatchScore {
  let score = 0;
  const commonalities: string[] = [];
  const differences: string[] = [];

  // 1. Budget Compatibility (max 25 pts)
  const myMin = myProfile.budgetMin || 5000;
  const myMax = myProfile.budgetMax || 25000;
  const cMin = candidate.budgetMin;
  const cMax = candidate.budgetMax;

  const budgetOverlap = Math.max(0, Math.min(myMax, cMax) - Math.max(myMin, cMin));
  let budgetMatch = false;
  if (budgetOverlap > 0) {
    budgetMatch = true;
    score += 25;
    commonalities.push('Compatible budget range');
  } else {
    differences.push(`Budget variance: Candidate ₹${cMin.toLocaleString('en-IN')}-₹${cMax.toLocaleString('en-IN')}`);
  }

  // 2. Location Compatibility (max 25 pts)
  let locationMatch = false;
  if (myProfile.city && candidate.city.toLowerCase() === myProfile.city.toLowerCase()) {
    score += 15;
    locationMatch = true;
    // Check shared areas
    const sharedAreas = (myProfile.preferredAreas || []).filter(area => 
      candidate.preferredAreas.some(ca => ca.toLowerCase() === area.toLowerCase())
    );
    if (sharedAreas.length > 0) {
      score += 10;
      commonalities.push(`Shared area preferences: ${sharedAreas.join(', ')}`);
    } else {
      commonalities.push(`Same target city (${candidate.city})`);
    }
  } else if (candidate.city) {
    differences.push(`Located in ${candidate.city}`);
  }

  // 3. Food Preference (max 15 pts)
  let foodMatch = false;
  if (myProfile.foodPreference && (myProfile.foodPreference === candidate.foodPreference || myProfile.foodPreference === 'ANY' || candidate.foodPreference === 'ANY')) {
    foodMatch = true;
    score += 15;
    commonalities.push(`Compatible food habits (${candidate.foodPreference})`);
  } else {
    differences.push(`Dietary difference: ${candidate.foodPreference}`);
  }

  // 4. Sleep Schedule (max 15 pts)
  let sleepMatch = false;
  if (myProfile.sleepSchedule && (myProfile.sleepSchedule === candidate.sleepSchedule || myProfile.sleepSchedule === 'FLEXIBLE' || candidate.sleepSchedule === 'FLEXIBLE')) {
    sleepMatch = true;
    score += 15;
    commonalities.push(`Matching sleep rhythm (${candidate.sleepSchedule.replace('_', ' ')})`);
  } else {
    differences.push(`Sleep rhythm: ${candidate.sleepSchedule.replace('_', ' ')}`);
  }

  // 5. Smoking Preference (max 10 pts)
  let smokingMatch = false;
  if (myProfile.smokingPreference === candidate.smokingPreference) {
    smokingMatch = true;
    score += 10;
    commonalities.push(candidate.smokingPreference ? 'Both open to smoking' : 'Non-smoker compatibility');
  } else {
    differences.push(candidate.smokingPreference ? 'Candidate is a smoker' : 'Candidate prefers non-smoking');
  }

  // 6. Cleanliness (max 10 pts)
  let cleanlinessMatch = false;
  if (myProfile.cleanliness === candidate.cleanliness || candidate.cleanliness === 'MODERATE') {
    cleanlinessMatch = true;
    score += 10;
    commonalities.push(`Aligned cleanliness standard (${candidate.cleanliness.replace('_', ' ')})`);
  } else {
    differences.push(`Cleanliness standard: ${candidate.cleanliness.replace('_', ' ')}`);
  }

  // Common interests bonus
  const commonInterests = (myProfile.interests || []).filter(item => 
    candidate.interests.some(ci => ci.toLowerCase() === item.toLowerCase())
  );
  if (commonInterests.length > 0) {
    commonalities.push(`Shared interests: ${commonInterests.join(', ')}`);
  }

  return {
    score: Math.min(100, Math.max(10, score)),
    budgetMatch,
    locationMatch,
    foodMatch,
    sleepMatch,
    smokingMatch,
    cleanlinessMatch,
    commonalities,
    commonInterests,
    differences,
  };
}

// GET /api/roommates (List all active roommate profiles with filters)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { city, gender, foodPreference, smoking, sleepSchedule, maxBudget } = req.query;
    let profiles = db.getRoommateProfiles().filter(p => p.isActive);

    if (city && typeof city === 'string' && city.trim() !== '') {
      profiles = profiles.filter(p => p.city.toLowerCase() === city.toLowerCase().trim());
    }

    if (gender && typeof gender === 'string') {
      profiles = profiles.filter(p => p.userGender.toLowerCase() === gender.toLowerCase());
    }

    if (foodPreference && typeof foodPreference === 'string') {
      profiles = profiles.filter(p => p.foodPreference === foodPreference);
    }

    if (smoking !== undefined) {
      const smokingBool = smoking === 'true';
      profiles = profiles.filter(p => p.smokingPreference === smokingBool);
    }

    if (sleepSchedule && typeof sleepSchedule === 'string') {
      profiles = profiles.filter(p => p.sleepSchedule === sleepSchedule);
    }

    if (maxBudget) {
      const b = Number(maxBudget);
      if (!isNaN(b)) {
        profiles = profiles.filter(p => p.budgetMin <= b);
      }
    }

    // Mask sensitive contact details if user prefers in-app contact
    const safeProfiles = profiles.map(p => {
      const user = db.getUserById(p.userId);
      return {
        ...p,
        phone: user?.privacySettings?.hidePhone ? undefined : user?.phone,
        email: user?.privacySettings?.hideEmail ? undefined : user?.email,
      };
    });

    return res.json({ profiles: safeProfiles });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve roommate profiles.' });
  }
});

// GET /api/roommates/matches (Get calculated matches for current user)
router.get('/matches', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const myProfile = db.getRoommateProfileByUserId(currentUserId);

    // Fallback preferences if user hasn't made a dedicated roommate profile yet
    const basePreferences: Partial<RoommateProfile> = myProfile || {
      city: req.user!.city || 'Bengaluru',
      budgetMin: 8000,
      budgetMax: 20000,
      foodPreference: 'VEG',
      sleepSchedule: 'FLEXIBLE',
      smokingPreference: false,
      cleanliness: 'MODERATE',
      interests: ['Reading', 'Technology'],
      preferredAreas: ['Koramangala', 'HSR Layout'],
    };

    const candidates = db.getRoommateProfiles().filter(p => p.userId !== currentUserId && p.isActive);

    const scoredCandidates = candidates.map(candidate => {
      const matchDetails = calculateRoommateCompatibility(basePreferences, candidate);
      const user = db.getUserById(candidate.userId);
      return {
        profile: {
          ...candidate,
          phone: user?.privacySettings?.hidePhone ? undefined : user?.phone,
        },
        match: matchDetails,
      };
    });

    // Sort by highest compatibility score first
    scoredCandidates.sort((a, b) => b.match.score - a.match.score);

    return res.json({ 
      userHasProfile: Boolean(myProfile),
      matches: scoredCandidates 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute roommate matches.' });
  }
});

// POST /api/roommates/profile (Create or update personal roommate profile)
router.post('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      userGender,
      city,
      preferredAreas,
      budgetMin,
      budgetMax,
      occupation,
      companyOrCollege,
      foodPreference,
      smokingPreference,
      drinkingPreference,
      petsAllowed,
      sleepSchedule,
      cleanliness,
      moveInDate,
      bio,
      interests,
    } = req.body;

    if (!city || !budgetMax || !occupation) {
      return res.status(400).json({ error: 'City, budget, and occupation are required.' });
    }

    const existing = db.getRoommateProfileByUserId(req.user!.id);
    const newProfile: RoommateProfile = {
      id: existing?.id || `rm_prof_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: req.user!.id,
      userName: req.user!.name,
      userGender: userGender || 'OTHER',
      avatarUrl: req.user!.avatarUrl || '',
      city: String(city).trim(),
      preferredAreas: Array.isArray(preferredAreas) ? preferredAreas : ['City Center'],
      budgetMin: Number(budgetMin) || 5000,
      budgetMax: Number(budgetMax) || 20000,
      occupation: String(occupation).trim(),
      companyOrCollege: companyOrCollege ? String(companyOrCollege).trim() : req.user!.companyOrCollege,
      foodPreference: foodPreference || 'VEG',
      smokingPreference: Boolean(smokingPreference),
      drinkingPreference: Boolean(drinkingPreference),
      petsAllowed: Boolean(petsAllowed),
      sleepSchedule: sleepSchedule || 'FLEXIBLE',
      cleanliness: cleanliness || 'MODERATE',
      moveInDate: moveInDate || new Date().toISOString().split('T')[0],
      bio: bio ? String(bio).trim() : '',
      interests: Array.isArray(interests) ? interests : ['Music', 'Fitness'],
      contactPreference: 'IN_APP',
      isActive: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    db.upsertRoommateProfile(newProfile);
    return res.json({ message: 'Roommate profile updated successfully!', profile: newProfile });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save roommate profile.' });
  }
});

export default router;
