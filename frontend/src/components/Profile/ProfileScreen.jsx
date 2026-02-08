import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { goalService, friendsService } from '../../services/api';
import BankStatementsTab from './BankStatementsTab';
import GoalsTab from './GoalsTab';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'statements', label: 'Bank Statements' },
  { id: 'goals', label: 'Goals' },
];

export default function ProfileScreen({ user, goal, onGoalsChange, refetchGoals }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [goals, setGoals] = useState([]);
  const [friends, setFriends] = useState([]);
  const [addFriendUsername, setAddFriendUsername] = useState('');

  useEffect(() => {
    goalService.getAll().then(({ data }) => setGoals(data.goals || [])).catch(() => setGoals([]));
  }, []);
  useEffect(() => {
    if (activeTab === 'profile') {
      friendsService.getList().then(({ data }) => setFriends(data.friends || [])).catch(() => setFriends([]));
    }
  }, [activeTab]);

  const handleGoalsChange = (newGoals) => {
    setGoals(newGoals || []);
    onGoalsChange?.(newGoals);
    refetchGoals?.();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex gap-2 border-b-2 border-brand-black pb-2 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-mono text-xs uppercase whitespace-nowrap rounded-t-xl transition-colors ${
              activeTab === tab.id ? 'bg-brand-black text-white' : 'bg-white border-2 border-brand-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <>
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
                  <p className="text-lg font-bold">${goal.targetAmount?.toLocaleString() ?? '0'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-heading text-xl uppercase tracking-tighter border-b-2 border-brand-black pb-2">Friends</h3>
            <div className="editorial-card p-4 flex gap-2">
              <input
                type="text"
                value={addFriendUsername}
                onChange={(e) => setAddFriendUsername(e.target.value)}
                placeholder="Username to add"
                className="flex-1 border-2 border-brand-black p-2 rounded-xl font-mono text-sm"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!addFriendUsername.trim()) return;
                  try {
                    await friendsService.add(addFriendUsername.trim());
                    toast.success('Friend added');
                    setAddFriendUsername('');
                    friendsService.getList().then(({ data }) => setFriends(data.friends || []));
                  } catch (err) {
                    toast.error(err.response?.data?.error || 'Could not add friend');
                  }
                }}
                className="editorial-button py-2 px-4 text-xs uppercase"
              >
                Add
              </button>
            </div>
            {friends.length > 0 && (
              <ul className="space-y-2">
                {friends.map((f) => (
                  <li key={f.id} className="editorial-card p-3 flex justify-between items-center">
                    <span className="font-bold text-sm">{f.name || f.username}</span>
                    <span className="text-[10px] text-gray-500">@{f.username}</span>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="font-heading text-xl uppercase tracking-tighter border-b-2 border-brand-black pb-2 pt-4">Settings</h3>
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
        </>
      )}

      {activeTab === 'statements' && <BankStatementsTab />}
      {activeTab === 'goals' && <GoalsTab goals={goals} onGoalsChange={handleGoalsChange} />}

      <button
        type="button"
        onClick={() => logout()}
        className="w-full py-4 text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest"
      >
        Sign Out of SavePop
      </button>
    </div>
  );
}
