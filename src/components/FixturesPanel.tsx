import React from 'react';
import { Swords, Bot, CheckCircle2, RotateCcw, ArrowRight, Flag } from 'lucide-react';
import { MatchFixture, MatchResult, Player } from '../types';
import { CLUB_THEMES } from '../utils/constants';
import { soundEngine } from '../utils/audio';

interface FixturesPanelProps {
  seasonCount: number;
  currentRound: number;
  totalRounds: number;
  fixtures: MatchFixture[];
  players: Player[];
  onRecordResult: (fixtureId: string, result: MatchResult) => void;
  onNextRound: () => void;
  onFinishSeason: () => void;
}

export const FixturesPanel: React.FC<FixturesPanelProps> = ({
  seasonCount,
  currentRound,
  totalRounds,
  fixtures,
  players,
  onRecordResult,
  onNextRound,
  onFinishSeason,
}) => {
  const isLastRound = currentRound === totalRounds - 1;
  const isSeasonOver = currentRound >= totalRounds;
  const recordedCount = fixtures.filter(f => f.recorded).length;
  const isRoundComplete = fixtures.length > 0 && recordedCount === fixtures.length;

  const getPlayer = (id: number): Player | undefined => players.find(p => p.id === id);

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] p-6 shadow-2xl">
      {/* Gameweek Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-xs font-black uppercase tracking-wider border border-[#22C55E]/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
              Season {seasonCount < 10 ? `0${seasonCount}` : seasonCount}
            </span>
            <h2 className="font-black text-white text-lg sm:text-xl tracking-tight uppercase italic" id="gameweek-title-heading">
              {isSeasonOver
                ? 'Season Complete'
                : `Gameweek ${currentRound + 1} of ${totalRounds}`}
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] font-medium mt-1">
            {isSeasonOver
              ? 'All league matches concluded. Proceed to check winner or off-season.'
              : `${recordedCount} of ${fixtures.length} matches recorded`}
          </p>
        </div>

        {/* Progress Pill */}
        {!isSeasonOver && (
          <div className="flex items-center gap-2 bg-[#0F172A] px-3.5 py-1.5 rounded-full border border-[#334155] text-xs font-bold">
            <span className="text-[#94A3B8]">Progress:</span>
            <span className={`font-mono ${isRoundComplete ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
              {Math.round((recordedCount / (fixtures.length || 1)) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Fixtures List */}
      {isSeasonOver ? (
        <div className="py-8 text-center bg-[#0F172A]/70 rounded-2xl border border-dashed border-[#334155]">
          <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-3 text-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">Full Time!</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mb-6">
            Season {seasonCount} gameweeks have finished. Review the final table and transition to
            the Off-Season or check if anyone reached the target points!
          </p>
          <button
            type="button"
            id="finish-season-btn"
            onClick={onFinishSeason}
            className="py-3.5 px-8 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 cursor-pointer"
          >
            End Season & Check Winner
          </button>
        </div>
      ) : (
        <div className="space-y-4" id="fixtures-container">
          {fixtures.map(fixture => {
            const home = getPlayer(fixture.homePlayerId);
            const away =
              fixture.awayPlayerId !== undefined ? getPlayer(fixture.awayPlayerId) : undefined;
            const homeTheme = home ? CLUB_THEMES[home.color] : null;
            const awayTheme = away ? CLUB_THEMES[away.color] : null;

            if (!home || !homeTheme) return null;

            // PvP Match Card
            if (fixture.type === 'PVP' && away && awayTheme) {
              return (
                <div
                  key={fixture.id}
                  id={`fixture-card-${fixture.id}`}
                  className={`bg-[#0F172A] border rounded-2xl p-4 transition-all ${
                    fixture.recorded
                      ? 'border-[#334155] opacity-80'
                      : 'border-[#334155] hover:border-[#475569] shadow-lg'
                  }`}
                >
                  {/* Fixture Matchup Banner */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-md ring-2 ring-white/20"
                        style={{ backgroundColor: homeTheme.primary }}
                      />
                      <span className="font-extrabold text-white text-sm truncate">
                        {home.name}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase hidden sm:inline">
                        (H)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono font-bold text-[#F59E0B] flex-shrink-0">
                      <Swords className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>VS</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 justify-end min-w-0 flex-1 text-right">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase hidden sm:inline">
                        (A)
                      </span>
                      <span className="font-extrabold text-white text-sm truncate">
                        {away.name}
                      </span>
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-md ring-2 ring-white/20"
                        style={{ backgroundColor: awayTheme.primary }}
                      />
                    </div>
                  </div>

                  {/* Outcome Decision Buttons OR Result Banner */}
                  {!fixture.recorded ? (
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      <button
                        type="button"
                        id={`pvp-win-home-${fixture.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onRecordResult(fixture.id, 'HOME');
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-extrabold text-white shadow-sm transition-transform active:scale-95 flex flex-col items-center justify-center truncate ${homeTheme.bgClass}`}
                      >
                        <span className="truncate w-full text-center">{home.name} Win</span>
                        <span className="text-[10px] opacity-80 font-mono font-bold">+6 Pts</span>
                      </button>

                      <button
                        type="button"
                        id={`pvp-draw-${fixture.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onRecordResult(fixture.id, 'DRAW');
                        }}
                        className="py-2.5 px-2 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-[#334155] transition-transform active:scale-95 flex flex-col items-center justify-center"
                      >
                        <span>Draw</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">+2 Pts each</span>
                      </button>

                      <button
                        type="button"
                        id={`pvp-win-away-${fixture.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onRecordResult(fixture.id, 'AWAY');
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-extrabold text-white shadow-sm transition-transform active:scale-95 flex flex-col items-center justify-center truncate ${awayTheme.bgClass}`}
                      >
                        <span className="truncate w-full text-center">{away.name} Win</span>
                        <span className="text-[10px] opacity-80 font-mono font-bold">+6 Pts</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-[#1E293B] border border-[#334155] rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        <span className="text-xs font-bold text-slate-200">
                          {fixture.result === 'HOME' && (
                            <span className="text-[#22C55E]">
                              {home.name} Won (+6 pts)
                            </span>
                          )}
                          {fixture.result === 'AWAY' && (
                            <span className="text-[#22C55E]">
                              {away.name} Won (+6 pts)
                            </span>
                          )}
                          {fixture.result === 'DRAW' && (
                            <span className="text-[#F59E0B]">
                              Draw (+2 pts each)
                            </span>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        id={`undo-match-${fixture.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onRecordResult(fixture.id, null);
                        }}
                        className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F172A] hover:bg-[#334155] border border-[#334155] transition-colors"
                        title="Undo match result"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Sim Match Card
            return (
              <div
                key={fixture.id}
                id={`fixture-card-${fixture.id}`}
                className={`bg-[#0F172A] border rounded-2xl p-4 transition-all ${
                  fixture.recorded
                    ? 'border-[#334155] opacity-80'
                    : 'border-[#334155] hover:border-[#475569] shadow-lg'
                }`}
              >
                {/* Sim Matchup Banner */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-md ring-2 ring-white/20"
                      style={{ backgroundColor: homeTheme.primary }}
                    />
                    <span className="font-extrabold text-white text-sm">
                      {home.name}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[#1E293B] text-[#38BDF8] text-[10px] font-black uppercase tracking-wider border border-[#38BDF8]/30 flex items-center gap-1.5">
                    <Bot className="w-3 h-3 text-[#38BDF8]" />
                    SIM MATCH
                  </span>
                </div>

                {/* Outcome Buttons OR Recorded Result */}
                {!fixture.recorded ? (
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <button
                      type="button"
                      id={`sim-win-${fixture.id}`}
                      onClick={() => {
                        soundEngine.playClick();
                        onRecordResult(fixture.id, 'WIN');
                      }}
                      className="py-2.5 px-2 rounded-xl text-xs font-black bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.2)] transition-transform active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>Win</span>
                      <span className="text-[10px] opacity-80 font-mono font-bold">+6 Pts</span>
                    </button>

                    <button
                      type="button"
                      id={`sim-draw-${fixture.id}`}
                      onClick={() => {
                        soundEngine.playClick();
                        onRecordResult(fixture.id, 'DRAW');
                      }}
                      className="py-2.5 px-2 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-[#334155] transition-transform active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>Draw</span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">+2 Pts</span>
                    </button>

                    <button
                      type="button"
                      id={`sim-loss-${fixture.id}`}
                      onClick={() => {
                        soundEngine.playClick();
                        onRecordResult(fixture.id, 'LOSS');
                      }}
                      className="py-2.5 px-2 rounded-xl text-xs font-black bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-transform active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>Loss</span>
                      <span className="text-[10px] opacity-80 font-mono font-bold">0 Pts</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#1E293B] border border-[#334155] rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-xs font-bold">
                        {fixture.result === 'WIN' && (
                          <span className="text-[#22C55E]">
                            Sim Win (+6 pts)
                          </span>
                        )}
                        {fixture.result === 'DRAW' && (
                          <span className="text-[#F59E0B]">
                            Sim Draw (+2 pts)
                          </span>
                        )}
                        {fixture.result === 'LOSS' && (
                          <span className="text-[#EF4444]">
                            Sim Loss (0 pts)
                          </span>
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      id={`undo-match-${fixture.id}`}
                      onClick={() => {
                        soundEngine.playClick();
                        onRecordResult(fixture.id, null);
                      }}
                      className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F172A] hover:bg-[#334155] border border-[#334155] transition-colors"
                      title="Undo match result"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Undo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Next Round / End Season Action Bar */}
      {!isSeasonOver && isRoundComplete && (
        <div className="mt-6 pt-4 border-t border-[#334155]">
          {isLastRound ? (
            <button
              type="button"
              id="finish-season-btn"
              onClick={onFinishSeason}
              className="w-full py-4 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
            >
              <Flag className="w-5 h-5" />
              <span>End Season & Check Winner</span>
            </button>
          ) : (
            <button
              type="button"
              id="next-round-btn"
              onClick={onNextRound}
              className="w-full py-4 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
            >
              <span>Advance to Gameweek {currentRound + 2}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
