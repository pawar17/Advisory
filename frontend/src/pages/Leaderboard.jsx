import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const { leaderboard, loading } = useGame();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const rankEmojis = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-yellow-100">See how you stack up against others</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {leaderboard.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.user_id === user?._id;

                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 flex items-center justify-between ${
                      isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-2xl font-bold w-12 text-center">
                        {rankEmojis[entry.rank] || `#${entry.rank}`}
                      </div>

                      <div className="flex-1">
                        <p className={`font-semibold ${
                          isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {entry.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">@{entry.username}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-bold text-gray-900">{entry.points}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500">🔥</span>
                          <span className="text-sm text-gray-600">{entry.streak} days</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No leaderboard data yet
            </h3>
            <p className="text-gray-600">
              Start saving and completing quests to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
