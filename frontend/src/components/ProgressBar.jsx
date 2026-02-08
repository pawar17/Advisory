import { motion } from 'framer-motion';

export default function ProgressBar({ current, target, level, totalLevels }) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>Level {level} of {totalLevels}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>

      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between text-sm font-semibold text-gray-900">
        <span>${current.toLocaleString()}</span>
        <span>${target.toLocaleString()}</span>
      </div>
    </div>
  );
}
