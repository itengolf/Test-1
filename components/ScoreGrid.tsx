
import React, { useRef, useEffect } from 'react';
import { Drill, GridData, WEEKS, DrillEntries, getWeekLabel } from '../types';
import { Trash2, Info, GripVertical } from 'lucide-react';

interface ScoreGridProps {
  drills: Drill[];
  data: GridData;
  onDataChange: (drillId: string, week: number, field: keyof DrillEntries, value: string) => void;
  onDeleteDrill: (drillId: string) => void;
  onAddDrill: () => void;
}

const getCategoryBadgeStyle = (category: Drill['category']) => {
  switch (category) {
    case 'Driving': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Irons': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Mixed': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Chipping': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Putting': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const getCategoryIndicatorColor = (category: Drill['category']) => {
  switch (category) {
    case 'Driving': return '#3b82f6';
    case 'Irons': return '#e11d48';
    case 'Mixed': return '#8b5cf6';
    case 'Chipping': return '#f97316';
    case 'Putting': return '#10b981';
    default: return '#64748b';
  }
};

export const ScoreGrid: React.FC<ScoreGridProps> = ({ 
  drills, 
  data, 
  onDataChange, 
  onDeleteDrill
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isScrolled = container.scrollTop > 0;
      const stickyHeader = container.querySelector('thead');
      if (stickyHeader) {
        if (isScrolled) stickyHeader.classList.add('shadow-md');
        else stickyHeader.classList.remove('shadow-md');
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto custom-scrollbar overscroll-contain"
      >
        <table className="border-collapse w-max min-w-full">
          <thead className="bg-slate-50 sticky top-0 z-30 shadow-sm transition-shadow duration-200">
            <tr>
              {/* Sticky Corner: Drill Name Header */}
              {/* Adjusted width for better mobile fit */}
              <th className="sticky left-0 z-40 bg-slate-100 border-b border-r border-slate-300 w-[160px] sm:w-[280px] p-0 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                <div className="h-14 sm:h-16 flex items-center justify-center font-bold text-xs text-slate-500 uppercase tracking-wider bg-slate-100 px-2 text-center">
                  Drill Description
                </div>
              </th>
              
              {/* Week Columns Headers */}
              {WEEKS.map((week) => (
                <th key={week} className="min-w-[140px] w-[140px] border-b border-r border-slate-200 bg-slate-50 p-0 text-center relative group">
                  <div className="flex flex-col justify-center items-center h-14 sm:h-16 w-full px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Week {week}</span>
                    <span className="text-xs font-semibold text-slate-700 mt-1 whitespace-nowrap">{getWeekLabel(week)}</span>
                    <span className="text-[9px] text-slate-300 mt-0.5 font-normal group-hover:text-emerald-500 transition-colors">3 Entries</span>
                  </div>
                </th>
              ))}
              
              {/* Spacer */}
              <th className="min-w-[20px] bg-slate-50 border-b border-slate-200"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {drills.map((drill) => (
              <tr key={drill.id} className="group hover:bg-slate-50/50">
                {/* Sticky Row Header: Drill Info */}
                <td className="sticky left-0 z-20 bg-slate-50 border-r border-b border-slate-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] p-0 align-top group-hover:bg-slate-100 transition-colors">
                  <div className="flex h-full min-h-[80px]">
                    <div className="w-1.5 shrink-0 self-stretch" style={{ backgroundColor: getCategoryIndicatorColor(drill.category) }}></div>
                    <div className="p-2 sm:p-3 flex flex-col justify-center w-full overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getCategoryBadgeStyle(drill.category)} font-bold uppercase tracking-wider whitespace-nowrap`}>
                          {drill.category}
                        </span>
                      </div>
                      {/* Allow text wrap on mobile, truncate on desktop if needed, or clamp */}
                      <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2 sm:truncate" title={drill.name}>
                        {drill.name}
                      </span>
                      <div className="mt-1 flex items-center justify-between gap-2">
                         <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{drill.unit}</span>
                         <button 
                            onClick={() => onDeleteDrill(drill.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Delete Drill"
                          >
                            <Trash2 size={12} />
                          </button>
                      </div>
                      {drill.description && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
                          <Info size={10} />
                          <span className="truncate" title={drill.description}>{drill.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Data Cells */}
                {WEEKS.map((week) => {
                  const entry = data[drill.id]?.[week] || { val1: '', val2: '', val3: '' };
                  return (
                    <td key={`${drill.id}-${week}`} className="p-0 border-r border-b border-slate-200 h-[80px] relative">
                      <div className="flex w-full h-full divide-x divide-slate-100">
                        {/* Important: text-base prevents iOS zoom on focus */}
                        <input
                          type="text"
                          inputMode="decimal"
                          value={entry.val1}
                          onChange={(e) => onDataChange(drill.id, week, 'val1', e.target.value)}
                          className="excel-cell w-1/3 h-full text-center bg-transparent text-base font-mono text-slate-700 placeholder-slate-200 transition-all focus:bg-white focus:z-10 appearance-none rounded-none p-0 m-0 border-none outline-none"
                          placeholder="-"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={entry.val2}
                          onChange={(e) => onDataChange(drill.id, week, 'val2', e.target.value)}
                          className="excel-cell w-1/3 h-full text-center bg-transparent text-base font-mono text-slate-700 placeholder-slate-200 transition-all focus:bg-white focus:z-10 appearance-none rounded-none p-0 m-0 border-none outline-none"
                          placeholder="-"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={entry.val3}
                          onChange={(e) => onDataChange(drill.id, week, 'val3', e.target.value)}
                          className="excel-cell w-1/3 h-full text-center bg-transparent text-base font-mono text-slate-700 placeholder-slate-200 transition-all focus:bg-white focus:z-10 appearance-none rounded-none p-0 m-0 border-none outline-none"
                          placeholder="-"
                        />
                      </div>
                    </td>
                  );
                })}
                
                {/* Spacer Cell */}
                <td className="border-b border-slate-200"></td>
              </tr>
            ))}
            
            {/* Empty State */}
            {drills.length === 0 && (
              <tr>
                <td colSpan={WEEKS.length + 2} className="py-20 text-center bg-white">
                   <div className="flex flex-col items-center justify-center text-slate-400">
                    <GripVertical size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-500">No drills configured</p>
                    <p className="text-sm">Add a drill to start tracking</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Bottom Padding Row for mobile scrolling comfort */}
             <tr><td colSpan={WEEKS.length + 2} className="h-40 bg-slate-50/30 border-t border-slate-100"></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
