// Onboarding page — thin shell that loads the OnboardingFlow client component.
import OnboardingFlow from '../../../components/onboarding/OnboardingFlow';

export const metadata = { title: 'Set up your chart — Astroday' };

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
