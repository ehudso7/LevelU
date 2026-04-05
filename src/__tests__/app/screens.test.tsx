/**
 * Smoke tests for Milestone A screen rendering.
 *
 * These verify that screens render without crashing and show expected UI elements.
 * They do NOT test full integration with Supabase — that requires a running backend.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock expo modules that aren't available in test environment
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ assignmentId: 'test-id' }),
  Redirect: ({ href }: { href: string }) => null,
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-localization', () => ({
  getCalendars: () => [{ timeZone: 'America/New_York' }],
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInAnonymously: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    functions: { invoke: jest.fn() },
    storage: { from: jest.fn() },
  },
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  Severity: { Error: 'error', Warning: 'warning', Info: 'info' },
}));

jest.mock('posthog-react-native', () => ({
  PostHogProvider: ({ children }: any) => children,
  usePostHog: () => ({ capture: jest.fn() }),
}));

jest.mock('../../lib/analytics', () => ({
  trackHomeViewed: jest.fn(),
  trackDailyAssignmentsLoaded: jest.fn(),
  trackProgressViewed: jest.fn(),
  trackOnboardingStarted: jest.fn(),
  trackOnboardingCompleted: jest.fn(),
  trackQuestStarted: jest.fn(),
  trackQuestCompleted: jest.fn(),
  trackStreakExtended: jest.fn(),
  trackLevelUp: jest.fn(),
  trackArchetypeChanged: jest.fn(),
  trackProofUploadStarted: jest.fn(),
  trackProofUploadCompleted: jest.fn(),
  trackError: jest.fn(),
  setPostHogCapture: jest.fn(),
}));

jest.mock('../../lib/storage', () => ({
  getCachedJson: jest.fn().mockResolvedValue(null),
  setCachedJson: jest.fn().mockResolvedValue(undefined),
  removeCached: jest.fn().mockResolvedValue(undefined),
  CacheKeys: {
    HOME: 'cache:home',
    PROGRESS: 'cache:progress',
    ONBOARDING_VIBES: 'cache:onboarding:vibes',
    ONBOARDING_DURATION: 'cache:onboarding:duration',
  },
  isOnboardingComplete: jest.fn().mockResolvedValue(false),
  setOnboardingComplete: jest.fn().mockResolvedValue(undefined),
  clearOnboardingState: jest.fn().mockResolvedValue(undefined),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

// -------------------------------------------------------
// Onboarding Screens
// -------------------------------------------------------

describe('Onboarding Screens', () => {
  it('intro screen renders title and CTA', () => {
    const OnboardingIntro = require('../../../app/onboarding/intro').default;
    const { getByText } = render(
      <TestWrapper>
        <OnboardingIntro />
      </TestWrapper>,
    );
    expect(getByText('LEVEL')).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('vibe screen renders all 6 options', () => {
    const VibeSelection = require('../../../app/onboarding/vibe').default;
    const { getByText } = render(
      <TestWrapper>
        <VibeSelection />
      </TestWrapper>,
    );
    expect(getByText('Pick Your Vibes')).toBeTruthy();
    expect(getByText('Fitness')).toBeTruthy();
    expect(getByText('Mindfulness')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Creativity')).toBeTruthy();
    expect(getByText('Learning')).toBeTruthy();
    expect(getByText('Adventure')).toBeTruthy();
  });

  it('duration screen renders all 4 options', () => {
    const DurationSelection = require('../../../app/onboarding/duration').default;
    const { getByText } = render(
      <TestWrapper>
        <DurationSelection />
      </TestWrapper>,
    );
    expect(getByText('How Much Time?')).toBeTruthy();
    expect(getByText('Chill (5 min/day)')).toBeTruthy();
    expect(getByText('Steady (15 min/day)')).toBeTruthy();
    expect(getByText('Intense (30 min/day)')).toBeTruthy();
    expect(getByText('Beast Mode (60+ min/day)')).toBeTruthy();
  });

  it('starter-pack screen renders and shows CTA', () => {
    const StarterPack = require('../../../app/onboarding/starter-pack').default;
    const { getByText } = render(
      <TestWrapper>
        <StarterPack />
      </TestWrapper>,
    );
    expect(getByText('Your Starter Pack')).toBeTruthy();
    expect(getByText("Let's Go!")).toBeTruthy();
  });
});

// -------------------------------------------------------
// Home Screen
// -------------------------------------------------------

describe('Home Screen', () => {
  it('renders loading state initially', () => {
    const HomeScreen = require('../../../app/(tabs)/home').default;
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>,
    );
    expect(getByText('Loading your quests...')).toBeTruthy();
  });
});

// -------------------------------------------------------
// Progress Screen
// -------------------------------------------------------

describe('Progress Screen', () => {
  it('renders without crashing', () => {
    const ProgressScreen = require('../../../app/(tabs)/progress').default;
    const { getByText } = render(
      <TestWrapper>
        <ProgressScreen />
      </TestWrapper>,
    );
    // Shows loading or cached data
    expect(getByText).toBeDefined();
  });
});
