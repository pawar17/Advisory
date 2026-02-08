import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { goalService } from '../services/api';
import { useGame } from '../context/GameContext';
import toast from 'react-hot-toast';

export default function CreateGoalModal({ isOpen, onClose }) {
  const { refreshGoals } = useGame();
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_category: 'other',
    target_amount: '',
    target_date: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'house', label: 'House', emoji: '🏠' },
    { value: 'vacation', label: 'Vacation', emoji: '🏖️' },
    { value: 'debt', label: 'Debt Payoff', emoji: '💰' },
    { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { value: 'emergency', label: 'Emergency Fund', emoji: '🚨' },
    { value: 'other', label: 'Other', emoji: '🎯' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await goalService.create(formData);
      toast.success('Goal created successfully!');
      refreshGoals();
      onClose();
      setFormData({
        goal_name: '',
        goal_category: 'other',
        target_amount: '',
        target_date: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Goal</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.goal_name}
                    onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Buy a House"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal_category: cat.value })}
                        className={`p-3 rounded-md border-2 text-center transition-all ${
                          formData.goal_category === cat.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.emoji}</div>
                        <div className="text-xs font-medium">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
