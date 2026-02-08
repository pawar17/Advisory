import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/quests', icon: '🎯', label: 'Quests' },
    { path: '/leaderboard', icon: '🏆', label: 'Ranks' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-red-600 transition-colors"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-xs font-medium mt-1">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
