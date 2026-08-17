import React from 'react';
import { BookOpen, X, Trophy, Swords, Coins, ShieldAlert } from 'lucide-react';
import { POINT_BANDS, REWARD_TIERS } from '../utils/constants';

interface RulesQuickRefModalProps {
  onClose: () => void;
}

export const RulesQuickRefModal: React.FC<RulesQuickRefModalProps> = ({ onClose }) => {
  return (
    <div
      id="rules-quickref-modal-container"
      className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#1E293B] border border-[#334155] rounded-[2.5rem] w-full max-w-xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-1.5 rounded-full bg-[#0F172A] border border-[#334155]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-[#22C55E]" />
          <h2 className="text-xl font-black italic text-white uppercase tracking-tight">
            Superclub Quick Rules & Scoring
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8] font-medium mb-6">
          Official match points, off-season procedures, and victory thresholds
        </p>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Matchday Points */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4.5">
            <div className="flex items-center gap-2 font-black italic text-[#F59E0B] text-sm mb-2.5 uppercase tracking-wider">
              <Swords className="w-4 h-4 text-[#F59E0B]" />
              <span>Matchday Points</span>
            </div>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300 font-medium">
              <li><strong className="text-[#22C55E]">PvP Win:</strong> 6 Points (+1 Win)</li>
              <li><strong className="text-[#F59E0B]">PvP Draw:</strong> 2 Points each (+1 Draw)</li>
              <li><strong className="text-[#EF4444]">PvP Loss:</strong> 0 Points (+1 Loss)</li>
              <li><strong className="text-[#22C55E]">Sim Win:</strong> 6 Points</li>
              <li><strong className="text-[#F59E0B]">Sim Draw:</strong> 2 Points</li>
              <li><strong className="text-[#EF4444]">Sim Loss:</strong> 0 Points</li>
            </ul>
          </div>

          {/* Point Bands */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4.5">
            <div className="flex items-center gap-2 font-black italic text-[#3B82F6] text-sm mb-2.5 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-[#3B82F6]" />
              <span>Point Bands</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {POINT_BANDS.map(b => (
                <div key={b.name} className={`p-3 rounded-2xl border ${b.bgCls}`}>
                  <div className="font-black text-xs">{b.name}</div>
                  <div className="text-[10px] opacity-80 font-bold">{b.minPoints}+ Victory Points</div>
                </div>
              ))}
            </div>
          </div>

          {/* Offseason Placement Rewards */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4.5">
            <div className="flex items-center gap-2 font-black italic text-[#22C55E] text-sm mb-2.5 uppercase tracking-wider">
              <Coins className="w-4 h-4 text-[#22C55E]" />
              <span>Placement Rewards & Wages</span>
            </div>
            <p className="mb-2 text-[#94A3B8] font-medium">
              Awarded at the end of each season based on league standings:
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              {REWARD_TIERS.map((tier, idx) => (
                <div key={idx} className="bg-[#1E293B] border border-[#334155] rounded-xl p-2">
                  <span className="text-[#94A3B8] text-[10px] font-bold">#{idx + 1}: </span>
                  <span className="text-[#F59E0B] font-black">{tier}M</span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[#EF4444] font-bold text-[11px]">
              ⚠️ Wages: Every squad Star costs 1M in player wages at off-season.
            </p>
          </div>

          {/* Victory Conditions */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-4.5">
            <div className="flex items-center gap-2 font-black italic text-[#A855F7] text-sm mb-2.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-[#A855F7]" />
              <span>Victory Conditions</span>
            </div>
            <ul className="space-y-2 pl-4 list-disc text-slate-300 font-medium">
              <li>
                <strong className="text-white">Target Victory Points:</strong> Reaching the league target (e.g. 100 VP) at the end of a season wins the game.
              </li>
              <li>
                <strong className="text-white">Starting Base:</strong> At the start of each season, managers&apos; Victory Points reset to match their squad&apos;s updated total base stars (determined following scouting, training, and transfers).
              </li>
              <li>
                <strong className="text-white">SuperDuper Cup:</strong> If 2+ managers reach the target in the same season, they face off in a playoff match.
              </li>
              <li>
                <strong className="text-white">Supercup:</strong> Winning 3 seasons allows a manager to challenge the Supercup match for instant victory!
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-4 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] text-xs font-black uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
