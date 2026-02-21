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
    const metadata = (user?.publicMetadata || {}) as Record<string, unknown>;
    const rawPlan = metadata.plan as string | undefined;
    const trialEnds = metadata.trial_ends as string | undefined;

    let plan: PlanType = "free";
    let isTrial = false;
    let trialEndsAt: Date | null = null;
    let trialDaysLeft: number | null = null;

    if (rawPlan === "pro") {
      // Check if it's a trial with expiry
      if (trialEnds) {
        trialEndsAt = new Date(trialEnds);
        const now = new Date();
        const diffMs = trialEndsAt.getTime() - now.getTime();
        trialDaysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        if (diffMs > 0) {
          plan = "pro";
          isTrial = true;
        } else {
          // Trial expired → back to free
          plan = "free";
          isTrial = false;
        }
      } else {
        plan = "pro";
      }
    }

    return {
      plan,
      isPro: plan === "pro",
      isTrial,
      trialEndsAt,
      trialDaysLeft,
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
