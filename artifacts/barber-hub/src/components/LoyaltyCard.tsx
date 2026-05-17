import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface LoyaltyMilestone {
  points: number;
  reward: string;
  icon: string;
}

export const LOYALTY_MILESTONES: LoyaltyMilestone[] = [
  { points: 50,  reward: "Free Beard Trim",            icon: "✂️" },
  { points: 100, reward: "50% off any service",        icon: "🏷️" },
  { points: 200, reward: "Free Classic Cut",           icon: "💈" },
  { points: 350, reward: "VIP Priority Booking",       icon: "⚡" },
  { points: 500, reward: "Free Premium Service",       icon: "👑" },
];

export const TIERS: { name: LoyaltyTier; min: number; max: number; color: string; bg: string; ring: string }[] = [
  { name: "Bronze",   min: 0,   max: 99,   color: "text-amber-700",  bg: "bg-amber-50  dark:bg-amber-950/30",  ring: "ring-amber-300" },
  { name: "Silver",   min: 100, max: 299,  color: "text-slate-500",  bg: "bg-slate-50  dark:bg-slate-900/30",  ring: "ring-slate-300" },
  { name: "Gold",     min: 300, max: 499,  color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", ring: "ring-yellow-300" },
  { name: "Platinum", min: 500, max: Infinity, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", ring: "ring-violet-300" },
];

export function getTier(points: number) {
  return TIERS.find(t => points >= t.min && points <= t.max) ?? TIERS[0];
}

export function getNextMilestone(points: number): LoyaltyMilestone | null {
  return LOYALTY_MILESTONES.find(m => m.points > points) ?? null;
}

export function getUnlockedMilestones(points: number): LoyaltyMilestone[] {
  return LOYALTY_MILESTONES.filter(m => m.points <= points);
}

interface LoyaltyProgressProps {
  points: number;
  compact?: boolean;
}

/** Compact bar shown in the client list table */
export function LoyaltyProgressBar({ points, compact }: LoyaltyProgressProps) {
  const tier = getTier(points);
  const next = getNextMilestone(points);
  const prevMilestone = LOYALTY_MILESTONES.slice().reverse().find(m => m.points <= points);
  const prevPoints = prevMilestone?.points ?? 0;
  const nextPoints = next?.points ?? 500;
  const pct = next
    ? Math.min(100, ((points - prevPoints) / (nextPoints - prevPoints)) * 100)
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", tier.name === "Platinum" ? "bg-violet-500" : tier.name === "Gold" ? "bg-yellow-400" : tier.name === "Silver" ? "bg-slate-400" : "bg-amber-600")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn("text-xs font-semibold tabular-nums", tier.color)}>{points}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{prevPoints} pts</span>
        {next && <span>{next.points} pts — {next.reward}</span>}
        {!next && <span>Max tier reached!</span>}
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            tier.name === "Platinum" ? "bg-gradient-to-r from-violet-400 to-violet-600" :
            tier.name === "Gold"     ? "bg-gradient-to-r from-yellow-300 to-yellow-500" :
            tier.name === "Silver"   ? "bg-gradient-to-r from-slate-300 to-slate-500" :
                                       "bg-gradient-to-r from-amber-400 to-amber-700"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Tier badge pill */
export function TierBadge({ points, className }: { points: number; className?: string }) {
  const tier = getTier(points);
  const icons: Record<LoyaltyTier, string> = {
    Bronze: "🥉", Silver: "🥈", Gold: "🥇", Platinum: "💎",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1",
      tier.bg, tier.color, tier.ring, className
    )}>
      {icons[tier.name]} {tier.name}
    </span>
  );
}

/** Full loyalty card for client detail page */
export function LoyaltyCard({ points }: { points: number }) {
  const tier = getTier(points);
  const next = getNextMilestone(points);
  const unlocked = getUnlockedMilestones(points);
  const nextTier = TIERS.find(t => t.min > (TIERS.find(t2 => t2.name === tier.name)?.min ?? 0));

  return (
    <div className={cn("rounded-2xl border-2 p-6 space-y-5", tier.ring, tier.bg)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Loyalty Status</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-black tabular-nums", tier.color)}>{points}</span>
            <span className="text-muted-foreground text-sm font-medium">points</span>
          </div>
        </div>
        <TierBadge points={points} className="text-sm px-3 py-1" />
      </div>

      {/* Progress to next milestone */}
      {next ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Next reward</span>
            <span className={cn("font-semibold", tier.color)}>{next.points - points} pts away</span>
          </div>
          <LoyaltyProgressBar points={points} />
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="text-base">{next.icon}</span> {next.reward}
          </p>
        </div>
      ) : (
        <p className={cn("text-sm font-semibold", tier.color)}>You've reached the top tier! 👑</p>
      )}

      {/* Next tier info */}
      {nextTier && (
        <p className="text-xs text-muted-foreground">
          Reach <strong>{nextTier.min} points</strong> to unlock <strong>{nextTier.name}</strong> status.
        </p>
      )}

      {/* All milestones */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reward Milestones</p>
        <ul className="space-y-2">
          {LOYALTY_MILESTONES.map(m => {
            const isUnlocked = points >= m.points;
            return (
              <li key={m.points} className={cn(
                "flex items-center gap-3 text-sm rounded-lg px-3 py-2 transition-colors",
                isUnlocked
                  ? "bg-background/60 border border-border/60"
                  : "opacity-50"
              )}>
                <span className="text-base w-6 text-center">{isUnlocked ? m.icon : "🔒"}</span>
                <span className="flex-1">{m.reward}</span>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  isUnlocked ? tier.color : "text-muted-foreground"
                )}>
                  {isUnlocked ? "Unlocked" : `${m.points} pts`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Unlocked rewards CTA */}
      {unlocked.length > 0 && (
        <div className="rounded-xl bg-background/70 border border-border p-3 flex items-center gap-3">
          <Gift className={cn("h-5 w-5 shrink-0", tier.color)} />
          <p className="text-sm">
            <span className="font-semibold">{unlocked.length} reward{unlocked.length > 1 ? "s" : ""} unlocked.</span>{" "}
            <span className="text-muted-foreground">Show this to your barber to redeem.</span>
          </p>
        </div>
      )}
    </div>
  );
}
