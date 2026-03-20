// GET /api/tools — returns quick tool output for a profile. Requires Pro subscription.
// Query params: profileId, date (YYYY-MM-DD), category, toolType.
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth/requireAuth';
import { getProfileById } from '../../../lib/db/profiles';
import { getUserById } from '../../../lib/db/users';
import { assembleContext } from '../../../lib/ai/context';
import { generateQuickTool } from '../../../lib/ai/generateQuickTool';
import { resolveDayData } from '../../../lib/api/resolveDayData';

const VALID_CATEGORIES = ['contacts', 'money', 'risk', 'new_projects', 'decisions'];
const VALID_TOOLS      = ['email_opener', 'what_to_avoid', 'action_prompt'];

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Pro subscription required for quick tools.
  const user = await getUserById(auth.user.id);
  if (!user || user.subscription_tier !== 'pro') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const date      = searchParams.get('date');
  const category  = searchParams.get('category');
  const toolType  = searchParams.get('toolType');

  if (!profileId || !date || !category || !toolType) {
    return NextResponse.json({ error: 'profileId, date, category, and toolType are required' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
  }
  if (!VALID_TOOLS.includes(toolType)) {
    return NextResponse.json({ error: `Invalid toolType: ${toolType}` }, { status: 400 });
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
    hour: new Date().getHours(),
  });

  const score  = scores[category];
  const output = await generateQuickTool(context, toolType, category, score, profileId);

  return NextResponse.json({ output });
}
