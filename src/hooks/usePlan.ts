import { useUser } from "@clerk/clerk-react";
import { useMemo } from "react";

export type PlanType = "free" | "pro";

export interface PlanInfo {
  plan: PlanType;
  isPro: boolean;
  isTrial: boolean;
  trialEndsAt: Date | null;
  trialDaysLeft: number | null;
}

/**
 * Reads the user's plan from Clerk publicMetadata.
 *
 * To set a user as Pro, go to Clerk Dashboard → Users → select user →
 * Public metadata → set: {"plan": "pro"}
 *
 * For free trials: {"plan": "pro", "trial_ends": "2026-03-21"}
 */
export function usePlan(): PlanInfo {
  const { user } = useUser();

  return useMemo(() => {
    // TODO: Re-enable plan checking from Clerk metadata when ready to enforce restrictions
    // const metadata = (user?.publicMetadata || {}) as Record<string, unknown>;
    // const rawPlan = metadata.plan as string | undefined;
    // const trialEnds = metadata.trial_ends as string | undefined;

    // For now, grant all users Pro access
    return {
      plan: "pro" as PlanType,
      isPro: true,
      isTrial: false,
      trialEndsAt: null,
      trialDaysLeft: null,
    };
  }, [user?.publicMetadata]);
}

/** Quality options available per plan */
export const FREE_QUALITIES = ["144", "270", "360"] as const;
export const PRO_QUALITIES = ["144", "270", "360", "480", "720", "1080", "best"] as const;

export function getAvailableQualities(isPro: boolean) {
  return isPro ? [...PRO_QUALITIES] : [...FREE_QUALITIES];
}

export function isQualityLocked(quality: string, isPro: boolean): boolean {
  if (isPro) return false;
  return !FREE_QUALITIES.includes(quality as typeof FREE_QUALITIES[number]);
}
