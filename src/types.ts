export type ClubColor = 'Red' | 'Blue' | 'Yellow' | 'Purple' | 'Green' | 'Pink';

export interface ClubTheme {
  name: string;
  clubName: string;
  primary: string;
  secondary: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
}

export interface Player {
  id: number;
  name: string;
  color: ClubColor;
  clubName?: string;
  stars: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  seasonsWon?: number;
  previousRank?: number;
  trainingLevel?: number;
  scoutingLevel?: number;
  stadiumLevel?: number;
}

export type MatchType = 'PVP' | 'SIM';
export type MatchResult = 'HOME' | 'AWAY' | 'DRAW' | 'WIN' | 'LOSS' | null;

export interface MatchFixture {
  id: string;
  type: MatchType;
  homePlayerId: number;
  awayPlayerId?: number; // only for PVP
  result: MatchResult;
  recorded: boolean;
}

export type GameweekSchedule = (
  | 'ALL_SIM'
  | number[] // PvP pair [homeId, awayId]
  | number // Bye player who plays Sim
  | (number[] | number)[]
);

export type GamePhase = 'SETUP' | 'DASHBOARD' | 'OFFSEASON' | 'VICTORY' | 'SUPERDUPER';

export interface GameState {
  players: Player[];
  seasonCount: number;
  currentRound: number;
  targetScore: number;
  fixturesByRound: MatchFixture[][];
  currentPhase: GamePhase;
  winnerName: string;
  winReason: string;
  superDuperContenders: number[]; // Player IDs
  soundEnabled: boolean;
  historyLogs?: string[];
}

export interface PointBand {
  name: string;
  cls: string;
  bgCls: string;
  colorCls: string;
  minPoints: number;
}
