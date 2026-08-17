import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Users, Sparkles, Shield } from 'lucide-react';
import { ClubColor, Player } from '../types';
import { ALL_COLORS, CLUB_THEMES } from '../utils/constants';
import { soundEngine } from '../utils/audio';

interface SetupScreenProps {
  onKickOff: (players: Player[], targetScore: number) => void;
  defaultTargetScore?: number;
}

interface ManagerFormRow {
  id: number;
  name: string;
  color: ClubColor;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onKickOff,
  defaultTargetScore = 100,
}) => {
  const [targetScore, setTargetScore] = useState<number>(defaultTargetScore);
  const [rows, setRows] = useState<ManagerFormRow[]>([
    { id: 0, name: 'Manager 1', color: 'Red' },
    { id: 1, name: 'Manager 2', color: 'Blue' },
    { id: 2, name: 'Manager 3', color: 'Yellow' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const addManager = () => {
    soundEngine.playClick();
    if (rows.length >= 6) {
      setError('Maximum 6 managers allowed in a Superclub league.');
      return;
    }
    setError(null);

    // Pick first unused color
    const usedColors = new Set(rows.map(r => r.color));
    const availableColor = ALL_COLORS.find(c => !usedColors.has(c)) || ALL_COLORS[rows.length % ALL_COLORS.length];

    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 0;
    setRows([
      ...rows,
      {
        id: nextId,
        name: `Manager ${rows.length + 1}`,
        color: availableColor,
      },
    ]);
  };

  const removeManager = (id: number) => {
    soundEngine.playClick();
    if (rows.length <= 2) {
      setError('A minimum of 2 managers is required to start a campaign.');
      return;
    }
    setError(null);
    setRows(rows.filter(r => r.id !== id));
  };

  const updateName = (id: number, name: string) => {
    setRows(rows.map(r => (r.id === id ? { ...r, name } : r)));
  };

  const updateColor = (id: number, color: ClubColor) => {
    soundEngine.playClick();
    const currentRow = rows.find(r => r.id === id);
    if (!currentRow || currentRow.color === color) return;

    const oldColor = currentRow.color;
    const otherRowWithColor = rows.find(r => r.id !== id && r.color === color);

    if (otherRowWithColor) {
      // Swap colors with the other manager
      setRows(
        rows.map(r => {
          if (r.id === id) return { ...r, color };
          if (r.id === otherRowWithColor.id) return { ...r, color: oldColor };
          return r;
        })
      );
    } else {
      setRows(rows.map(r => (r.id === id ? { ...r, color } : r)));
    }
  };

  const handleStart = () => {
    setError(null);
    if (rows.length < 2) {
      setError('Please add at least 2 managers.');
      return;
    }

    // Check for empty names
    for (const r of rows) {
      if (!r.name.trim()) {
        setError('Please give every manager a name.');
        return;
      }
    }

    // Check for duplicate colors
    const colorCounts = new Map<ClubColor, number>();
    for (const r of rows) {
      colorCounts.set(r.color, (colorCounts.get(r.color) || 0) + 1);
    }
    for (const [color, count] of colorCounts.entries()) {
      if (count > 1) {
        setError(`Multiple managers have chosen ${color}. Each manager must have a unique club colour.`);
        return;
      }
    }

    // Build player objects: will be finalized at the end of Pre-Season
    const players: Player[] = rows.map((r, index) => ({
      id: index,
      name: r.name.trim(),
      color: r.color,
      clubName: CLUB_THEMES[r.color]?.clubName || r.name.trim(),
      stars: 0,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      seasonsWon: 0,
      trainingLevel: 1,
      scoutingLevel: 1,
      stadiumLevel: 1,
    }));

    soundEngine.playKickOffWhistle();
    onKickOff(players, targetScore || 100);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 bg-[#22C55E]/15 border border-[#22C55E]/30 px-4 py-1.5 rounded-full text-[#22C55E] text-xs font-black uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          <span>Match Companion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow">
          Superclub <span className="text-[#22C55E]">Manager</span>
        </h1>
        <p className="text-[#94A3B8] text-sm sm:text-base mt-2 max-w-md mx-auto font-medium">
          Set up your managers, select target victory points, and kick off the league campaign.
        </p>
      </div>

      {/* Main Setup Card */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-[2.5rem] p-6 sm:p-9 shadow-2xl backdrop-blur-md">
        {/* Target Points Selection (Centered Custom Target) */}
        <div className="mb-7 pb-7 border-b border-[#334155] flex flex-col items-center justify-center text-center">
          <label className="text-sm font-black uppercase italic text-white flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            Target Victory Points
          </label>
          <p className="text-xs text-[#94A3B8] font-medium mb-3.5">
            First manager to reach this threshold wins the campaign
          </p>

          <div className="flex items-center justify-center gap-3">
            <input
              type="number"
              id="custom-target-score"
              min={30}
              max={200}
              step={5}
              value={targetScore}
              onChange={e => setTargetScore(parseInt(e.target.value) || 100)}
              className="w-28 bg-[#0F172A] border border-[#334155] rounded-2xl px-4 py-2.5 text-center text-[#22C55E] font-black font-mono text-xl focus:outline-none focus:border-[#22C55E] shadow-inner"
            />
            <span className="text-sm font-black uppercase tracking-wider text-slate-300 font-mono">
              Points
            </span>
          </div>
        </div>

        {/* Managers Section */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#22C55E]" />
              <h2 className="text-sm font-black uppercase italic text-white">
                Managers ({rows.length}/6)
              </h2>
            </div>
          </div>

          <div className="space-y-3.5" id="player-inputs-container">
            {rows.map((row, index) => {
              const theme = CLUB_THEMES[row.color];

              return (
                <div
                  key={row.id}
                  id={`manager-row-${row.id}`}
                  className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 transition-all hover:border-[#475569]"
                >
                  {/* Position number & Badge */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 text-center">
                      #{index + 1}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 shadow-md ring-2 ring-white/20"
                      style={{ backgroundColor: theme.primary }}
                      title={theme.clubName}
                    />
                  </div>

                  {/* Manager Name Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      id={`manager-name-input-${row.id}`}
                      value={row.name}
                      maxLength={24}
                      onChange={e => updateName(row.id, e.target.value)}
                      placeholder={`Manager ${index + 1}`}
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3.5 py-2.5 text-white text-sm font-semibold placeholder-[#64748B] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
                    />
                  </div>

                  {/* Club Color Selection */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 p-1.5 bg-[#1E293B]/80 border border-[#334155] rounded-xl justify-center">
                    {ALL_COLORS.map(c => {
                      const isSelected = row.color === c;
                      const otherOwner = rows.find(r => r.id !== row.id && r.color === c);
                      const t = CLUB_THEMES[c];

                      return (
                        <button
                          key={c}
                          type="button"
                          id={`color-choice-${row.id}-${c}`}
                          onClick={() => updateColor(row.id, c)}
                          title={
                            isSelected
                              ? `${t.clubName} (Selected)`
                              : otherOwner
                              ? `${t.clubName} (Click to swap with ${otherOwner.name || 'Manager'})`
                              : t.clubName
                          }
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-white scale-105 shadow-md'
                              : otherOwner
                              ? 'opacity-40 hover:opacity-100 hover:scale-105'
                              : 'opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: t.primary }}
                        />
                      );
                    })}
                  </div>

                  {/* Remove Manager Button */}
                  <button
                    type="button"
                    id={`remove-manager-btn-${row.id}`}
                    disabled={rows.length <= 2}
                    onClick={() => removeManager(row.id)}
                    className="p-2 text-[#64748B] hover:text-[#EF4444] disabled:opacity-20 disabled:hover:text-[#64748B] transition-colors self-end sm:self-center"
                    title="Remove Manager"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Manager Button */}
          {rows.length < 6 && (
            <button
              type="button"
              id="add-manager-btn"
              onClick={addManager}
              className="mt-3.5 w-full py-3 border border-dashed border-[#334155] hover:border-[#22C55E]/60 rounded-2xl text-[#94A3B8] hover:text-[#22C55E] text-xs font-bold flex items-center justify-center gap-2 transition-colors bg-[#0F172A]/40"
            >
              <Plus className="w-4 h-4" />
              Add Another Manager ({rows.length}/6)
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            id="setup-error-banner"
            className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2"
          >
            <Shield className="w-4 h-4 flex-shrink-0 text-[#EF4444]" />
            <span>{error}</span>
          </div>
        )}

        {/* Kick Off Button */}
        <button
          type="button"
          id="kick-off-btn"
          onClick={handleStart}
          className="w-full py-4.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] font-black text-base tracking-wider uppercase rounded-2xl shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
        >
          <Trophy className="w-5 h-5 text-[#0F172A]" />
          Kick Off League!
        </button>
      </div>

      {/* Superclub Game Rules Note */}
      <div className="mt-6 text-center text-xs text-[#64748B] space-y-1 font-semibold">
        <p>🏆 5 Gameweeks per season • Placement rewards & wage payouts in Off-Season.</p>
      </div>
    </div>
  );
};
