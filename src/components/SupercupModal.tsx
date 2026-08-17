import React, { useState } from 'react';
import { Trophy, ShieldCheck, XCircle, AlertTriangle, X, Award } from 'lucide-react';
import { Player } from '../types';
import { CLUB_THEMES } from '../utils/constants';
import { soundEngine } from '../utils/audio';

interface SupercupModalProps {
  players: Player[];
  onClose: () => void;
  onConfirmVictory: (winnerName: string, reason: string) => void;
}

export const SupercupModal: React.FC<SupercupModalProps> = ({
  players,
  onClose,
  onConfirmVictory,
}) => {
  const eligiblePlayers = players.filter(p => (p.seasonsWon || 0) >= 3);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(
    eligiblePlayers[0]?.id ?? players[0]?.id ?? 0
  );
  const [step, setStep] = useState<'CONFIRM_PLAY' | 'MATCH_OUTCOME'>('CONFIRM_PLAY');

  const selectedPlayer =
    players.find(p => p.id === selectedPlayerId) || eligiblePlayers[0] || players[0];
  const theme = CLUB_THEMES[selectedPlayer.color];

  const handleLeaderWon = () => {
    soundEngine.playVictorySound();
    onConfirmVictory(
      selectedPlayer.name,
      `WON 3 SEASONS (${selectedPlayer.seasonsWon || 3} TITLES) AND TRIUMPHED IN THE SUPERCUP FINAL!`
    );
  };

  const handleLeaderLost = () => {
    soundEngine.playClick();
    alert(`Unlucky! ${selectedPlayer.name} lost the Supercup Final. The league campaign continues...`);
    onClose();
  };

  return (
    <div
      id="supercup-modal-container"
      className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[#1E293B] border border-[#F59E0B]/40 rounded-[2rem] w-full max-w-md p-7 shadow-2xl relative text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-1.5 rounded-full bg-[#0F172A] border border-[#334155]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center mx-auto mb-4 text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight mb-1">
          Supercup Final Challenge
        </h2>

        {step === 'CONFIRM_PLAY' ? (
          <div>
            <p className="text-sm text-slate-300 mb-4">
              Challenging for instant victory after winning <span className="text-[#F59E0B] font-bold">3 Seasons</span>!
            </p>

            {eligiblePlayers.length > 1 && (
              <div className="mb-4 text-left">
                <label className="text-xs text-[#94A3B8] font-bold mb-1.5 block uppercase tracking-wider">
                  Select 3-Season Champion:
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={e => setSelectedPlayerId(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:border-[#F59E0B]"
                >
                  {eligiblePlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.seasonsWon} Seasons Won)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4 mb-6 text-xs text-left text-[#94A3B8] space-y-2">
              <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span className="uppercase tracking-wider">Supercup Qualification:</span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold bg-[#1E293B] p-2.5 rounded-xl border border-[#334155]">
                <Award className="w-4 h-4 text-[#F59E0B]" />
                <span>
                  {selectedPlayer.name} ({theme.clubName}) — {selectedPlayer.seasonsWon || 0} Season Titles
                </span>
              </div>
              <p>• Winning 3 seasons unlocks the challenge for the Supercup Final.</p>
              <p>• If the manager wins the Supercup Match, they are crowned Superclub Champion!</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="cancel-supercup-btn"
                onClick={onClose}
                className="py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-slate-300 border border-[#334155] font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="proceed-supercup-btn"
                onClick={() => {
                  soundEngine.playClick();
                  setStep('MATCH_OUTCOME');
                }}
                className="py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-colors"
              >
                Play Supercup!
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-300 mb-5">
              Did <span className="text-[#F59E0B] font-bold">{selectedPlayer.name}</span> win the Supercup
              Final match?
            </p>

            <div className="space-y-3">
              <button
                type="button"
                id="supercup-win-btn"
                onClick={handleLeaderWon}
                className="w-full py-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-transform active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>YES - {selectedPlayer.name} WON!</span>
              </button>

              <button
                type="button"
                id="supercup-loss-btn"
                onClick={handleLeaderLost}
                className="w-full py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#334155] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-[#EF4444]" />
                <span>NO - Lost the Match</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

