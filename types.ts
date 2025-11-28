
export type DrillCategory = 'Driving' | 'Irons' | 'Mixed' | 'Chipping' | 'Putting';

export interface Drill {
  id: string;
  name: string;
  unit: string; // e.g., "Score /10", "Distance (ft)", "Putts Made"
  category: DrillCategory;
  description?: string;
}

export interface DrillEntries {
  val1: string;
  val2: string;
  val3: string;
}

export interface GridData {
  [drillId: string]: {
    [week: number]: DrillEntries;
  };
}

export const INITIAL_DRILLS: Drill[] = [
  { id: 'd12', name: '10 Drive Yellow Corridor Test', unit: 'Score / 10', category: 'Driving', description: 'Drive 10 balls into the yellow corridor.' },
  { id: 'd15', name: 'Tiger Drill', unit: 'Score / 10', category: 'Mixed', description: '10 Rounds: Drive into yellow corridor, Wedge 80y+, hole 6ft putt.' },
  { id: 'd14', name: '10 Shot Draw/Fade Test (130-185m)', unit: 'Score / 10', category: 'Irons', description: 'Alternate draw and fade iron shots between 130 and 185 meters.' },
  { id: 'd1', name: '1/2 Combine', unit: 'Score', category: 'Mixed' },
  { id: 'd13', name: '5-25m Trackman Chipping Test', unit: 'Score', category: 'Chipping', description: 'Trackman chipping assessment from 5 to 25 meters.' },
  { id: 'd2', name: 'Wedge Ladder TM', unit: 'Score', category: 'Chipping' },
  { id: 'd3', name: '1-10 Putting Ladder (1 Ball)', unit: 'Max Step', category: 'Putting' },
  { id: 'd4', name: '1-10 Putting Ladder (2 Ball)', unit: 'Max Step', category: 'Putting' },
  { id: 'd5', name: '1-10 Putting Ladder (3 Ball)', unit: 'Max Step', category: 'Putting' },
  { id: 'd6', name: 'L/R Spiral 3-8 ft (Attempts)', unit: 'Total Attempts', category: 'Putting' },
  { id: 'd7', name: 'L/R Putting Ladder 3-8 ft (Holed)', unit: 'Count / 3', category: 'Putting' },
  { id: 'd8', name: 'R/L Spiral 3-8 ft (Attempts)', unit: 'Total Attempts', category: 'Putting' },
  { id: 'd9', name: 'R/L Putting Ladder 3-8 ft (Holed)', unit: 'Count / 3', category: 'Putting' },
  { id: 'd10', name: 'Par 3 Course (Short)', unit: 'Score', category: 'Mixed' },
  { id: 'd11', name: 'Par 3 Course (Long)', unit: 'Score', category: 'Mixed' },
];

export const WEEKS_COUNT = 52;
export const WEEKS = Array.from({ length: WEEKS_COUNT }, (_, i) => i + 1);

export const CATEGORIES: DrillCategory[] = ['Driving', 'Irons', 'Mixed', 'Chipping', 'Putting'];

// Helper to get the Monday date for a given week number (1-based)
export const getWeekLabel = (weekNumber: number): string => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday
  
  // Calculate most recent Monday
  // If Sunday (0), subtract 6 days. If Monday (1), subtract 0. If Tuesday (2), subtract 1.
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const startOfSeason = new Date(today);
  startOfSeason.setDate(today.getDate() + daysToMonday);
  
  const targetDate = new Date(startOfSeason);
  targetDate.setDate(startOfSeason.getDate() + (weekNumber - 1) * 7);
  
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
