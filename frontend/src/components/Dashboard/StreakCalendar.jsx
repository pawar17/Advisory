import { useState, useEffect } from 'react';
import { gamificationService } from '../../services/api';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StreakCalendar({ compact = false }) {
  const [daysAchieved, setDaysAchieved] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    gamificationService.getStreakCalendar(year, month).then(({ data }) => {
      if (!cancelled) {
        setDaysAchieved(data.days || []);
      }
    }).catch(() => {
      if (!cancelled) setDaysAchieved([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [year, month]);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendar = [...blanks, ...days];

  return (
    <section className={`flex flex-col flex-1 min-h-0 w-full ${compact ? 'space-y-2 max-w-xs mx-auto' : 'space-y-3 max-w-2xl mx-auto'}`}>
      {!compact && (
        <h3 className="font-heading text-sm uppercase tracking-widest border-b-2 border-brand-black pb-1 shrink-0">
          Streak this month
        </h3>
      )}
      <div className={`editorial-card flex flex-col flex-1 min-h-0 ${compact ? 'p-3' : 'p-4'}`}>
        <p className={`shrink-0 ${compact ? 'text-[9px] mb-1.5' : 'text-[10px] mb-2'} font-mono uppercase text-gray-500`}>
          {MONTH_NAMES[month - 1]} {year} — days you achieved
        </p>
        {loading ? (
          <div className={`grid grid-cols-7 gap-0.5 py-2 text-center ${compact ? 'text-[8px]' : 'text-[10px]'} text-gray-400`}>Loading…</div>
        ) : (
          <>
            <div className={`grid grid-cols-7 gap-0.5 shrink-0 ${compact ? 'mb-1' : 'mb-2'}`}>
              {WEEKDAYS.map((d) => (
                <div key={d} className={`${compact ? 'text-[6px] py-0.5' : 'text-[10px] py-1'} font-mono font-bold text-gray-500 text-center`}>
                  {d}
                </div>
              ))}
            </div>
            <div className={`grid grid-cols-7 gap-1 sm:gap-2 w-full ${compact ? '' : 'flex-1 min-h-0'}`}>
              {calendar.map((d, i) => (
                <div
                  key={i}
                  className={`${compact ? 'min-h-[22px] text-[8px] rounded-md' : 'aspect-square min-w-0 rounded-lg text-sm sm:text-lg'} flex items-center justify-center font-mono font-bold ${
                    d == null
                      ? 'invisible'
                      : daysAchieved.includes(d)
                        ? 'bg-brand-pink text-white border border-brand-black'
                        : 'bg-brand-cream border border-brand-black/10 text-gray-500'
                  }`}
                >
                  {d ?? ''}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
