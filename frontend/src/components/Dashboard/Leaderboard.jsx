import { motion } from 'framer-motion';

export default function Leaderboard({ leaderboard = [], currentUserId, limit = 10, emptyMessage = 'No rankings yet. Earn XP to climb!' }) {
  const list = (leaderboard || []).slice(0, limit);
  if (list.length === 0) {
    return (
      <div className="editorial-card p-6 border-2 border-dashed border-brand-black/20 text-center">
        <p className="text-2xl mb-2">🏆</p>
        <p className="font-mono text-[10px] uppercase font-bold text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="font-heading text-sm uppercase tracking-widest border-b-2 border-brand-black pb-1 flex items-center gap-2">
        <span>🏆</span> Leaderboard
      </h3>
      <div className="editorial-card p-3 sm:p-4 rounded-2xl border-2 border-brand-black shadow-[4px_4px_0px_#1A1A1A] space-y-1">
        {list.map((entry, i) => {
          const isYou = currentUserId && String(entry.user_id) === String(currentUserId);
          const rank = entry.rank ?? i + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${
                isYou ? 'bg-brand-pink/30 border-2 border-brand-black' : 'bg-white/60 hover:bg-white/80'
              }`}
            >
              <div className="w-8 shrink-0 flex justify-center font-heading text-sm font-bold text-brand-black">
                {medal || `#${rank}`}
              </div>
              <div className="w-8 h-8 shrink-0 rounded-full bg-brand-mint border-2 border-brand-black flex items-center justify-center text-sm font-bold text-brand-black">
                {(entry.name || entry.username || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm text-brand-black truncate">
                  {entry.name || entry.username || 'Anonymous'}
                  {isYou && <span className="ml-1.5 text-[10px] font-mono text-gray-600">(you)</span>}
                </p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  {entry.points ?? 0} XP · {entry.streak ?? 0} day streak
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
