// GET /api/paragraph — returns the daily overall paragraph for a profile.
// Query params: profileId, date (YYYY-MM-DD), timeOfDay.
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth/requireAuth';
import { getProfileById } from '../../../lib/db/profiles';
import { assembleContext } from '../../../lib/ai/context';
import { generateDailyParagraph } from '../../../lib/ai/generateDailyParagraph';
import { resolveDayData } from '../../../lib/api/resolveDayData';

const TOD_TO_HOUR = { morning: 9, afternoon: 14, evening: 20 };

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const date      = searchParams.get('date');
  const timeOfDay = searchParams.get('timeOfDay');

  if (!profileId || !date || !timeOfDay) {
    return NextResponse.json({ error: 'profileId, date, and timeOfDay are required' }, { status: 400 });
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

  const { aspects, events, scores } = await resolveDayData(profile, date);

  const context = assembleContext({
    profile,
    dailyScores: scores,
    aspects,
    planetaryEvents: events,
    date,
    hour: TOD_TO_HOUR[timeOfDay],
  });

  const paragraph = await generateDailyParagraph(context, profileId);

  return NextResponse.json({ paragraph });
}
