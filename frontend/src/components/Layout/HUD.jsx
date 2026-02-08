import { motion } from 'framer-motion';

export default function HUD({ user, goal, onAIClick, onBack }) {
  const level = goal?.level ?? 0;
  const points = user?.stats?.points ?? 0;
  const levelProgress = Math.min(100, (points % 1000) / 10);

  return (
    <header className="px-4 pt-6 pb-4 border-b-[3px] border-brand-black flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
      <div className="flex flex-col gap-1.5 flex-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-brand-black flex items-center gap-1.5 mb-1"
          >
            <span className="text-sm">←</span> BACK
          </button>
        )}
        <h1 className="font-heading text-2xl tracking-tighter uppercase leading-none text-brand-black italic underline decoration-brand-pink decoration-4 underline-offset-4">
          SavePop
        </h1>
        <div className="flex flex-col gap-1 mt-1 max-w-[130px]">
          <div className="flex justify-between items-center text-[7px] font-mono font-black uppercase text-brand-black/40 tracking-widest">
            <span>LV.{level}</span>
            <span>{points} XP</span>
          </div>
          <div className="h-2 w-full bg-brand-cream border-2 border-brand-black rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${levelProgress}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
              className="h-full bg-brand-mint border-r-2 border-brand-black"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center px-3 py-1.5 bg-brand-yellow border-2 border-brand-black rounded-2xl shadow-[3px_3px_0px_#1A1A1A]">
          <span className="text-[7px] font-mono font-black uppercase text-brand-black/40">Coins</span>
          <div className="flex items-center gap-1">
            <span className="text-xs">💰</span>
            <span className="text-xs font-black text-brand-black">
              {(user?.stats?.currency ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onAIClick}
          className="w-10 h-10 bg-brand-lavender border-[3px] border-brand-black rounded-full flex items-center justify-center text-xl shadow-[3px_3px_0px_#1A1A1A] hover:bg-brand-pink transition-all"
        >
          🤖
        </button>
      </div>
    </header>
  );
}
