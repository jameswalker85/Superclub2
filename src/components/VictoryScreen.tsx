import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, Medal } from 'lucide-react';
import { Player } from '../types';
import { CLUB_THEMES } from '../utils/constants';
import { soundEngine } from '../utils/audio';

interface VictoryScreenProps {
  winnerName: string;
  winReason: string;
  players: Player[];
  seasonCount: number;
  onNewGame: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winnerName,
  winReason,
  players,
  seasonCount,
  onNewGame,
}) => {
  useEffect(() => {
    soundEngine.playVictorySound();

    // Fire fireworks / confetti barrage
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#ffd700', '#22c55e', '#3b82f6', '#ec4899', '#a855f7', '#f97316'];

    const interval: number = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 40 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: { x: 0.2 + Math.random() * 0.6, y: Math.random() * 0.4 },
        colors,
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const winner = players.find(p => p.name === winnerName);
  const theme = winner ? CLUB_THEMES[winner.color] : null;

  return (
    <div
      id="victory-screen-container"
      className="fixed inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#1E293B] border border-[#F59E0B]/50 rounded-[2.5rem] w-full max-w-lg p-7 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Icon */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#F59E0B] via-[#FBBF24] to-[#FEF08A] p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] mx-auto flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#F59E0B] fill-[#F59E0B]" />
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-[#FBBF24] absolute -top-1 -right-1 animate-pulse" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/15 px-3.5 py-1 rounded-full border border-[#F59E0B]/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          Superclub Champion
        </span>

        <h1
          id="winner-name-display"
          className="text-3xl sm:text-5xl font-black italic text-white uppercase tracking-tight mt-3 mb-1 drop-shadow-md"
        >
          {winnerName}
        </h1>

        {theme && (
          <p className="text-sm font-semibold text-[#94A3B8] mb-2">
            {theme.clubName}
          </p>
        )}

        <div className="inline-block bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2 my-3 text-xs sm:text-sm font-mono font-bold text-[#F59E0B]">
          {winReason}
        </div>

        <p className="text-xs text-[#94A3B8] font-medium mb-6">
          Crowned Superclub Champion after {seasonCount} intense season{seasonCount > 1 ? 's' : ''}!
        </p>

        {/* Final Standings Recap */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4 mb-6 text-left">
          <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Medal className="w-4 h-4 text-[#F59E0B]" />
            Final League Standings
          </h3>
          <div className="space-y-2 text-xs">
            {[...players]
              .sort((a, b) => b.points - a.points || b.stars - a.stars)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#1E293B] border border-[#334155]"
                >
                  <span className="font-semibold text-slate-200">
                    {idx + 1}. {p.name}
                  </span>
                  <span className="font-mono text-[#F59E0B] font-black">
                    {p.points} pts • {p.stars} ⭐
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="victory-new-game-btn"
          onClick={onNewGame}
          className="w-full py-4.5 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Start New Campaign</span>
        </button>
      </div>
    </div>
  );
};
