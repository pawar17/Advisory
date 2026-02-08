import { motion } from 'framer-motion';

const navItems = [
  { id: 'home', icon: '🏠', label: 'Main' },
  { id: 'play', icon: '🏗️', label: 'Play' },
  { id: 'quests', icon: '⭐', label: 'Quests' },
  { id: 'leaderboard', icon: '🏆', label: 'Rank' },
  { id: 'calendar', icon: '📅', label: 'Streak' },
  { id: 'social', icon: '👥', label: 'Court' },
  { id: 'profile', icon: '👤', label: 'Self' },
];

export default function BottomNav({ active, setActive }) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none"
    >
      <div className="editorial-card p-1.5 flex justify-between gap-1 rounded-full w-full max-w-lg pointer-events-auto bg-white/90 backdrop-blur-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={`relative flex-1 py-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
              active === item.id ? 'text-brand-black' : 'text-gray-400'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[7px] font-mono font-bold uppercase tracking-widest">{item.label}</span>
            {active === item.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-brand-pink -z-10 rounded-full border-2 border-brand-black"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.nav>
  );
}
