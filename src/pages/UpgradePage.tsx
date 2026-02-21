import { Link } from "react-router-dom";
import {
  Check,
  X,
  Crown,
  Zap,
  Shield,
  Download,
  Infinity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";

export default function UpgradePage() {
  const { isPro, isTrial, trialDaysLeft } = usePlan();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get started with basic downloads",
      features: [
        { label: "144p, 270p, 360p quality", included: true },
        { label: "MP3 audio downloads", included: true },
        { label: "5 downloads per day", included: true },
        { label: "Basic dashboard", included: true },
        { label: "480p+ quality", included: false },
        { label: "1080p & Best quality", included: false },
        { label: "M4A lossless audio", included: false },
        { label: "Unlimited downloads", included: false },
      ],
      cta: isPro ? "Current: Pro" : "Current Plan",
      variant: "outline" as const,
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$4.99",
      period: "/ month",
      description: "Unlock all qualities and features",
      features: [
        { label: "All video qualities", included: true },
        { label: "Best quality (4K/8K)", included: true },
        { label: "MP3 + M4A audio", included: true },
        { label: "Unlimited downloads", included: true },
        { label: "Full dashboard stats", included: true },
        { label: "Priority downloads", included: true },
        { label: "Playlist support", included: true },
        { label: "Early access to features", included: true },
      ],
      cta: isPro ? "Current Plan ✓" : "Upgrade to Pro",
      variant: "default" as const,
      highlighted: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="text-center space-y-3 pt-4">
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs">
          <Crown className="h-3 w-3" />
          Pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Choose your plan
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Unlock higher video qualities and unlimited downloads with Pro.
        </p>
      </div>

      {/* ── Trial banner ── */}
      {isTrial && trialDaysLeft !== null && (
        <div className="mx-auto max-w-2xl rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 text-center">
          <p className="text-sm font-medium text-blue-800">
            🎉 You're on a Pro trial — <strong>{trialDaysLeft} days</strong> remaining
          </p>
        </div>
      )}

      {/* ── Pricing Cards ── */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden transition-all duration-300 ${
              plan.highlighted
                ? "border-blue-300 shadow-lg shadow-blue-100/50 glow-blue-sm scale-[1.02]"
                : "border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
            )}
            <CardContent className="p-6 space-y-6">
              {/* Plan header */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.highlighted && (
                    <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 border-0">
                      POPULAR
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? "text-slate-700" : "text-slate-400"}`}>
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${
                  plan.highlighted && !isPro
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    : ""
                }`}
                variant={plan.highlighted && !isPro ? "default" : "outline"}
                disabled={
                  (plan.name === "Free" && !isPro) ||
                  (plan.name === "Pro" && isPro)
                }
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Bottom note ── */}
      <div className="text-center space-y-2 pb-8">
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure payments</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Instant activation</span>
          <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> Cancel anytime</span>
        </div>
        <p className="text-xs text-slate-400">
          Payment integration coming soon. Contact admin to upgrade manually.
        </p>
      </div>
    </div>
  );
}
