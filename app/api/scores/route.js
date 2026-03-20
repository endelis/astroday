// GET /api/scores — calculates and returns daily scores for a profile.
// Query params: profileId (required), dates (required, comma-separated YYYY-MM-DD).
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth/requireAuth';
import { getProfileById } from '../../../lib/db/profiles';
import { getCachedScores, setCachedScores } from '../../../lib/db/scores';
import { calculateNatalChart } from '../../../lib/astro/calculateNatalChart';
import { calculateDailyTransits } from '../../../lib/astro/calculateDailyTransits';
import { detectAspects } from '../../../lib/astro/detectAspects';
import { detectPlanetaryEvents } from '../../../lib/astro/planetaryEvents';
import { scoreContacts } from '../../../lib/scoring/contacts';
import { scoreMoney } from '../../../lib/scoring/money';
import { scoreRisk } from '../../../lib/scoring/risk';
import { scoreNewProjects } from '../../../lib/scoring/newProjects';
import { scoreDecisions } from '../../../lib/scoring/decisions';

// Derive overall score from the 5 category scores using majority rule.
function calcOverall(scores) {
  const counts = { green: 0, red: 0, grey: 0 };
  for (const s of [scores.contacts, scores.money, scores.risk, scores.new_projects, scores.decisions]) {
    counts[s] = (counts[s] ?? 0) + 1;
  }
  if (counts.green >= 3) return 'green';
  if (counts.red >= 3) return 'red';
  return 'grey';
}

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const datesParam = searchParams.get('dates');

  if (!profileId || !datesParam) {
    return NextResponse.json({ error: 'profileId and dates are required' }, { status: 400 });
  }

  const dates = datesParam.split(',').map(d => d.trim()).filter(Boolean);
  if (dates.length === 0) {
    return NextResponse.json({ error: 'dates must not be empty' }, { status: 400 });
  }

  const profile = await getProfileById(profileId);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  if (profile.user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use cached natal chart if available, otherwise calculate.
  const natal = profile.natal_chart ?? calculateNatalChart({
    birthDate: profile.birth_date,
    birthTime: profile.birth_time,
    latitude: profile.birth_lat,
    longitude: profile.birth_lng,
  });

  const result = {};

  for (const date of dates) {
    const cached = await getCachedScores(profileId, date);
    if (cached) {
      result[date] = cached;
      continue;
    }

    const transits = calculateDailyTransits(date);
    const aspects = detectAspects(natal, transits);
    const events = detectPlanetaryEvents(natal, transits);

    const scores = {
      contacts:     scoreContacts(aspects, events).score,
      money:        scoreMoney(aspects, events).score,
      risk:         scoreRisk(aspects, events).score,
      new_projects: scoreNewProjects(aspects, events).score,
      decisions:    scoreDecisions(aspects, events).score,
    };
    scores.overall = calcOverall(scores);

    await setCachedScores(profileId, date, scores);
    result[date] = scores;
  }

  return NextResponse.json({ scores: result });
}
