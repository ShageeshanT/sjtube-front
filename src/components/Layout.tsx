import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Download,
  History,
  Crown,
} from "lucide-react";
import { Toaster } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isPro, isTrial, trialDaysLeft } = usePlan();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/download", label: "Download", icon: Download },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-slate-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="SJ Tube" className="h-8 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Plan badge */}
            {isPro ? (
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 gap-1 text-xs">
                <Crown className="h-3 w-3" />
                PRO {isTrial && trialDaysLeft !== null ? `(${trialDaysLeft}d trial)` : ""}
              </Badge>
            ) : (
              <Link to="/upgrade">
                <Badge
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer gap-1 text-xs transition-colors"
                >
                  <Crown className="h-3 w-3" />
                  Upgrade
                </Badge>
              </Link>
            )}

            {/* User menu */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-blue-100",
                  userButtonPopoverCard: "shadow-xl border border-slate-200",
                },
              }}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex sm:hidden items-center gap-1 px-4 pb-2">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Toast ── */}
      <Toaster
        theme="light"
        position="bottom-right"
        richColors
        closeButton
      />
    </div>
  );
}
