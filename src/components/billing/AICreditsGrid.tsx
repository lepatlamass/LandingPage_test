'use client';

import { motion } from 'motion/react';
import { Eraser, Droplets, Type, Sparkles, Zap, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PerToolCredits, AISolutionId } from '@/lib/firestore/licenses';
import { AI_SOLUTION_IDS, AI_SOLUTION_META } from '@/lib/firestore/licenses';

const CREDITS_CHECKOUT =
  process.env.NEXT_PUBLIC_CHARIOW_CREDITS_CHECKOUT || '#';

/* ─────────────────────────────────────────── */
/* Icon map                                    */
/* ─────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  eraser: Eraser,
  droplets: Droplets,
  type: Type,
};

/* ─────────────────────────────────────────── */
/* Radial Progress Ring (SVG)                  */
/* ─────────────────────────────────────────── */
function RadialProgress({
  remaining,
  total,
  color,
  size = 100,
  strokeWidth = 8,
}: {
  remaining: number;
  total: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? remaining / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Animated progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────── */
/* Single AI Tool Credit Card                  */
/* ─────────────────────────────────────────── */
function AIToolCreditCard({
  toolId,
  remaining,
  total,
  index,
}: {
  toolId: AISolutionId;
  remaining: number;
  total: number;
  index: number;
}) {
  const t = useTranslations('Account.pages.subscription');
  const meta = AI_SOLUTION_META[toolId];
  const IconComponent = ICON_MAP[meta.icon] || Sparkles;
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const isLow = remaining <= 3 && remaining > 0;
  const isEmpty = remaining === 0;

  // Dynamic color based on status
  const activeColor = isEmpty
    ? '#ef4444'
    : isLow
      ? '#f59e0b'
      : meta.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/80 transition-all duration-300 hover:shadow-lg"
      style={{
        ['--card-glow' as string]: `${activeColor}10`,
      }}
    >
      {/* Subtle glow effect on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${activeColor}08 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Radial Progress */}
        <div className="relative shrink-0">
          <RadialProgress
            remaining={remaining}
            total={total}
            color={activeColor}
            size={80}
            strokeWidth={6}
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <IconComponent
              className="w-5 h-5"
              style={{ color: activeColor }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-black dark:text-white truncate mb-1">
            {meta.label}
          </h4>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: activeColor }}
            >
              {remaining}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              / {total} {t('credits')}
            </span>
          </div>

          {/* Status badge */}
          <div className="mt-1.5">
            {isEmpty ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                {t('depleted')}
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5" /> {t('low')}
              </span>
            ) : (
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {t('percentRemaining', { percent: pct })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom mini progress bar */}
      <div className="mt-4 w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: activeColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────── */
/* Main Grid Component                         */
/* ─────────────────────────────────────────── */
export default function AICreditsGrid({
  perToolCredits,
  planType,
}: {
  perToolCredits: PerToolCredits;
  planType?: 'monthly' | 'yearly';
}) {
  const t = useTranslations('Account.pages.subscription');
  // Calculate aggregate stats
  const totalCreditsUsed = AI_SOLUTION_IDS.reduce((sum, id) => {
    const tool = perToolCredits[id];
    return sum + (tool ? tool.total - tool.remaining : 0);
  }, 0);
  const totalCreditsAll = AI_SOLUTION_IDS.reduce((sum, id) => {
    const tool = perToolCredits[id];
    return sum + (tool?.total ?? 0);
  }, 0);
  const totalRemaining = totalCreditsAll - totalCreditsUsed;
  const anyDepleted = AI_SOLUTION_IDS.some(
    (id) => perToolCredits[id]?.remaining === 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Sparkles className="text-[#d4ff33] h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">{t('aiCredits')}</h2>
            <p className="text-xs text-zinc-500">
              {planType === 'yearly'
                ? t('creditsPerToolYearly')
                : t('creditsPerToolMonthly')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`text-sm font-bold ${
              anyDepleted
                ? 'text-red-400'
                : totalRemaining <= totalCreditsAll * 0.2
                  ? 'text-amber-400'
                  : 'text-[#d4ff33]'
            }`}
          >
            {totalRemaining} / {totalCreditsAll}
          </span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {t('totalRemaining')}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {AI_SOLUTION_IDS.map((toolId, i) => {
          const tool = perToolCredits[toolId];
          return (
            <AIToolCreditCard
              key={toolId}
              toolId={toolId}
              remaining={tool?.remaining ?? 0}
              total={tool?.total ?? 0}
              index={i}
            />
          );
        })}
      </div>

      {/* Buy More Credits CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={() => window.open(CREDITS_CHECKOUT, '_blank')}
          className="w-full py-3 rounded-xl bg-zinc-800 text-black dark:text-white font-bold text-sm hover:bg-zinc-700 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          <ShoppingCart className="w-4 h-4 text-[#d4ff33]" />
          {t('buyMoreCredits')}
        </button>
      </div>
    </motion.div>
  );
}
