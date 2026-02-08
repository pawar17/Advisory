import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_ITEMS } from '../../constants';

const ITEM_COST = 25;

export default function GameWorld({ goalType, progressPercent, currency, onUpdateCurrency, onAddPoints }) {
  const [placedItems, setPlacedItems] = useState({});
  const [hoveredTile, setHoveredTile] = useState(null);
  const gridRef = useRef(null);

  const unlockedCount = Math.max(4, Math.floor(progressPercent / 4));
  const items = WORLD_ITEMS[goalType] || WORLD_ITEMS.other;

  const handleDragEnd = (e, info, item) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;
    const col = Math.floor(x / (rect.width / 5));
    const row = Math.floor(y / (rect.height / 5));
    const index = row * 5 + col;
    if (col >= 0 && col < 5 && row >= 0 && row < 5 && index < unlockedCount && !placedItems[index] && currency >= ITEM_COST) {
      onUpdateCurrency?.(-ITEM_COST);
      setPlacedItems((prev) => ({ ...prev, [index]: item }));
      onAddPoints?.(25);
    }
    setHoveredTile(null);
  };

  const onDrag = (e, info) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;
    const col = Math.floor(x / (rect.width / 5));
    const row = Math.floor(y / (rect.height / 5));
    const index = row * 5 + col;
    if (col >= 0 && col < 5 && row >= 0 && row < 5 && index < unlockedCount && !placedItems[index]) {
      setHoveredTile(index);
    } else {
      setHoveredTile(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl uppercase tracking-tighter">PopCity Builder</h2>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest font-bold">Design your manifestation</p>
      </div>
      <div
        ref={gridRef}
        className="relative w-full aspect-square grid grid-cols-5 gap-1 bg-brand-mint border-4 border-brand-black p-2 rounded-3xl shadow-[8px_8px_0px_#1A1A1A]"
      >
        {Array(25).fill(null).map((_, i) => (
          <div
            key={i}
            className={`relative w-full aspect-square border border-brand-black/5 flex items-center justify-center text-3xl rounded-lg overflow-hidden ${
              i < unlockedCount ? (hoveredTile === i ? 'bg-brand-pink' : 'bg-white/90') : 'bg-gray-800/10 grayscale'
            }`}
          >
            <AnimatePresence>
              {placedItems[i] ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="z-10">
                  {placedItems[i]}
                </motion.span>
              ) : i < unlockedCount ? (
                <span className="text-[10px] font-mono font-bold text-gray-300">{i + 1}</span>
              ) : (
                <span className="text-xs opacity-20">🔒</span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center border-b-2 border-brand-black pb-1">
          <h3 className="font-heading text-xs uppercase tracking-widest">Store</h3>
          <span className="font-mono text-[9px] text-gray-500 uppercase font-bold">25 💰 EACH</span>
        </div>
        <div className="flex gap-4 justify-center py-6 bg-white rounded-3xl border-2 border-brand-black shadow-[4px_4px_0px_#1A1A1A]">
          {items.map((item) => (
            <motion.div
              key={item}
              drag
              dragMomentum={false}
              onDrag={(e, info) => onDrag(e, info)}
              onDragEnd={(e, info) => handleDragEnd(e, info, item)}
              whileDrag={{ scale: 1.2, zIndex: 100 }}
              className={`w-14 h-14 border-2 border-brand-black rounded-2xl flex items-center justify-center text-2xl cursor-grab bg-brand-cream ${
                currency < ITEM_COST ? 'opacity-30 grayscale' : ''
              }`}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="editorial-card p-5 bg-brand-lavender w-full">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🏗️</div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-black">Construction Zone</p>
            <p className="text-[10px] text-brand-black/80 mt-1">Drag items to unlocked tiles. +25 XP each.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
