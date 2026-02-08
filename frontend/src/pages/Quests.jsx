import { useGame } from '../context/GameContext';
import QuestCard from '../components/QuestCard';
import { motion } from 'framer-motion';

export default function Quests() {
  const { activeQuests, availableQuests, loading } = useGame();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h1 className="text-2xl font-bold">Side Quests</h1>
        <p className="text-purple-100">Complete quests to earn bonus rewards</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Quests</h2>
            <div className="space-y-4">
              {activeQuests.map((quest) => (
                <QuestCard key={quest._id} quest={quest} isActive={true} />
              ))}
            </div>
          </div>
        )}

        {/* Available Quests */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {activeQuests.length > 0 ? 'Available Quests' : 'All Quests'}
          </h2>

          {availableQuests.length > 0 ? (
            <div className="space-y-4">
              {availableQuests.map((quest) => (
                <QuestCard key={quest._id} quest={quest} isActive={false} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No quests available
              </h3>
              <p className="text-gray-600">
                Check back later for new challenges!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
