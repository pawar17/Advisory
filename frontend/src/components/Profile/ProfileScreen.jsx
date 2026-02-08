import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ user, goal }) {
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-brand-pink border-2 border-brand-black rounded-full flex items-center justify-center text-4xl shadow-[4px_4px_0px_#1A1A1A]">
          {user?.avatar || (user?.name?.[0]?.toUpperCase() ?? '?')}
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl uppercase tracking-tighter">{user?.name ?? 'User'}</h2>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">@{user?.username ?? ''}</p>
        </div>
      </div>

      {goal && (
        <div className="space-y-2">
          <h3 className="font-heading text-xl uppercase tracking-tighter border-b-2 border-brand-black pb-2">Manifestation Goal</h3>
          <div className="editorial-card p-6 bg-white space-y-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Goal Name</label>
              <p className="text-lg font-bold">{goal.name}</p>
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Target</label>
              <p className="text-lg font-bold">${goal.targetAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-heading text-xl uppercase tracking-tighter border-b-2 border-brand-black pb-2">Settings</h3>
        {['Account Security', 'Privacy & Notifications', 'Help & Support'].map((item) => (
          <button
            key={item}
            type="button"
            className="w-full flex justify-between items-center p-4 border-2 border-transparent hover:border-brand-black hover:bg-white rounded-2xl transition-all"
          >
            <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">{item}</span>
            <span className="text-brand-black">→</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="w-full py-4 text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest"
      >
        Sign Out of SavePop
      </button>
    </div>
  );
}
