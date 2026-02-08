import { motion } from 'framer-motion';

export default function VetoRequestCard({ request, onVote, currentUserId, approveTokens = 0 }) {
  const isRequester = request.requesterId && currentUserId && String(request.requesterId) === String(currentUserId);
  const hasVoted = request.votes?.some((v) => v.userId === currentUserId);
  const canApprove = approveTokens >= 1 && !hasVoted;
  const approveCount = request.votes?.filter((v) => v.vote === 'approve').length ?? 0;
  const vetoCount = request.votes?.filter((v) => v.vote === 'veto').length ?? 0;
  const status = request.status || 'pending';

  if (isRequester) {
    const message =
      status === 'approved' ? 'Your veto was approved' :
      status === 'rejected' ? 'Your veto was rejected' :
      'Your request is pending';
    const detail = [request.item, request.amount != null && `$${request.amount}`].filter(Boolean).join(' — ');
    const isResolved = status === 'approved' || status === 'rejected';
    return (
      <motion.div whileHover={{ scale: 1.01 }} className="editorial-card p-4 rounded-2xl border border-dashed border-brand-pink/30">
        <p className={`text-sm font-medium ${isResolved ? (status === 'approved' ? 'text-green-700' : 'text-red-700') : 'text-gray-600'}`}>
          {status === 'approved' && '✅ '}
          {status === 'rejected' && '🚫 '}
          {message}
          {detail && <span className="text-gray-600 font-normal"> — {detail}</span>}
        </p>
      </motion.div>
    );
  }

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
          disabled={!canApprove}
          onClick={() => canApprove && onVote?.(request.id, 'approve')}
          title={!hasVoted && approveTokens < 1 ? 'Fill one full row in Pop City (Play tab) to vote Go for it on someone else\'s request' : undefined}
          className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
            !canApprove ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
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
