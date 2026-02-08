import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    red: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-3"
    >
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
}
