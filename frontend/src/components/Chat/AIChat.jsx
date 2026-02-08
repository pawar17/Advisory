import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiService } from '../../services/api';

export default function AIChat({ user, goal }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi ${user?.name ?? 'there'}! I'm SavePop Buddy. ✨ How's your "${goal?.name ?? 'goal'}" going today?` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);
    try {
      const { data } = await aiService.chat(userText);
      setMessages((prev) => [...prev, { role: 'assistant', text: data?.response ?? data?.reply ?? data?.message ?? 'Got it!' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "I'm having a moment. Try again in a bit! ✨" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="editorial-card p-4 rounded-3xl mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-lavender rounded-full flex items-center justify-center text-xl">🤖</div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">SavePop Buddy</h3>
          <p className="text-[10px] text-brand-lavender font-bold uppercase tracking-widest">Online ✨</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-brand-pink/50 text-gray-800' : 'editorial-card'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="editorial-card p-4 rounded-3xl flex gap-1">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-brand-lavender rounded-full" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-brand-lavender rounded-full" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-brand-lavender rounded-full" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      <div className="mt-4 editorial-card p-2 flex gap-2 rounded-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for saving tips..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-gray-300 rounded-xl"
        />
        <button type="button" onClick={handleSend} className="p-3 bg-brand-lavender text-white rounded-xl">
          ✨
        </button>
      </div>
    </div>
  );
}
