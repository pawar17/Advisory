import { useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { questService } from '../services/api';
import { useGame } from '../context/GameContext';
import toast from 'react-hot-toast';

export default function QuestCard({ quest, isActive = false }) {
  const { refreshQuests, refreshStats } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoryColors = {
    'no-spend': 'bg-red-100 text-red-800 border-red-200',
    'accelerator': 'bg-green-100 text-green-800 border-green-200',
    'social': 'bg-blue-100 text-blue-800 border-blue-200',
    'milestone': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const categoryEmojis = {
    'no-spend': '🚫',
    'accelerator': '🚀',
    'social': '👥',
    'milestone': '🎖️'
  };

  const details = quest.quest_details || quest;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await questService.accept(details._id);
      toast.success('Quest accepted!');
      refreshQuests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept quest');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data } = await questService.complete(quest._id);
      setShowConfetti(true);
      toast.success(
        `Quest Complete!\n+${data.rewards.points} points, +${data.rewards.currency} coins`,
        { duration: 4000 }
      );
      setTimeout(() => setShowConfetti(false), 5000);
      refreshQuests();
      refreshStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-4 bg-white rounded-lg shadow-md border-2 ${
          categoryColors[details.quest_category] || 'border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-3xl">
              {categoryEmojis[details.quest_category] || '🎯'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{details.quest_name}</h3>
              <p className="text-sm text-gray-600 mt-1">{details.quest_description}</p>

              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  +{details.points_reward} points
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  +{details.currency_reward} coins
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={isActive ? handleComplete : handleAccept}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap ${
              isActive
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? '...' : isActive ? 'Complete' : 'Accept'}
          </button>
        </div>

        {isActive && quest.expires_at && (
          <div className="text-xs text-gray-500 mt-2">
            Expires: {new Date(quest.expires_at).toLocaleDateString()}
          </div>
        )}
      </motion.div>
    </>
  );
}
