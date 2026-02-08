import { motion } from 'framer-motion';

export default function VetoRequestCard({ request, onVote, currentUserId }) {
  const hasVoted = request.votes?.some((v) => v.userId === currentUserId);
  const approveCount = request.votes?.filter((v) => v.vote === 'approve').length ?? 0;
  const vetoCount = request.votes?.filter((v) => v.vote === 'veto').length ?? 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="editorial-card p-5 rounded-3xl space-y-4 border-2 border-dashed border-brand-pink/30">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{request.user?.avatar ?? '👤'}</span>
          <h4 className="font-bold text-gray-800 text-sm">{request.user?.username} is asking...</h4>
        </div>
        <span className="text-xs font-bold text-brand-pink">🛑 URGENT</span>
      </div>
      <div className="bg-white/40 p-3 rounded-2xl space-y-1">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Proposed Purchase</p>
        <p className="font-bold text-gray-800">{request.item} — ${request.amount}</p>
        <p className="text-xs text-gray-600 italic">&quot;{request.reason}&quot;</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={hasVoted}
          onClick={() => onVote?.(request.id, 'approve')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
            hasVoted ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          ✅ Go for it ({approveCount})
        </button>
        <button
          type="button"
          disabled={hasVoted}
          onClick={() => onVote?.(request.id, 'veto')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
            hasVoted ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          🚫 Veto ({vetoCount})
        </button>
      </div>
    </motion.div>
  );
}
