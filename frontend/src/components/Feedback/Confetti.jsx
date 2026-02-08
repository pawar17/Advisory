import { motion } from 'framer-motion';

const colors = ['#FFD6E8', '#E0BBE4', '#FEF9E7', '#D1F2EB', '#FFABAB'];

function ConfettiPiece({ index }) {
  const xStart = Math.random() * 100;
  const xEnd = xStart + (Math.random() - 0.5) * 50;
  const color = colors[index % colors.length];
  return (
    <motion.div
      initial={{ y: -20, x: `${xStart}vw`, opacity: 1, rotate: 0 }}
      animate={{ y: '100vh', x: `${xEnd}vw`, opacity: 0, rotate: 720 }}
      transition={{ duration: 2 + Math.random() * 2, ease: 'linear', delay: Math.random() * 0.5 }}
      className="fixed w-3 h-3 z-[1000] pointer-events-none"
      style={{ backgroundColor: color, borderRadius: index % 2 === 0 ? '50%' : '0%' }}
    />
  );
}

export default function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      {Array.from({ length: 40 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </div>
  );
}
