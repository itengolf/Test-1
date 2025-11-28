import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Drill, GridData, WEEKS, getWeekLabel } from '../types';
import { TrendingUp, ChevronDown, Trophy, Activity, ArrowUpRight, ArrowDownRight, Minus, History } from 'lucide-react';

interface ProgressChartProps {
  drills: Drill[];
  data: GridData;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ drills, data }) => {
  const [selectedDrillId, setSelectedDrillId] = useState<string>(drills[0]?.id || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!drills.find(d => d.id === selectedDrillId) && drills.length > 0) {
      setSelectedDrillId(drills[0].id);
    } else if (drills.length > 0 && !selectedDrillId) {
       setSelectedDrillId(drills[0].id);
    }
  }, [drills, selectedDrillId]);

  // Auto-scroll to the latest data (far right) when drill changes or component mounts
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [selectedDrillId]);

  const chartData = useMemo(() => {
    return WEEKS.map(week => {
      const entry: any = { 
        name: getWeekLabel(week),
        fullDate: getWeekLabel(week),
        weekNum: week
      };
      
      if (selectedDrillId && data[selectedDrillId] && data[selectedDrillId][week]) {
        const weekEntries = data[selectedDrillId][week];
        // Parse the 3 potential entries
        const vals = [weekEntries.val1, weekEntries.val2, weekEntries.val3];
        // Filter out non-numeric and empty strings
        const nums = vals
          .map(v => parseFloat(v))
          .filter(n => !isNaN(n));
        
        if (nums.length > 0) {
          // Calculate average for the chart point
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
          entry.value = Number(avg.toFixed(1)); // Rounded to 1 decimal
        }
      }
      return entry;
    });
  }, [data, selectedDrillId]);

  const stats = useMemo(() => {
    const points = chartData.filter(d => typeof d.value === 'number');
    if (points.length === 0) return null;

    const values = points.map(d => d.value);
    const current = values[values.length - 1];
    const prev = values.length > 1 ? values[values.length - 2] : current;
    const diff = current - prev;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    
    return { current, diff, avg, max, count: values.length };
  }, [chartData]);

  const currentDrill = drills.find(d => d.id === selectedDrillId);

  // Calculate chart width: 80px per week ensures ~4-5 weeks (1 month) visible on mobile screens
  const CHART_WIDTH_PX = Math.max(600, chartData.length * 80);

  if (drills.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 h-full flex items-center justify-center">
        Analytics unavailable until drills are added.
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* Header Controls */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-3 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
            <TrendingUp size={20} className="text-emerald-700" />
          </div>
          <div className="flex-1 sm:flex-initial">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Performance Trends</h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
              Swipe to view history
            </p>
          </div>
        </div>
        
        <div className="relative group w-full sm:w-auto min-w-[200px] sm:min-w-[280px]">
          <select 
            value={selectedDrillId}
            onChange={(e) => setSelectedDrillId(e.target.value)}
            className="appearance-none block w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors hover:bg-slate-100"
          >
            {drills.map(drill => (
              <option key={drill.id} value={drill.id}>
                {drill.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
          <div className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Trophy size={10} /> Personal Best
            </span>
            <span className="text-lg sm:text-xl font-bold text-emerald-600">{stats.max}</span>
          </div>
          
          <div className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
             <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity size={10} /> Average
            </span>
            <span className="text-lg sm:text-xl font-bold text-slate-700">{stats.avg.toFixed(1)}</span>
          </div>

          <div className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <History size={10} /> Last Entry
            </span>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-bold text-slate-700">{stats.current}</span>
              {stats.diff !== 0 && (
                <div className={`flex items-center text-xs font-bold ${stats.diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {stats.diff > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                   {Math.abs(stats.diff).toFixed(1)}
                </div>
              )}
               {stats.diff === 0 && <Minus size={14} className="text-slate-300" />}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Chart Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/10">
        {!stats ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm flex-col gap-2">
            <TrendingUp size={32} opacity={0.5} />
            <p>Enter data in the grid to see trends</p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar"
          >
            <div style={{ width: `${CHART_WIDTH_PX}px`, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
                  
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={0} // Show all intervals since we have scrolled space
                    dy={10}
                  />

                  <YAxis 
                    stroke="#64748b"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    width={40}
                    tickFormatter={(val) => Math.round(val).toString()}
                  />
                  
                  <Tooltip 
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '12px',
                      fontSize: '13px'
                    }}
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    itemStyle={{ color: '#059669', fontWeight: 700, fontSize: '15px' }}
                    formatter={(value: number) => [`${value} (Avg)`, currentDrill?.unit || 'Score']}
                  />
                  
                  {/* Reference Line for Average */}
                  <ReferenceLine 
                    y={stats.avg} 
                    stroke="#94a3b8" 
                    strokeDasharray="3 3" 
                    strokeOpacity={0.5}
                    label={{ 
                      position: 'insideRight', 
                      value: 'AVG', 
                      fill: '#94a3b8', 
                      fontSize: 9,
                      fontWeight: 700,
                      dy: -10
                    }} 
                  />

                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name={currentDrill?.name || 'Score'} 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    connectNulls
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
