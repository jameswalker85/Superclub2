import React from 'react';
import { Crown, Star, Plus, Minus, Flame, TrendingUp, Trophy, Award } from 'lucide-react';
import { Player } from '../types';
import { CLUB_THEMES, getBandForPoints } from '../utils/constants';
import { soundEngine } from '../utils/audio';

interface LeagueTableProps {
  players: Player[];
  targetScore: number;
  onAdjustPoints: (playerId: number, delta: number) => void;
  onUpdateStars: (playerId: number, stars: number) => void;
  onUpdateSeasonsWon?: (playerId: number, seasonsWon: number) => void;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
  players,
  targetScore,
  onAdjustPoints,
  onUpdateStars,
  onUpdateSeasonsWon,
}) => {
  // Superclub Sort order: Points desc, Stars desc, Wins desc
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return b.wins - a.wins;
  });

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] overflow-hidden shadow-2xl">
      {/* Header banner */}
      <div className="px-6 py-5 border-b border-[#334155] flex items-center justify-between bg-[#0F172A]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-white text-base sm:text-lg uppercase tracking-tight italic">
              League Standings
            </h2>
            <p className="text-[11px] text-[#94A3B8] font-bold">
              Live Victory Points, Squad Valuation & Season Titles
            </p>
          </div>
        </div>
        <div className="text-xs text-[#94A3B8] flex items-center gap-2 font-bold">
          <span className="hidden sm:inline uppercase text-[10px] tracking-wider">Target:</span>
          <span className="text-[#22C55E] font-mono font-bold px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
            {targetScore} pts
          </span>
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse" id="superclub-league-table">
          <thead>
            <tr className="bg-[#0F172A]/80 text-[#94A3B8] text-[11px] sm:text-xs uppercase tracking-wider border-b border-[#334155] font-bold">
              <th className="py-3 px-2 sm:px-3 w-10 sm:w-12 text-center">Pos</th>
              <th className="py-3 px-2 sm:px-3">Manager & Club</th>
              <th className="py-3 px-2 text-center hidden 2xl:table-cell">W - D - L</th>
              <th className="py-3 px-2 sm:px-3 text-center">Squad Stars</th>
              <th className="py-3 px-2 sm:px-3 text-center">Titles</th>
              <th className="py-3 px-2 sm:px-3 text-right">Victory Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]/60" id="league-table-body">
            {sortedPlayers.map((player, index) => {
              const isLeader = index === 0;
              const theme = CLUB_THEMES[player.color];
              const band = getBandForPoints(player.points);
              const progressPct = Math.min(100, Math.round((player.points / targetScore) * 100));
              const seasonsWon = player.seasonsWon || 0;
              const hasUnlockedSupercup = seasonsWon >= 3;

              return (
                <tr
                  key={player.id}
                  id={`table-row-${player.id}`}
                  className={`transition-colors ${
                    isLeader
                      ? 'bg-[#F59E0B]/5 border-l-4 border-l-[#F59E0B]'
                      : 'hover:bg-[#334155]/30'
                  }`}
                >
                  {/* Position / Rank */}
                  <td className="py-3 px-2 sm:px-3 text-center font-bold">
                    <div className="flex items-center justify-center">
                      {isLeader ? (
                        <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] ring-1 ring-[#F59E0B]/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                          <Crown className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                        </div>
                      ) : index === 1 ? (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-slate-300/10 text-slate-300 text-xs font-mono font-bold">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-amber-700/20 text-[#F59E0B] text-xs font-mono font-bold">
                          3
                        </span>
                      ) : (
                        <span className="text-[#64748B] text-xs font-mono">{index + 1}</span>
                      )}
                    </div>
                  </td>

                  {/* Manager Name, Club & Band Badge */}
                  <td className="py-3 px-2 sm:px-3">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-md ring-1 ring-white/20"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-white text-xs sm:text-sm leading-none truncate">
                            {player.name}
                          </span>
                          {isLeader && (
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 shadow-sm whitespace-nowrap">
                              Leader
                            </span>
                          )}
                          {hasUnlockedSupercup && (
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm flex items-center gap-1 whitespace-nowrap">
                              <Award className="w-2.5 h-2.5 text-amber-400" />
                              Supercup
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[11px] text-[#94A3B8] font-semibold truncate">
                            {theme.clubName}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold whitespace-nowrap ${band.bgCls}`}
                          >
                            {band.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* W-D-L Record (Wide Displays) */}
                  <td className="py-3 px-2 text-center text-xs font-mono text-[#94A3B8] hidden 2xl:table-cell">
                    <span className="text-[#22C55E] font-bold">{player.wins}</span> -{' '}
                    <span className="text-slate-200">{player.draws}</span> -{' '}
                    <span className="text-[#EF4444] font-bold">{player.losses}</span>
                  </td>

                  {/* Squad Stars Stepper */}
                  <td className="py-3 px-2 sm:px-3 text-center">
                    <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-[#0F172A] border border-[#334155] rounded-xl p-0.5 sm:p-1">
                      <button
                        type="button"
                        id={`star-minus-${player.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onUpdateStars(player.id, Math.max(0, player.stars - 1));
                        }}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                        disabled={player.stars <= 0}
                        title="Decrease Stars"
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>

                      <div className="flex items-center gap-1 px-1 font-bold text-[#F59E0B] text-xs min-w-[30px] sm:min-w-[34px] justify-center">
                        <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="font-mono">{player.stars}</span>
                      </div>

                      <button
                        type="button"
                        id={`star-plus-${player.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onUpdateStars(player.id, player.stars + 1);
                        }}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                        title="Increase Stars"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Seasons Won (Titles) Stepper */}
                  <td className="py-3 px-2 sm:px-3 text-center">
                    <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-[#0F172A] border border-[#334155] rounded-xl p-0.5 sm:p-1">
                      {onUpdateSeasonsWon && (
                        <button
                          type="button"
                          id={`seasons-minus-${player.id}`}
                          onClick={() => {
                            soundEngine.playClick();
                            onUpdateSeasonsWon(player.id, Math.max(0, seasonsWon - 1));
                          }}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                          disabled={seasonsWon <= 0}
                          title="Decrease Season Titles"
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      )}

                      <div
                        className={`flex items-center gap-1 px-1 font-bold text-xs min-w-[28px] sm:min-w-[32px] justify-center ${
                          hasUnlockedSupercup ? 'text-amber-300 font-black' : 'text-slate-300'
                        }`}
                      >
                        <Trophy
                          className={`w-3 h-3 ${
                            seasonsWon > 0 ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-slate-600'
                          }`}
                        />
                        <span className="font-mono">{seasonsWon}</span>
                      </div>

                      {onUpdateSeasonsWon && (
                        <button
                          type="button"
                          id={`seasons-plus-${player.id}`}
                          onClick={() => {
                            soundEngine.playClick();
                            onUpdateSeasonsWon(player.id, seasonsWon + 1);
                          }}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="Add Season Title"
                        >
                          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Victory Points Adjuster & Display */}
                  <td className="py-3 px-2 sm:px-3 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        {/* Quick -1 / +1 point adjustments */}
                        <button
                          type="button"
                          id={`pts-minus-1-${player.id}`}
                          onClick={() => {
                            soundEngine.playClick();
                            onAdjustPoints(player.id, -1);
                          }}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#0F172A] hover:bg-[#334155] text-[#94A3B8] hover:text-white text-[11px] font-bold border border-[#334155] transition-colors cursor-pointer flex items-center justify-center"
                          title="-1 Point"
                        >
                          -1
                        </button>

                        <div className="text-lg sm:text-xl font-black font-mono text-[#F59E0B] px-1 sm:px-1.5 min-w-[34px] sm:min-w-[42px] text-center tracking-tight">
                          {player.points}
                        </div>

                        <button
                          type="button"
                          id={`pts-plus-1-${player.id}`}
                          onClick={() => {
                            soundEngine.playClick();
                            onAdjustPoints(player.id, 1);
                          }}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#0F172A] hover:bg-[#334155] text-[#94A3B8] hover:text-white text-[11px] font-bold border border-[#334155] transition-colors cursor-pointer flex items-center justify-center"
                          title="+1 Point"
                        >
                          +1
                        </button>

                        <button
                          type="button"
                          id={`pts-plus-6-${player.id}`}
                          onClick={() => {
                            soundEngine.playClick();
                            onAdjustPoints(player.id, 6);
                          }}
                          className="hidden 2xl:inline-flex px-1.5 py-0.5 rounded bg-[#22C55E]/15 hover:bg-[#22C55E]/30 border border-[#22C55E]/40 text-[#22C55E] text-[11px] font-black transition-colors cursor-pointer"
                          title="+6 Points (Win)"
                        >
                          +6
                        </button>
                      </div>

                      {/* Progress to Target */}
                      <div className="w-16 sm:w-24 bg-[#0F172A] rounded-full h-1 mt-1.5 overflow-hidden border border-[#334155]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            player.points >= targetScore
                              ? 'bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse'
                              : 'bg-gradient-to-r from-[#22C55E] to-[#F59E0B]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Quick Tip */}
      <div className="px-6 py-3.5 bg-[#0F172A]/80 border-t border-[#334155] flex flex-wrap items-center justify-between text-xs text-[#94A3B8] font-medium">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#F59E0B]" />
          <span>Scoring: Win = 6 pts | Draw = 2 pts | Sim Loss = 0 pts</span>
        </div>
        <span className="hidden sm:inline text-[#64748B] font-semibold">
          🏆 Win 3 seasons to unlock the Supercup challenge!
        </span>
      </div>
    </div>
  );
};

