import { createContext, useState, useContext, useEffect } from 'react';
import { userService, goalService, questService, gamificationService } from '../services/api';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    points: 0,
    currency: 0,
    streak: 0,
    longest_streak: 0
  });
  const [goals, setGoals] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]);
  const [availableQuests, setAvailableQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchGoals(),
        fetchActiveQuests(),
        fetchAvailableQuests(),
        fetchLeaderboard()
      ]);
    } catch (error) {
      console.error('Failed to fetch game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await userService.getGameStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data } = await goalService.getAll();
      setGoals(data.goals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const fetchActiveQuests = async () => {
    try {
      const { data } = await questService.getActive();
      setActiveQuests(data.quests);
    } catch (error) {
      console.error('Failed to fetch active quests:', error);
    }
  };

  const fetchAvailableQuests = async () => {
    try {
      const { data } = await questService.getAvailable();
      setAvailableQuests(data.quests);
    } catch (error) {
      console.error('Failed to fetch available quests:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await gamificationService.getLeaderboard();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const refreshStats = () => {
    fetchStats();
  };

  const refreshGoals = () => {
    fetchGoals();
  };

  const refreshQuests = () => {
    fetchActiveQuests();
    fetchAvailableQuests();
  };

  return (
    <GameContext.Provider value={{
      stats,
      goals,
      activeQuests,
      availableQuests,
      leaderboard,
      loading,
      refreshStats,
      refreshGoals,
      refreshQuests,
      fetchAllData
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
