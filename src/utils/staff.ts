export interface KeyStaffMember {
  id: string;
  name: string;
  role: string;
  effectTitle: string;
  description: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
}

export const INCOME_KEY_STAFF: KeyStaffMember[] = [
  {
    id: 'sally_reecut',
    name: 'Sally Reecut',
    role: 'Financial Director',
    effectTitle: 'Halves Wages (Rounded Up)',
    description: 'Halves your end-of-season wage deduction. (e.g., 61M wages become 31M; 20M becomes 10M).',
    badgeColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
  },
  {
    id: 'meme_shearer',
    name: 'Meme Shearer',
    role: 'Commercial & Stadium Director',
    effectTitle: '+1 Stadium Income Tier',
    description: 'Collect stadium income one tier above where you finished. (e.g., Established collects Mid-table income. No effect if on Title Contender).',
    badgeColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
  },
  {
    id: 'roi_surge',
    name: 'Roi Surge',
    role: 'Commercial Executive',
    effectTitle: '+15M Extra Income / Season',
    description: 'Grants +15M additional funds directly into your club treasury every season.',
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
  },
  {
    id: 'bill_benjamin',
    name: 'Bill Benjamin',
    role: 'Chief Investor',
    effectTitle: '+50M Extra Income / Season',
    description: 'Injects a massive +50M bonus investment into your club finances each season.',
    badgeColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    id: 'dwight_price',
    name: 'Dwight Price',
    role: 'Brand Ambassador',
    effectTitle: '+20M Extra Income / Season',
    description: 'Provides +20M commercial sponsorship payout every season.',
    badgeColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/30',
  },
];

/**
 * Calculates effective wages considering Sally Reecut
 */
export function calculateWages(
  stars: number,
  hasSallyReecut: boolean
): { baseWages: number; finalWages: number; savedWages: number } {
  const baseWages = Math.max(0, stars);
  const finalWages = hasSallyReecut ? Math.ceil(baseWages / 2) : baseWages;
  const savedWages = baseWages - finalWages;
  return { baseWages, finalWages, savedWages };
}

/**
 * Calculates effective stadium band considering Meme Shearer
 */
export function getEffectiveStadiumBand(bandName: string, hasMemeShearer: boolean): string {
  if (!hasMemeShearer) return bandName;
  switch (bandName) {
    case 'Newly Promoted':
      return 'Established';
    case 'Established':
      return 'Mid-table';
    case 'Mid-table':
      return 'Title Contender';
    case 'Title Contender':
      return 'Title Contender';
    default:
      return bandName;
  }
}

/**
 * Calculates extra direct cash bonuses from key staff (Roi Surge, Bill Benjamin, Dwight Price)
 */
export function calculateStaffCashBonus(activeStaffIds: string[] = []): {
  total: number;
  breakdown: { id: string; name: string; amount: number }[];
} {
  const breakdown: { id: string; name: string; amount: number }[] = [];
  if (activeStaffIds.includes('bill_benjamin')) {
    breakdown.push({ id: 'bill_benjamin', name: 'Bill Benjamin', amount: 50 });
  }
  if (activeStaffIds.includes('dwight_price')) {
    breakdown.push({ id: 'dwight_price', name: 'Dwight Price', amount: 20 });
  }
  if (activeStaffIds.includes('roi_surge')) {
    breakdown.push({ id: 'roi_surge', name: 'Roi Surge', amount: 15 });
  }

  const total = breakdown.reduce((acc, curr) => acc + curr.amount, 0);
  return { total, breakdown };
}
