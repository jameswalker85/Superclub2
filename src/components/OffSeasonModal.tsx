import React, { useState } from 'react';
import {
  Coins,
  Dumbbell,
  Compass,
  Building,
  Gavel,
  ArrowRight,
  Check,
  Info,
  Crown,
  Star,
  Users,
  Minus,
  Plus,
  Sparkles
} from 'lucide-react';
import { Player } from '../types';
import { CLUB_THEMES, REWARD_TIERS, getBandForPoints, getStadiumIncome } from '../utils/constants';
import {
  calculateWages,
  getEffectiveStadiumBand,
  calculateStaffCashBonus
} from '../utils/staff';
import { KeyStaffModal } from './KeyStaffModal';
import { soundEngine } from '../utils/audio';

interface OffSeasonModalProps {
  seasonCount: number;
  players: Player[];
  onStartNextSeason: (updatedPlayers?: Player[]) => void;
}

export const OffSeasonModal: React.FC<OffSeasonModalProps> = ({
  seasonCount,
  players,
  onStartNextSeason,
}) => {
  const isPreSeason = seasonCount === 0;
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Local state for squad stars per player (default to 20 if currently 0 in pre-season)
  const [playerStars, setPlayerStars] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    players.forEach(p => {
      initial[p.id] = isPreSeason ? (p.stars > 0 ? p.stars : 20) : p.stars;
    });
    return initial;
  });

  // Local state for club upgrade levels (1 to 4, default 1)
  const [playerUpgrades, setPlayerUpgrades] = useState<
    Record<number, { trainingLevel: number; scoutingLevel: number; stadiumLevel: number }>
  >(() => {
    const initial: Record<
      number,
      { trainingLevel: number; scoutingLevel: number; stadiumLevel: number }
    > = {};
    players.forEach(p => {
      initial[p.id] = {
        trainingLevel: p.trainingLevel ?? 1,
        scoutingLevel: p.scoutingLevel ?? 1,
        stadiumLevel: p.stadiumLevel ?? 1,
      };
    });
    return initial;
  });

  // Local state for active key staff per player
  const [playerStaff, setPlayerStaff] = useState<Record<number, string[]>>(() => {
    const initial: Record<number, string[]> = {};
    players.forEach(p => {
      initial[p.id] = p.keyStaff || [];
    });
    return initial;
  });

  // Key Staff modal state
  const [editingStaffPlayerId, setEditingStaffPlayerId] = useState<number | null>(null);

  const handleToggleStaff = (playerId: number, staffId: string) => {
    setPlayerStaff(prev => {
      const curr = prev[playerId] || [];
      const updated = curr.includes(staffId)
        ? curr.filter(id => id !== staffId)
        : [...curr, staffId];
      return {
        ...prev,
        [playerId]: updated,
      };
    });
  };

  const handleUpdateStars = (id: number, delta: number) => {
    soundEngine.playClick();
    setPlayerStars(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleSetStarsDirect = (id: number, val: number) => {
    setPlayerStars(prev => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  const handleSetUpgradeLevel = (
    playerId: number,
    field: 'trainingLevel' | 'scoutingLevel' | 'stadiumLevel',
    level: number
  ) => {
    soundEngine.playClick();
    setPlayerUpgrades(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || { trainingLevel: 1, scoutingLevel: 1, stadiumLevel: 1 }),
        [field]: Math.max(1, Math.min(4, level)),
      },
    }));
  };

  // Sort players by table order
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return b.wins - a.wins;
  });

  const leader = sortedPlayers[0] || players[0];

  const toggleStep = (stepNum: number) => {
    soundEngine.playClick();
    setCompletedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const handleProceed = () => {
    soundEngine.playClick();
    const updatedPlayers: Player[] = players.map(p => {
      const currentStars = playerStars[p.id] ?? (isPreSeason ? 20 : p.stars);
      const upgrades = playerUpgrades[p.id] || { trainingLevel: 1, scoutingLevel: 1, stadiumLevel: 1 };
      const currentStaff = playerStaff[p.id] || [];
      // At the start of every season, managers' VPs reset to match their updated total base stars
      return {
        ...p,
        stars: currentStars,
        points: currentStars,
        trainingLevel: upgrades.trainingLevel,
        scoutingLevel: upgrades.scoutingLevel,
        stadiumLevel: upgrades.stadiumLevel,
        keyStaff: currentStaff,
        wins: 0,
        draws: 0,
        losses: 0,
      };
    });

    onStartNextSeason(updatedPlayers);
  };

  // Players with live updated staff for the KeyStaffModal
  const playersWithLocalStaff: Player[] = players.map(p => ({
    ...p,
    stars: playerStars[p.id] ?? p.stars,
    keyStaff: playerStaff[p.id] || [],
  }));

  // Render the interactive Club Investments & Upgrades panel
  const renderClubInvestmentsContent = () => (
    <div className="space-y-4">
      <div className="text-sm text-slate-300 space-y-1">
        <p>
          Select purchased infrastructure upgrades and staff for each club. Training, Scouting, and Stadium capacity range from{' '}
          <strong className="text-amber-400">Level 1 (Default)</strong> to{' '}
          <strong className="text-amber-400">Level 4</strong>.
        </p>
        {isPreSeason && (
          <p className="text-xs text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            ⚠️ Maximum <span className="font-bold text-amber-300">2 investment actions</span> per manager in Pre-Season!
          </p>
        )}
      </div>

      {/* Upgrades per player */}
      <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3">
        {players.map(p => {
          const theme = CLUB_THEMES[p.color];
          const upgrades = playerUpgrades[p.id] || { trainingLevel: 1, scoutingLevel: 1, stadiumLevel: 1 };
          const activeStaff = playerStaff[p.id] || [];
          const hasMeme = activeStaff.includes('meme_shearer');
          const band = getBandForPoints(p.points);
          const effectiveBandName = getEffectiveStadiumBand(band.name, hasMeme);
          const currentStadiumIncome = getStadiumIncome(upgrades.stadiumLevel, effectiveBandName);

          return (
            <div
              key={p.id}
              className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div>
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{theme.clubName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`invest-staff-btn-${p.id}`}
                    onClick={() => {
                      soundEngine.playClick();
                      setEditingStaffPlayerId(p.id);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeStaff.length > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Key Staff ({activeStaff.length})</span>
                  </button>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    Stadium: +{currentStadiumIncome}M{hasMeme ? ' (Tier +1)' : ''}
                  </span>
                </div>
              </div>

              {/* 3 Facility Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* Training Level */}
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between sm:flex-col sm:items-start gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Training</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(lvl => {
                      const isSelected = upgrades.trainingLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSetUpgradeLevel(p.id, 'trainingLevel', lvl)}
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500 text-slate-950 shadow-[0_0_8px_rgba(14,165,233,0.4)]'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scouting Level */}
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between sm:flex-col sm:items-start gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Scouting</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(lvl => {
                      const isSelected = upgrades.scoutingLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSetUpgradeLevel(p.id, 'scoutingLevel', lvl)}
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stadium Level */}
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between sm:flex-col sm:items-start gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span>Stadium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(lvl => {
                      const isSelected = upgrades.stadiumLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSetUpgradeLevel(p.id, 'stadiumLevel', lvl)}
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const preSeasonSteps = [
    {
      id: 1,
      title: '1. Initial Squad Draft',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            Build your foundational squad! The draft board is refilled as many times as there are managers,
            so that each manager should end up with 18 players.
          </p>
        </div>
      ),
      orderNote: 'Order: 1st Manager ➡️ Clockwise snake draft.',
    },
    {
      id: 2,
      title: '2. Starting Finances & Budget',
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      content: (
        <div>
          <p className="text-slate-300 text-sm mb-3">
            Every club receives <span className="text-amber-400 font-bold">120M Starting Purse</span> to
            conduct scouting, upgrades, and Deadline Day bidding. You can also assign any starting Key Staff bonuses.
          </p>
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2">
            {players.map((p, idx) => {
              const theme = CLUB_THEMES[p.color];
              const activeStaff = playerStaff[p.id] || [];
              const { total: staffBonus } = calculateStaffCashBonus(activeStaff);

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-2.5 border-b border-slate-800/60 last:border-0 text-xs gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono w-4">#{idx + 1}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div>
                      <span className="font-semibold text-white mr-2">{p.name}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        Starting Purse: 120M
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5">
                    <button
                      type="button"
                      id={`preseason-staff-btn-${p.id}`}
                      onClick={() => {
                        soundEngine.playClick();
                        setEditingStaffPlayerId(p.id);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        activeStaff.length > 0
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Users className="w-2.5 h-2.5 text-amber-400" />
                      <span>Key Staff ({activeStaff.length})</span>
                    </button>

                    <span className="font-extrabold text-amber-400 font-mono text-sm">
                      +{120 + staffBonus}M
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      orderNote: 'All managers receive 120M into club treasury.',
    },
    {
      id: 3,
      title: '3. Training Phase',
      icon: <Dumbbell className="w-5 h-5 text-sky-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            Roll training dice for your un-developed players with potential star slots to unlock higher abilities.
          </p>
        </div>
      ),
      orderNote: 'Order: 1st Manager ➡️ Clockwise',
    },
    {
      id: 4,
      title: '4. Scouting Phase',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            Draw and purchase players from your Scouting Zones (Europe, South America, etc.).
            Pay the scouting price, as indicated by binoculars.
          </p>
          <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            🔍 Scouting facility level dictates how many scouting cards you can look at.
          </p>
        </div>
      ),
      orderNote: 'Order: 1st Manager ➡️ Clockwise',
    },
    {
      id: 5,
      title: '5. Club Investments',
      icon: <Building className="w-5 h-5 text-purple-400" />,
      content: renderClubInvestmentsContent(),
      orderNote: 'Order: 1st Manager ➡️ Clockwise',
    },
    {
      id: 6,
      title: '6. Deadline Day (The Auction)',
      icon: <Gavel className="w-5 h-5 text-rose-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            The blockbuster transfer market! Draw{' '}
            <span className="text-amber-400 font-bold">
              {players.length + 1} player cards
            </span>{' '}
            (one more than total managers).
          </p>
          <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            🤝 Bidding starts at face value. The highest bidder claims the player card!
          </p>
        </div>
      ),
      orderNote: 'Order: 1st Manager draws first & last cards and opens bidding.',
    },
    {
      id: 7,
      title: '7. Confirm Base Stars & Starting Victory Points',
      icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Now that the Initial Draft, Training, Scouting, and Deadline Day are finished, count each club&apos;s
            <strong className="text-white"> total base stars</strong>.
            <br />
            <span className="text-[#22C55E] font-semibold text-xs mt-1 block">
              ⭐ Starting Victory Points for Season 1 will equal each club&apos;s base stars!
            </span>
          </p>

          <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3">
            {players.map(p => {
              const theme = CLUB_THEMES[p.color];
              const stars = playerStars[p.id] ?? 20;

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div>
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{theme.clubName}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1">
                      <span className="text-xs text-slate-400 font-bold uppercase mr-1">Base Stars:</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStars(p.id, -1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={stars}
                        onChange={e => handleSetStarsDirect(p.id, parseInt(e.target.value) || 0)}
                        className="w-10 bg-transparent text-center font-mono font-bold text-amber-400 text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateStars(p.id, 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="inline-block font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                        {stars} Starting VP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      orderNote: 'Verify every squad before kicking off Season 1.',
    },
  ];

  const regularSeasonSteps = [
    {
      id: 1,
      title: '1. Finances & Placement Rewards',
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      content: (
        <div>
          <p className="text-slate-300 text-sm mb-3">
            Collect <span className="text-amber-400 font-bold">Placement Rewards</span> (table below),
            plus <span className="text-white font-semibold">Stadium Income</span> and any active{' '}
            <span className="text-amber-400 font-semibold">Key Staff bonuses</span>.
            <br />
            <span className="text-xs text-rose-400 font-semibold block mt-1">
              ⚠️ Pay 1M in Squad Wages for every Star in your squad (Sally Reecut halves this bill, rounded up).
            </span>
          </p>

          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2.5">
            {sortedPlayers.map((p, idx) => {
              const reward = REWARD_TIERS[idx] || 50;
              const activeStaff = playerStaff[p.id] || [];
              const hasSally = activeStaff.includes('sally_reecut');
              const hasMeme = activeStaff.includes('meme_shearer');

              const baseStars = playerStars[p.id] ?? p.stars;
              const { baseWages, finalWages, savedWages } = calculateWages(baseStars, hasSally);

              const upgrades = playerUpgrades[p.id] || { trainingLevel: 1, scoutingLevel: 1, stadiumLevel: 1 };
              const baseBand = getBandForPoints(p.points);
              const effectiveBandName = getEffectiveStadiumBand(baseBand.name, hasMeme);
              const stadiumIncome = getStadiumIncome(upgrades.stadiumLevel, effectiveBandName);

              const { total: staffCashBonus, breakdown: staffCashBreakdown } = calculateStaffCashBonus(activeStaff);

              const netTotal = Math.max(0, reward + stadiumIncome + staffCashBonus - finalWages);
              const theme = CLUB_THEMES[p.color];

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs gap-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-500 font-mono w-4">#{idx + 1}</span>
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span>{p.points} pts</span>
                        <span>•</span>
                        <span className="text-amber-300 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {baseStars} stars
                        </span>
                        <span>•</span>
                        <span className={baseBand.colorCls}>{baseBand.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5">
                    <div className="flex items-center justify-between sm:justify-end gap-2.5">
                      <button
                        type="button"
                        id={`finance-staff-btn-${p.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          setEditingStaffPlayerId(p.id);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          activeStaff.length > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <Users className="w-3 h-3 text-amber-400" />
                        <span>Key Staff ({activeStaff.length})</span>
                      </button>

                      <div className="font-bold text-amber-400 font-mono text-sm">
                        +{netTotal}M Net Total
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-1 sm:justify-end">
                      <span className="text-amber-300/90">+{reward}M placement</span>
                      <span>+</span>
                      <span className="text-emerald-400">
                        +{stadiumIncome}M stadium (Lvl {upgrades.stadiumLevel}
                        {hasMeme ? ` • Meme: ${effectiveBandName}` : ''})
                      </span>
                      {staffCashBonus > 0 && (
                        <>
                          <span>+</span>
                          <span className="text-purple-300">
                            +{staffCashBonus}M staff ({staffCashBreakdown.map(s => `${s.name.split(' ')[0]} +${s.amount}M`).join(', ')})
                          </span>
                        </>
                      )}
                      {finalWages > 0 && (
                        <>
                          <span>-</span>
                          <span className="text-rose-400">
                            -{finalWages}M wages{hasSally ? ` (halved from ${baseWages}M)` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      orderNote: `Payouts distributed to all managers. Leader (${leader.name}) collects top reward.`,
    },
    {
      id: 2,
      title: '2. Training Phase',
      icon: <Dumbbell className="w-5 h-5 text-sky-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            Roll training dice for your un-developed players with potential star slots. Use your
            Training facility bonus dice if unlocked.
          </p>
        </div>
      ),
      orderNote: `Order: League Leader (${leader.name}) ➡️ Clockwise`,
    },
    {
      id: 3,
      title: '3. Scouting Phase',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            Draw and purchase players from your Scouting Zones (Europe, South America, etc.).
            Pay the scouting price, as indicated by binoculars.
          </p>
          <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            🔍 Scouting facility level dictates how many scouting cards you can look at.
          </p>
        </div>
      ),
      orderNote: `Order: League Leader (${leader.name}) ➡️ Clockwise`,
    },
    {
      id: 4,
      title: '4. Club Investments',
      icon: <Building className="w-5 h-5 text-purple-400" />,
      content: renderClubInvestmentsContent(),
      orderNote: `Order: League Leader (${leader.name}) ➡️ Clockwise`,
    },
    {
      id: 5,
      title: '5. Deadline Day (The Auction)',
      icon: <Gavel className="w-5 h-5 text-rose-400" />,
      content: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            The blockbuster transfer market! Draw{' '}
            <span className="text-amber-400 font-bold">
              {players.length + 1} player cards
            </span>{' '}
            (one more than total managers).
          </p>
          <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            🤝 Bidding starts at face value. The highest bidder claims the player card!
          </p>
        </div>
      ),
      orderNote: `Order: League Leader (${leader.name}) draws first & last cards and opens the bidding war.`,
    },
    {
      id: 6,
      title: '6. Confirm Base Stars & Reset Starting Victory Points',
      icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Confirm each manager&apos;s updated squad base stars following scouting, training, and transfers.
            At the start of Season {seasonCount + 1}, each manager&apos;s Victory Points will reset to match their updated total base stars.
          </p>
          <div className="bg-slate-950/90 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-2.5">
            {players.map(p => {
              const theme = CLUB_THEMES[p.color];
              const stars = playerStars[p.id] ?? p.stars;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{theme.clubName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1">
                    <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Stars:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStars(p.id, -1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs cursor-pointer"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={stars}
                      onChange={e => handleSetStarsDirect(p.id, parseInt(e.target.value) || 0)}
                      className="w-8 bg-transparent text-center font-mono font-bold text-amber-400 text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateStars(p.id, 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      orderNote: `At kickoff, all managers' Victory Points will reset to their updated total base stars for Season ${seasonCount + 1}.`,
    },
  ];

  const steps = isPreSeason ? preSeasonSteps : regularSeasonSteps;

  return (
    <div
      id="offseason-screen-container"
      className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#1E293B] border border-[#334155] rounded-[2.5rem] w-full max-w-2xl my-auto p-6 sm:p-8 shadow-2xl">
        {/* Modal Header */}
        <div className="text-center pb-5 mb-5 border-b border-[#334155]">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/15 px-3.5 py-1 rounded-full border border-[#F59E0B]/30 mb-2.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            {isPreSeason ? 'Pre-Season Phase' : `Off-Season Transition`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tight">
            {isPreSeason ? 'Initial Draft & Pre-Season' : `Season ${seasonCount} Off-Season`}
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-medium mt-1 max-w-md mx-auto">
            {isPreSeason
              ? 'Complete initial squad draft, training, scouting, investments, and determine starting base stars before Gameweek 1.'
              : 'Complete off-season routine: collect prize money, train squad, scout, and bid on Deadline Day.'}
          </p>
        </div>

        {/* Steps Accordion */}
        <div className="space-y-3.5 mb-6 max-h-[55vh] overflow-y-auto pr-1">
          {steps.map(step => {
            const isDone = !!completedSteps[step.id];

            return (
              <div
                key={step.id}
                id={`offseason-step-${step.id}`}
                className={`bg-[#0F172A] border rounded-2xl p-4.5 transition-all ${
                  isDone ? 'border-[#22C55E]/50 bg-[#22C55E]/5' : 'border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#1E293B] border border-[#334155]">
                      {step.icon}
                    </div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">{step.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-[#22C55E] text-[#0F172A] font-black shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                        : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155]'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>

                <div className="pl-1 text-slate-200">{step.content}</div>

                <div className="mt-3 pt-2.5 border-t border-[#334155] flex items-center gap-2 text-xs text-[#94A3B8]">
                  <Info className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                  <span className="font-semibold text-slate-300">{step.orderNote}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Next Season Button */}
        <button
          type="button"
          id="proceed-next-season-btn"
          onClick={handleProceed}
          className="w-full py-4.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isPreSeason ? 'Start Season 1' : `Kick Off Season ${seasonCount + 1}`}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Embedded Key Staff Modal */}
      {editingStaffPlayerId !== null && (
        <KeyStaffModal
          players={playersWithLocalStaff}
          initialPlayerId={editingStaffPlayerId}
          onClose={() => setEditingStaffPlayerId(null)}
          onToggleStaff={handleToggleStaff}
        />
      )}
    </div>
  );
};
