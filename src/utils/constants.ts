import { ClubColor, ClubTheme, PointBand } from '../types';

export const CLUB_THEMES: Record<ClubColor, ClubTheme> = {
  Red: {
    name: 'Red',
    clubName: 'Red Valley Rovers',
    primary: '#EF4444',
    secondary: '#DC2626',
    bgClass: 'bg-[#EF4444] hover:bg-[#DC2626] text-white',
    textClass: 'text-[#EF4444]',
    borderClass: 'border-[#EF4444]',
    badgeClass: 'bg-[#EF4444] ring-[#EF4444]/50 shadow-[0_0_12px_rgba(239,68,68,0.4)]',
  },
  Blue: {
    name: 'Blue',
    clubName: 'Blue Mountain United',
    primary: '#3B82F6',
    secondary: '#2563EB',
    bgClass: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white',
    textClass: 'text-[#3B82F6]',
    borderClass: 'border-[#3B82F6]',
    badgeClass: 'bg-[#3B82F6] ring-[#3B82F6]/50 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  },
  Yellow: {
    name: 'Yellow',
    clubName: 'Yellow Bay Town',
    primary: '#F59E0B',
    secondary: '#D97706',
    bgClass: 'bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold',
    textClass: 'text-[#F59E0B]',
    borderClass: 'border-[#F59E0B]',
    badgeClass: 'bg-[#F59E0B] ring-[#F59E0B]/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  Purple: {
    name: 'Purple',
    clubName: 'Purple Plain Athletic',
    primary: '#A855F7',
    secondary: '#9333EA',
    bgClass: 'bg-[#A855F7] hover:bg-[#9333EA] text-white',
    textClass: 'text-[#A855F7]',
    borderClass: 'border-[#A855F7]',
    badgeClass: 'bg-[#A855F7] ring-[#A855F7]/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
  },
  Green: {
    name: 'Green',
    clubName: 'Green Hill Rangers',
    primary: '#22C55E',
    secondary: '#16A34A',
    bgClass: 'bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold',
    textClass: 'text-[#22C55E]',
    borderClass: 'border-[#22C55E]',
    badgeClass: 'bg-[#22C55E] ring-[#22C55E]/50 shadow-[0_0_12px_rgba(34,197,94,0.4)]',
  },
  Pink: {
    name: 'Pink',
    clubName: 'Pink River City',
    primary: '#EC4899',
    secondary: '#DB2777',
    bgClass: 'bg-[#EC4899] hover:bg-[#DB2777] text-white',
    textClass: 'text-[#EC4899]',
    borderClass: 'border-[#EC4899]',
    badgeClass: 'bg-[#EC4899] ring-[#EC4899]/50 shadow-[0_0_12px_rgba(236,72,153,0.4)]',
  },
};

export const ALL_COLORS: ClubColor[] = [
  'Red',
  'Blue',
  'Yellow',
  'Purple',
  'Green',
  'Pink',
];

export const REWARD_TIERS = [100, 90, 80, 70, 60, 50];

export const POINT_BANDS: PointBand[] = [
  {
    name: 'Title Contender',
    cls: 'band-title',
    bgCls: 'bg-amber-500/15 border-[#F59E0B] text-[#F59E0B]',
    colorCls: 'text-[#F59E0B]',
    minPoints: 80,
  },
  {
    name: 'Mid-table',
    cls: 'band-mid',
    bgCls: 'bg-blue-500/15 border-[#3B82F6] text-[#3B82F6]',
    colorCls: 'text-[#3B82F6]',
    minPoints: 60,
  },
  {
    name: 'Established',
    cls: 'band-est',
    bgCls: 'bg-purple-500/15 border-[#A855F7] text-[#A855F7]',
    colorCls: 'text-[#A855F7]',
    minPoints: 40,
  },
  {
    name: 'Newly Promoted',
    cls: 'band-new',
    bgCls: 'bg-emerald-500/15 border-[#22C55E] text-[#22C55E]',
    colorCls: 'text-[#22C55E]',
    minPoints: 0,
  },
];

export function getBandForPoints(points: number): PointBand {
  if (points >= 80) return POINT_BANDS[0];
  if (points >= 60) return POINT_BANDS[1];
  if (points >= 40) return POINT_BANDS[2];
  return POINT_BANDS[3];
}

export const STADIUM_INCOME: Record<number, Record<string, number>> = {
  1: {
    'Newly Promoted': 20,
    'Established': 30,
    'Mid-table': 40,
    'Title Contender': 50,
  },
  2: {
    'Newly Promoted': 30,
    'Established': 45,
    'Mid-table': 60,
    'Title Contender': 75,
  },
  3: {
    'Newly Promoted': 40,
    'Established': 60,
    'Mid-table': 80,
    'Title Contender': 100,
  },
  4: {
    'Newly Promoted': 50,
    'Established': 75,
    'Mid-table': 100,
    'Title Contender': 150,
  },
};

export function getStadiumIncome(stadiumLevel: number = 1, bandName: string = 'Newly Promoted'): number {
  const level = Math.max(1, Math.min(4, stadiumLevel || 1));
  const levelMap = STADIUM_INCOME[level] || STADIUM_INCOME[1];
  return levelMap[bandName] ?? 20;
}

