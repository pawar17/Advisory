import { motion } from 'framer-motion';

export default function StatCard({ icon, value, label, color }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`min-w-[100px] flex-1 p-4 rounded-[1.5rem] border-2 border-brand-black shadow-[4px_4px_0px_#1A1A1A] ${color} flex flex-col items-center gap-1`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-heading text-brand-black leading-none uppercase">{value}</div>
      <div className="text-[9px] font-mono font-bold text-gray-600 uppercase tracking-tighter text-center">{label}</div>
    </motion.div>
  );
}
