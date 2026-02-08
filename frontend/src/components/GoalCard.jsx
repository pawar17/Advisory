import { useState } from 'react';
import { motion } from 'framer-motion';
import { goalService } from '../services/api';
import { useGame } from '../context/GameContext';
import toast from 'react-hot-toast';
import ProgressBar from './ProgressBar';

export default function GoalCard({ goal }) {
  const { refreshGoals, refreshStats } = useGame();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const { data } = await goalService.contribute(goal._id, parseFloat(amount));

      if (data.level_up) {
        toast.success(
          `Level Up! You reached Level ${data.new_level}!\nEarned: ${data.rewards.points} points, ${data.rewards.currency} coins`,
          { duration: 5000 }
        );
      } else {
        toast.success('Contribution added!');
      }

      setAmount('');
      refreshGoals();
      refreshStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to contribute');
    } finally {
      setLoading(false);
    }
  };

  const categoryEmojis = {
    house: '🏠',
    vacation: '🏖️',
    debt: '💰',
    shopping: '🛍️',
    emergency: '🚨',
    other: '🎯'
  };

  const progressPercent = (goal.current_amount / goal.target_amount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{categoryEmojis[goal.goal_category] || '🎯'}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{goal.goal_name}</h3>
            <p className="text-sm text-gray-600 capitalize">{goal.goal_category} Goal</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Daily Target</p>
          <p className="text-lg font-bold text-blue-600">
            ${goal.daily_target?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <ProgressBar
        current={goal.current_amount}
        target={goal.target_amount}
        level={goal.current_level}
        totalLevels={goal.total_levels}
      />

      {goal.status === 'active' && (
        <form onSubmit={handleContribute} className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Add contribution"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      {goal.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
          <p className="text-green-800 font-semibold">Goal Completed!</p>
        </div>
      )}
    </motion.div>
  );
}
