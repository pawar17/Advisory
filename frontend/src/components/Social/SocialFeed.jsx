import { motion } from 'framer-motion';

export default function SocialFeed({ posts, onNudge }) {
  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="editorial-card p-4 rounded-3xl space-y-3 bg-white"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl bg-brand-cream w-10 h-10 flex items-center justify-center rounded-full border border-brand-black/10">
                {post.user?.avatar ?? '👤'}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">@{post.user?.username ?? 'user'}</p>
                <p className="text-[10px] text-gray-400 font-mono uppercase">{post.timestamp}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-brand-yellow border border-brand-black rounded-full text-[9px] font-bold uppercase">
              {post.type}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{post.content}</p>
          <div className="flex gap-3 pt-1">
            <button type="button" className="px-3 py-1.5 bg-brand-cream border border-brand-black rounded-full text-[9px] font-bold uppercase">
              ❤️ {post.likes}
            </button>
            <button
              type="button"
              onClick={() => onNudge?.(post.user?.username ?? '')}
              className="px-3 py-1.5 bg-brand-black text-white rounded-full text-[9px] font-bold uppercase"
            >
              🔥 Nudge
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
