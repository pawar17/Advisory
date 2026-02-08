import { useState } from 'react';
import { motion } from 'framer-motion';

const themeMap = {
  'no-spend': { color: 'bg-brand-pink', icon: '🚫' },
  'milestone': { color: 'bg-brand-mint', icon: '🎯' },
  'accelerator': { color: 'bg-brand-lavender', icon: '🚀' },
  'social': { color: 'bg-brand-yellow', icon: '👥' },
};

export default function QuestCard({ quest, onAccept, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const theme = themeMap[quest.category] || themeMap.milestone;

  const handleAction = async (fn) => {
    setIsProcessing(true);
    try {
      await fn(quest.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      layout
      className={`editorial-card p-5 rounded-[2rem] transition-all ${
        quest.status === 'completed' ? 'opacity-40 grayscale pointer-events-none' : 'bg-white'
      }`}
    >
      <div className="flex gap-4 items-start">
        <div className={`text-2xl ${theme.color} border-2 border-brand-black w-12 h-12 min-w-[3rem] flex items-center justify-center rounded-2xl shadow-[2px_2px_0px_#1A1A1A]`}>
          {theme.icon}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-heading text-sm text-brand-black uppercase leading-none tracking-tighter">{quest.name}</h4>
              <span className="text-[8px] font-mono font-bold uppercase text-gray-400">{quest.category}</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-tight">{quest.description}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-cream border border-brand-black rounded-full text-[8px] font-bold uppercase">
              <span>⭐</span> +{quest.pointsReward} XP
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-cream border border-brand-black rounded-full text-[8px] font-bold uppercase">
              <span>💰</span> +{quest.currencyReward} COINS
            </div>
          </div>
          <div className="pt-1">
            {quest.status === 'active' && onComplete && (
              <div className="space-y-3">
                <div className="w-full bg-brand-cream h-2 border border-brand-black rounded-full overflow-hidden">
                  <motion.div animate={{ width: '40%' }} className="h-full bg-brand-yellow" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={isProcessing}
                  onClick={() => handleAction(onComplete)}
                  className="w-full py-3 bg-brand-black text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#FFD6E8]"
                >
                  {isProcessing ? 'Verifying...' : 'Finish Quest ✨'}
                </motion.button>
              </div>
            )}
            {quest.status === 'available' && onAccept && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={isProcessing}
                onClick={() => handleAction(onAccept)}
                className="w-full py-3 border-2 border-brand-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-brand-cream"
              >
                {isProcessing ? 'Enrolling...' : 'Accept Mission'}
              </motion.button>
            )}
            {quest.status === 'completed' && (
              <div className="w-full py-2 flex items-center justify-center gap-2 text-green-600 font-bold font-mono text-[9px] uppercase">
                <span>✓</span> REWARDS CLAIMED
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
