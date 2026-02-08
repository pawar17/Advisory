import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import toast from 'react-hot-toast';

const steps = [
  { id: 'welcome', title: 'Welcome to XPense', subtitle: 'Financial freedom, but make it fun.', icon: '✨' },
  { id: 'goal', title: 'What are we manifesting?', subtitle: 'Define your main financial objective.', icon: '🎯' },
];

export default function Onboarding({ onComplete }) {
  const { createGoal } = useGame();
  const [currentStep, setCurrentStep] = useState(0);
  const [goalName, setGoalName] = useState('New Home');
  const [targetAmount, setTargetAmount] = useState(5000);
  const [category, setCategory] = useState('house');
  const [loading, setLoading] = useState(false);

  const next = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await createGoal({
          goal_name: goalName,
          goal_category: category,
          target_amount: String(targetAmount),
        });
        onComplete?.();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to create goal');
      } finally {
        setLoading(false);
      }
    }
  };

  const isValid = goalName.trim() && targetAmount > 0;

  return (
    <div className="fixed inset-0 bg-brand-cream z-[100] flex flex-col items-center justify-center p-6 overflow-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -30 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
          <h2 className="font-heading text-2xl uppercase tracking-tighter leading-none text-brand-black">
            {steps[currentStep].title}
          </h2>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
            {steps[currentStep].subtitle}
          </p>

          {currentStep === 1 && (
            <div className="editorial-card p-6 space-y-4 text-left">
              <div>
                <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full border-b-2 border-brand-black font-bold text-lg py-1 focus:outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">Target ($)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full border-b-2 border-brand-black font-bold text-lg py-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {['house', 'vacation', 'debt', 'shopping', 'other'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border-2 border-brand-black ${
                      category === cat ? 'bg-brand-black text-white' : 'bg-white hover:bg-brand-yellow'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={next}
            disabled={currentStep === 1 && (!isValid || loading)}
            className="w-full editorial-button py-4 uppercase tracking-[0.2em] disabled:opacity-30 disabled:pointer-events-none"
          >
            {currentStep === steps.length - 1 ? (loading ? 'Creating...' : 'Start Playing') : 'Next Step →'}
          </button>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-10 rounded-full border-2 border-brand-black ${i === currentStep ? 'bg-brand-black w-12' : 'bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}
