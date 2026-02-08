import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AddVetoRequest({ user, onAdd, onClose }) {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedItem = item.trim();
    const numAmount = parseFloat(amount);
    const trimmedReason = reason.trim();
    if (!trimmedItem || Number.isNaN(numAmount) || numAmount < 0 || !trimmedReason) return;
    try {
      await onAdd({
        item: trimmedItem,
        amount: numAmount,
        reason: trimmedReason,
      });
      onClose();
    } catch (_) {
      // parent shows toast.error; keep modal open
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-black/40 z-[200] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="editorial-card bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading text-xl uppercase tracking-tighter">Ask for a vote</h3>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-brand-black">
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">
          What do you want to buy? Let friends vote Go for it or Veto.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">
              Item
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Sony Headphones"
              className="w-full border-2 border-brand-black rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border-2 border-brand-black rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">
              Why? (reason for friends)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. On sale – worth it?"
              rows={3}
              className="w-full border-2 border-brand-black rounded-xl px-4 py-3 text-sm font-bold focus:outline-none resize-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-brand-black rounded-xl text-xs font-bold uppercase">
              Cancel
            </button>
            <button type="submit" className="flex-1 editorial-button py-3 text-xs uppercase">
              Send to Veto Court
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
