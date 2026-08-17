import React from 'react';
import { Swords, Trophy } from 'lucide-react';
import { Player } from '../types';
import { CLUB_THEMES } from '../utils/constants';
import { soundEngine } from '../utils/audio';

interface SuperDuperScreenProps {
  contenders: Player[];
  targetScore: number;
  onSelectWinner: (winnerName: string, reason: string) => void;
}

export const SuperDuperScreen: React.FC<SuperDuperScreenProps> = ({
  contenders,
  targetScore,
  onSelectWinner,
}) => {
  return (
    <div
      id="superduper-screen-container"
      className="fixed inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#1E293B] border border-[#F59E0B]/50 rounded-[2.5rem] w-full max-w-xl p-7 sm:p-9 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/50 flex items-center justify-center mx-auto mb-4 text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-bounce">
          <Swords className="w-8 h-8" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/15 px-3.5 py-1 rounded-full border border-[#F59E0B]/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          Championship Tie-Breaker
        </span>

        <h1 className="text-3xl sm:text-4xl font-black italic text-white uppercase tracking-tight mt-3 mb-2">
          The SuperDuper Cup!
        </h1>

        <p className="text-sm text-slate-300 font-medium max-w-md mx-auto mb-6">
          Multiple managers have crossed the <span className="text-[#F59E0B] font-black">{targetScore} Points</span> threshold!
          Play the ultimate final showdown match on the board, then crown the victor below:
        </p>

        {/* Contender Cards & Winner Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {contenders.map(player => {
            const theme = CLUB_THEMES[player.color];

            return (
              <div
                key={player.id}
                className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4.5 flex flex-col items-center justify-between text-center gap-3.5"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 ring-2 ring-white/30 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-extrabold text-white text-base">{player.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{theme.clubName}</p>
                  <p className="text-xs text-[#F59E0B] font-bold mt-1">
                    {player.points} pts • {player.stars} stars
                  </p>
                </div>

                <button
                  type="button"
                  id={`superduper-win-btn-${player.id}`}
                  onClick={() => {
                    soundEngine.playVictorySound();
                    onSelectWinner(player.name, `WON THE SUPERDUPER CUP FINAL (${player.points} PTS)!`);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer ${theme.bgClass}`}
                >
                  Crown {player.name}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[#64748B] font-semibold">
          Superclub Championship Tiebreaker: Winner takes the Superclub crown!
        </p>
      </div>
    </div>
  );
};
