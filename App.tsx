
import React, { useState, useEffect } from 'react';
import { Drill, GridData, INITIAL_DRILLS, WEEKS, DrillEntries } from './types';
import { ScoreGrid } from './components/ScoreGrid';
import { ProgressChart } from './components/ProgressChart';
import { AddDrillModal } from './components/AddDrillModal';
import { Download, RotateCcw, Trophy, Plus, Table2, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_DRILLS = 'golf_tracker_drills_v2'; // Bumped to load new category structure
const STORAGE_KEY_DATA = 'golf_tracker_data_v2';

const App: React.FC = () => {
  const [drills, setDrills] = useState<Drill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DRILLS);
    return saved ? JSON.parse(saved) : INITIAL_DRILLS;
  });

  const [gridData, setGridData] = useState<GridData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : {};
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'trends'>('data');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DRILLS, JSON.stringify(drills));
  }, [drills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(gridData));
  }, [gridData]);

  const handleDataChange = (drillId: string, week: number, field: keyof DrillEntries, value: string) => {
    setGridData(prev => ({
      ...prev,
      [drillId]: {
        ...(prev[drillId] || {}),
        [week]: {
          ...(prev[drillId]?.[week] || { val1: '', val2: '', val3: '' }),
          [field]: value
        }
      }
    }));
  };

  const handleAddDrill = (newDrill: Omit<Drill, 'id'>) => {
    const id = `d_${Date.now()}`;
    setDrills(prev => [...prev, { ...newDrill, id }]);
  };

  const handleDeleteDrill = (id: string) => {
    if (window.confirm('Are you sure you want to delete this drill and its data?')) {
      setDrills(prev => prev.filter(d => d.id !== id));
      setGridData(prev => {
        const newData = { ...prev };
        delete newData[id];
        return newData;
      });
    }
  };

  const handleReset = () => {
    if (window.confirm('This will clear all entered data. Are you sure?')) {
      setGridData({});
    }
  };

  // Helper to generate a flat data structure for Excel
  const generateExportData = (separator: string) => {
    // Create Header Row
    // We split weeks into 3 columns: W1-1, W1-2, W1-3
    const weekHeaders = WEEKS.flatMap(w => [`Week ${w} (1)`, `Week ${w} (2)`, `Week ${w} (3)`]);
    const headers = ['Drill Name', 'Category', 'Unit', 'Description', ...weekHeaders];
    
    const rows = drills.map(drill => {
      const weekValues = WEEKS.flatMap(w => {
        const entry = gridData[drill.id]?.[w];
        // Ensure we return empty strings if undefined, not "undefined"
        return [
          entry?.val1 || '', 
          entry?.val2 || '', 
          entry?.val3 || ''
        ];
      });

      // Clean string helper to remove commas/tabs from user input to prevent CSV breaking
      const clean = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

      return [
        clean(drill.name),
        clean(drill.category),
        clean(drill.unit),
        clean(drill.description || ''),
        ...weekValues.map(v => separator === '\t' ? v : `"${v}"`) // Quote CSV, don't quote TSV usually
      ].join(separator);
    });

    return [headers.join(separator), ...rows].join('\n');
  };

  const handleExportCSV = () => {
    const csvContent = generateExportData(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `golf_drill_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    // TSV (Tab Separated Values) pastes perfectly into Excel
    const tsvContent = generateExportData('\t');
    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 font-sans flex flex-col overflow-hidden">
      {/* Header Section */}
      <header className="bg-slate-900 text-white shadow-lg z-50 shrink-0">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 pt-3 pb-1 flex flex-col gap-3">
          
          {/* Top Bar: Logo & Actions */}
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-md">
                <Trophy size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-100 leading-none">Performance Lab</h1>
                <p className="text-[9px] text-emerald-400 font-medium tracking-wider uppercase hidden xs:block mt-0.5">Elite Golf Tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
                title="Reset All Data"
              >
                <RotateCcw size={16} />
              </button>
              
              <div className="h-5 w-px bg-slate-700 mx-0.5"></div>
              
              <button 
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] sm:text-xs font-medium rounded transition-colors group"
                title="Copy for Excel (Paste directly into spreadsheet)"
              >
                {copySuccess ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>

              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] sm:text-xs font-medium rounded transition-colors"
                title="Download CSV File"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide rounded shadow-md shadow-emerald-900/20 transition-all hover:shadow-lg hover:-translate-y-0.5 ml-1"
              >
                <Plus size={14} strokeWidth={3} />
                <span className="hidden sm:inline">New Drill</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center pb-2">
            <div className="bg-slate-800 p-1 rounded-lg flex w-full max-w-[320px] sm:max-w-md shadow-inner border border-slate-700">
              <button 
                onClick={() => setActiveTab('data')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'data' 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Table2 size={16} />
                Data Entry
              </button>
              <button 
                onClick={() => setActiveTab('trends')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'trends' 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <TrendingUp size={16} />
                Trends
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto overflow-hidden relative bg-slate-100">
        
        {/* Data Grid View */}
        {/* We use display:none instead of conditional rendering to preserve scroll position in the grid */}
        <div className={`absolute inset-0 p-2 sm:p-4 flex flex-col ${activeTab === 'data' ? 'z-10' : 'z-0 invisible'}`}>
           <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
              <ScoreGrid 
                drills={drills}
                data={gridData}
                onDataChange={handleDataChange}
                onDeleteDrill={handleDeleteDrill}
                onAddDrill={() => setIsModalOpen(true)}
              />
           </div>
        </div>

        {/* Trends View */}
        <div className={`absolute inset-0 p-2 sm:p-4 flex flex-col ${activeTab === 'trends' ? 'z-10' : 'z-0 invisible'}`}>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <ProgressChart drills={drills} data={gridData} />
          </div>
        </div>

      </main>

      <AddDrillModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddDrill} 
      />
    </div>
  );
};

export default App;
