import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import StatCard from '../components/StatCard';
import GoalCard from '../components/GoalCard';
import CreateGoalModal from '../components/CreateGoalModal';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, goals, loading } = useGame();
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeGoal = goals.find(g => g.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Let's crush those savings goals</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="⭐" label="Points" value={stats.points} color="yellow" />
          <StatCard icon="💰" label="Currency" value={stats.currency} color="green" />
          <StatCard icon="🔥" label="Streak" value={`${stats.streak} days`} color="red" />
          <StatCard
            icon="🏆"
            label="Best Streak"
            value={`${stats.longest_streak} days`}
            color="purple"
          />
        </div>

        {/* Active Goal */}
        {activeGoal ? (
          <GoalCard goal={activeGoal} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Active Goals
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first savings goal to start your journey!
            </p>
            <button
              onClick={() => setShowCreateGoal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Create Your First Goal
            </button>
          </motion.div>
        )}

        {/* Completed Goals */}
        {goals.filter(g => g.status === 'completed').length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Goals</h2>
            <div className="space-y-4">
              {goals.filter(g => g.status === 'completed').map(goal => (
                <GoalCard key={goal._id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Create Goal Button (if has active goal) */}
        {activeGoal && (
          <button
            onClick={() => setShowCreateGoal(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium"
          >
            + Create Another Goal
          </button>
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
      />
    </div>
  );
}
