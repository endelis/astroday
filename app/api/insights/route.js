// GET /api/insights — returns a category insight for a profile on a given date.
// Query params: profileId, date (YYYY-MM-DD), category, timeOfDay.
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth/requireAuth';
import { getProfileById } from '../../../lib/db/profiles';
import { assembleContext } from '../../../lib/ai/context';
import { generateInsight } from '../../../lib/ai/generateInsight';
import { resolveDayData } from '../../../lib/api/resolveDayData';

const VALID_CATEGORIES = ['contacts', 'money', 'risk', 'new_projects', 'decisions'];
const TOD_TO_HOUR = { morning: 9, afternoon: 14, evening: 20 };

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const profileId  = searchParams.get('profileId');
  const date       = searchParams.get('date');
  const category   = searchParams.get('category');
  const timeOfDay  = searchParams.get('timeOfDay');

  if (!profileId || !date || !category || !timeOfDay) {
    return NextResponse.json({ error: 'profileId, date, category, and timeOfDay are required' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
  }
  if (!TOD_TO_HOUR[timeOfDay]) {
    return NextResponse.json({ error: 'timeOfDay must be morning, afternoon, or evening' }, { status: 400 });
  }

  const profile = await getProfileById(profileId);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  if (profile.user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { aspects, events, scores, categoryReasons } = await resolveDayData(profile, date);

  const context = assembleContext({
    profile,
    dailyScores: scores,
    aspects,
    planetaryEvents: events,
    date,
    hour: TOD_TO_HOUR[timeOfDay],
  });

  const score   = scores[category];
  const reasons = categoryReasons[category] ?? [];
  const insight = await generateInsight(context, category, score, reasons, profileId);

  return NextResponse.json({ insight });
}
