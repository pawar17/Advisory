export const MOCK_FEED = [
  { id: 'p1', user: { name: 'Bob Smith', avatar: '👨', username: 'bob_budgets' }, content: "Just reached a 21-day streak! 🔥", likes: 12, type: 'achievement', timestamp: '2h ago' },
  { id: 'p2', user: { name: 'Carol Davis', avatar: '👩‍🦰', username: 'carol_goals' }, content: "Finally hit 90% of my goal! 🎉", likes: 24, type: 'achievement', timestamp: '5h ago' },
];

export const MOCK_VETO_REQUESTS = [
  { id: 'v1', user: { name: 'Bob Smith', avatar: '👨', username: 'bob_budgets' }, item: 'Sony Headphones', amount: 150, reason: 'On sale – worth it?', votes: [], status: 'pending' },
  { id: 'v2', user: { name: 'Anna Sopena', avatar: '👩', username: 'annasopena' }, item: 'Wireless earbuds', amount: 89, reason: 'Need them for the gym – good deal?', votes: [], status: 'pending' },
];

export const MOCK_FRIENDS = [
  { id: 'f1', name: 'Bob Smith', avatar: '👨', username: 'bob_budgets' },
  { id: 'f2', name: 'Carol Davis', avatar: '👩‍🦰', username: 'carol_goals' },
];

export const WORLD_ITEMS = {
  house: ['🌳', '🚗', '⛲', '🐶', '🏡'],
  vacation: ['🏖️', '🍹', '🏄', '🎒', '✈️'],
  debt: ['🎉', '✅', '🆓', '💸', '💪'],
  shopping: ['🛍️', '👟', '🕶️', '💄', '💍'],
  emergency: ['🛡️', '🚑', '🔋', '🔦', '🥫'],
  other: ['📦', '✨', '🎁', '🎈', '🎨'],
};
