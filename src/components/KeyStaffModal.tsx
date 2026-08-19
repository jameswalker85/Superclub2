import React, { useState } from 'react';
import {
  Users,
  Check,
  X,
  Sparkles,
  DollarSign,
  Building,
  TrendingUp,
  Percent,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Player } from '../types';
import { CLUB_THEMES, getBandForPoints } from '../utils/constants';
import {
  INCOME_KEY_STAFF,
  calculateWages,
  getEffectiveStadiumBand,
  calculateStaffCashBonus
} from '../utils/staff';
import { soundEngine } from '../utils/audio';

interface KeyStaffModalProps {
  players: Player[];
  initialPlayerId?: number;
  onClose: () => void;
  onToggleStaff: (playerId: number, staffId: string) => void;
}

export const KeyStaffModal: React.FC<KeyStaffModalProps> = ({
  players,
  initialPlayerId,
  onClose,
  onToggleStaff,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(() => {
    if (initialPlayerId && players.some(p => p.id === initialPlayerId)) {
      return initialPlayerId;
    }
    return players[0]?.id || 1;
  });

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  if (!activePlayer) return null;

  const theme = CLUB_THEMES[activePlayer.color];
  const activeStaffIds = activePlayer.keyStaff || [];
  const band = getBandForPoints(activePlayer.points);

  const hasSally = activeStaffIds.includes('sally_reecut');
  const hasMeme = activeStaffIds.includes('meme_shearer');
  const { baseWages, finalWages, savedWages } = calculateWages(activePlayer.stars, hasSally);
  const effectiveStadiumBand = getEffectiveStadiumBand(band.name, hasMeme);
  const { total: totalCashBonus } = calculateStaffCashBonus(activeStaffIds);

  const handleToggle = (staffId: string) => {
    soundEngine.playClick();
    onToggleStaff(activePlayer.id, staffId);
  };

  const getStaffIcon = (id: string) => {
    switch (id) {
      case 'sally_reecut':
        return <Percent className="w-4 h-4 text-rose-400" />;
      case 'meme_shearer':
        return <Building className="w-4 h-4 text-sky-400" />;
      case 'roi_surge':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case 'bill_benjamin':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'dwight_price':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      id="key-staff-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] w-full max-w-2xl my-auto p-5 sm:p-7 shadow-2xl relative">
        {/* Close Button */}
        <button
          type="button"
          id="close-key-staff-modal"
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0F172A] hover:bg-[#334155] text-slate-400 hover:text-white border border-[#334155] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight">
              Key Staff Roster
            </h2>
            <p className="text-xs text-[#94A3B8] font-semibold">
              Manage income-modifying key staff hired by your club
            </p>
          </div>
        </div>

        {/* Manager Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-[#334155] scrollbar-none">
          {players.map(p => {
            const pTheme = CLUB_THEMES[p.color];
            const isSelected = p.id === activePlayer.id;
            const staffCount = (p.keyStaff || []).length;

            return (
              <button
                key={p.id}
                type="button"
                id={`staff-tab-${p.id}`}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedPlayerId(p.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-2 shadow-md'
                    : 'bg-[#0F172A]/50 text-slate-400 hover:text-slate-200 border border-[#334155]'
                }`}
                style={{
                  borderColor: isSelected ? pTheme.primary : undefined,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pTheme.primary }}
                />
                <span>{p.name}</span>
                {staffCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {staffCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Manager Summary Pill */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: theme.primary }}
            />
            <div>
              <div className="font-black text-white text-sm leading-none flex items-center gap-2">
                <span>{activePlayer.name}</span>
                <span className="text-xs font-semibold text-slate-400">({theme.clubName})</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Current Band: <span className={band.colorCls}>{band.name}</span> • Squad Stars:{' '}
                <span className="text-amber-400 font-mono font-bold">{activePlayer.stars}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {hasSally && (
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px]">
                Wages: -{savedWages}M
              </span>
            )}
            {hasMeme && (
              <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px]">
                Stadium: {effectiveStadiumBand}
              </span>
            )}
            {totalCashBonus > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px]">
                +{totalCashBonus}M Bonus
              </span>
            )}
            {!hasSally && !hasMeme && totalCashBonus === 0 && (
              <span className="text-slate-500 text-[11px]">No staff bonuses active</span>
            )}
          </div>
        </div>

        {/* Staff Checkbox List */}
        <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1" id="key-staff-list">
          {INCOME_KEY_STAFF.map(staff => {
            const isActive = activeStaffIds.includes(staff.id);

            return (
              <div
                key={staff.id}
                id={`staff-card-${staff.id}`}
                onClick={() => handleToggle(staff.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                  isActive
                    ? 'bg-[#0F172A] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'bg-[#0F172A]/60 hover:bg-[#0F172A] border-[#334155]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-[#1E293B] border border-slate-700 text-transparent hover:border-slate-500'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  </div>

                  {/* Staff Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{staff.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.2 rounded">
                        {staff.role}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${staff.badgeBg} ${staff.badgeBorder} ${staff.badgeColor}`}
                      >
                        {staff.effectTitle}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{staff.description}</p>

                    {/* Active dynamic preview note */}
                    {isActive && staff.id === 'sally_reecut' && (
                      <div className="text-[11px] font-mono text-rose-300 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 mt-1">
                        Active Wage Calculation: {baseWages} stars = {baseWages}M →{' '}
                        <strong className="text-white">{finalWages}M</strong> (saved {savedWages}M)
                      </div>
                    )}
                    {isActive && staff.id === 'meme_shearer' && (
                      <div className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20 mt-1">
                        Active Stadium Tier: Finished on <strong>{band.name}</strong> ➡️ collects as{' '}
                        <strong className="text-white">{effectiveStadiumBand}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side icon */}
                <div className="p-2 rounded-xl bg-[#1E293B] border border-[#334155] flex-shrink-0">
                  {getStaffIcon(staff.id)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & Done button */}
        <div className="mt-5 pt-4 border-t border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Staff bonuses are automatically calculated in Pre-Season & Off-Season finances.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
