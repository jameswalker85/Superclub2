import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Shield,
  Award
} from 'lucide-react';
import { GamePhase, MatchFixture, MatchResult, Player } from './types';
import { generateSeasonFixtures, applyMatchResult, sortPlayers } from './utils/schedule';
import { soundEngine } from './utils/audio';
import { SetupScreen } from './components/SetupScreen';
import { LeagueTable } from './components/LeagueTable';
import { FixturesPanel } from './components/FixturesPanel';
import { OffSeasonModal } from './components/OffSeasonModal';
import { SupercupModal } from './components/SupercupModal';
import { SuperDuperScreen } from './components/SuperDuperScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { RulesQuickRefModal } from './components/RulesQuickRefModal';

const STORAGE_KEY = 'superclubManager';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasonCount, setSeasonCount] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [targetScore, setTargetScore] = useState<number>(100);
  const [fixturesByRound, setFixturesByRound] = useState<MatchFixture[][]>([]);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('SETUP');
  const [winnerName, setWinnerName] = useState<string>('');
  const [winReason, setWinReason] = useState<string>('');
  const [superDuperContenders, setSuperDuperContenders] = useState<Player[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [showSupercupModal, setShowSupercupModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.players && Array.isArray(s.players) && s.players.length >= 2) {
          setPlayers(s.players);
          setSeasonCount(s.seasonCount ?? 0);
          setCurrentRound(s.currentRound ?? 0);
          setTargetScore(s.targetScore ?? 100);
          setWinnerName(s.winnerName || '');
          setWinReason(s.winReason || '');

          if (s.fixturesByRound && Array.isArray(s.fixturesByRound)) {
            setFixturesByRound(s.fixturesByRound);
          } else {
            // Generate fixtures for the restored player count
            setFixturesByRound(generateSeasonFixtures(s.players));
          }

          if (s.currentPhase) {
            setCurrentPhase(s.currentPhase);
          } else {
            setCurrentPhase('DASHBOARD');
          }

          if (s.soundEnabled !== undefined) {
            setSoundEnabled(s.soundEnabled);
            soundEngine.enabled = s.soundEnabled;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved Superclub state:', e);
    }
  }, []);

  // 2. Autosave state changes
  useEffect(() => {
    if (players.length >= 2 && currentPhase !== 'SETUP') {
      const stateToSave = {
        players,
        seasonCount,
        currentRound,
        targetScore,
        fixturesByRound,
        currentPhase,
        winnerName,
        winReason,
        soundEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [
    players,
    seasonCount,
    currentRound,
    targetScore,
    fixturesByRound,
    currentPhase,
    winnerName,
    winReason,
    soundEnabled,
  ]);

  // Audio mute toggle handler
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
    if (next) soundEngine.playClick();
  };

  // Kickoff game from setup screen
  const handleKickOff = (newPlayers: Player[], target: number) => {
    setPlayers(newPlayers);
    setTargetScore(target);
    setSeasonCount(0); // Season 0 = Pre-Season Draft
    setCurrentRound(0);

    const generated = generateSeasonFixtures(newPlayers);
    setFixturesByRound(generated);

    // Superclub starts with Pre-Season setup phase
    setCurrentPhase('OFFSEASON');
  };

  // Proceed from Off-Season to Active League Gameweeks
  const handleStartNextSeason = (updatedPlayers?: Player[]) => {
    soundEngine.playKickOffWhistle();
    const activePlayers = updatedPlayers || players;
    if (updatedPlayers) {
      setPlayers(updatedPlayers);
    }
    const nextSeason = seasonCount + 1;
    setSeasonCount(nextSeason);
    setCurrentRound(0);

    // Generate fresh schedule for the new season
    const newFixtures = generateSeasonFixtures(activePlayers);
    setFixturesByRound(newFixtures);
    setCurrentPhase('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Match result recorder
  const handleRecordMatchResult = (fixtureId: string, result: MatchResult) => {
    const currentFixtures = fixturesByRound[currentRound] || [];
    const fixtureIndex = currentFixtures.findIndex(f => f.id === fixtureId);

    if (fixtureIndex === -1) return;

    const fixture = currentFixtures[fixtureIndex];
    const { updatedPlayers, updatedFixture } = applyMatchResult(players, fixture, result);

    setPlayers(updatedPlayers);

    // Update fixture state
    const nextFixturesByRound = fixturesByRound.map((roundList, rIdx) => {
      if (rIdx !== currentRound) return roundList;
      return roundList.map((f, fIdx) => (fIdx === fixtureIndex ? updatedFixture : f));
    });

    setFixturesByRound(nextFixturesByRound);
  };

  // Next Round in the season
  const handleNextRound = () => {
    soundEngine.playClick();
    setCurrentRound(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // End season & evaluate victory conditions
  const handleFinishSeason = () => {
    soundEngine.playFullTimeWhistle();

    // Determine who won this season based on standings
    const sorted = sortPlayers(players);
    const seasonChamp = sorted[0];

    // Increment season wins for the champion
    const updatedPlayersWithTitle = players.map(p => {
      if (seasonChamp && p.id === seasonChamp.id) {
        return { ...p, seasonsWon: (p.seasonsWon || 0) + 1 };
      }
      return { ...p, seasonsWon: p.seasonsWon || 0 };
    });

    setPlayers(updatedPlayersWithTitle);

    // Check if any manager reached or exceeded the Target Score
    const eligibleWinners = updatedPlayersWithTitle.filter(p => p.points >= targetScore);

    if (eligibleWinners.length === 1) {
      // Single Champion
      const champ = eligibleWinners[0];
      setWinnerName(champ.name);
      setWinReason(`REACHED ${champ.points} VICTORY POINTS (TARGET: ${targetScore})`);
      setCurrentPhase('VICTORY');
    } else if (eligibleWinners.length > 1) {
      // Multiple managers tied at target -> SuperDuper Cup playoffs!
      setSuperDuperContenders(eligibleWinners);
      setCurrentPhase('SUPERDUPER');
    } else {
      // No one reached target yet -> proceed to regular Off-Season
      setCurrentPhase('OFFSEASON');
    }
  };

  // Adjust victory points manually (+1, -1, +6)
  const handleAdjustPoints = (playerId: number, delta: number) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          points: Math.max(0, p.points + delta),
        };
      })
    );
  };

  // Update squad stars
  const handleUpdateStars = (playerId: number, stars: number) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          stars: Math.max(0, stars),
        };
      })
    );
  };

  // Update seasons won
  const handleUpdateSeasonsWon = (playerId: number, seasonsWon: number) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          seasonsWon: Math.max(0, seasonsWon),
        };
      })
    );
  };

  // Crown champion from Supercup or SuperDuper
  const handleTriggerVictory = (champName: string, reason: string) => {
    setWinnerName(champName);
    setWinReason(reason);
    setShowSupercupModal(false);
    setCurrentPhase('VICTORY');
  };

  // Reset Game
  const handleResetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayers([]);
    setSeasonCount(0);
    setCurrentRound(0);
    setFixturesByRound([]);
    setWinnerName('');
    setWinReason('');
    setSuperDuperContenders([]);
    setCurrentPhase('SETUP');
    setShowResetConfirm(false);
  };

  const sortedLeague = sortPlayers(players);
  const currentRoundFixtures = fixturesByRound[currentRound] || [];
  const hasSupercupQualifiedPlayer = players.some(p => (p.seasonsWon || 0) >= 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Application Navigation */}
      <header className="sticky top-0 z-40 bg-[#1E293B] border-b border-[#334155] shadow-2xl px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="bg-[#22C55E] w-10 h-10 rounded-xl flex items-center justify-center font-black text-[#0F172A] text-xl rotate-3 shadow-[0_0_15px_rgba(34,197,94,0.4)] flex-shrink-0">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-white leading-none">
                  Superclub <span className="text-[#22C55E]">Manager</span>
                </h1>
              </div>
              {currentPhase === 'DASHBOARD' && (
                <div className="text-[11px] text-[#94A3B8] font-bold flex items-center gap-2 mt-0.5">
                  <span className="text-[#22C55E]">SEASON {seasonCount < 10 ? `0${seasonCount}` : seasonCount}</span>
                  <span className="text-[#475569]">•</span>
                  <span className="text-[#F1F5F9]">Gameweek {currentRound + 1} of {fixturesByRound.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Tools & Audio Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentPhase === 'DASHBOARD' && (
              <>
                {/* Supercup Action - Only available once a player wins 3 seasons */}
                {hasSupercupQualifiedPlayer && (
                  <button
                    type="button"
                    id="open-supercup-btn"
                    onClick={() => {
                      soundEngine.playClick();
                      setShowSupercupModal(true);
                    }}
                    className="px-4 py-2 rounded-full bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] border border-[#F59E0B]/50 transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse cursor-pointer"
                    title="Play Supercup (Unlocked: 3 Season Wins)"
                  >
                    <Award className="w-4 h-4 text-[#F59E0B]" />
                    <span>Supercup Ready</span>
                  </button>
                )}
              </>
            )}

            {/* Rules Quick Ref */}
            <button
              type="button"
              id="open-rules-btn"
              onClick={() => {
                soundEngine.playClick();
                setShowRulesModal(true);
              }}
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155] transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Superclub Rules & Scoring"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Rules</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              id="sound-toggle-btn"
              onClick={toggleSound}
              className={`p-2 sm:p-2.5 rounded-full border transition-all ${
                soundEnabled
                  ? 'bg-[#0F172A] border-[#334155] text-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                  : 'bg-[#0F172A] border-[#334155] text-[#64748B]'
              }`}
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Game Confirmation */}
            {currentPhase === 'DASHBOARD' && (
              <button
                type="button"
                id="reset-game-header-btn"
                onClick={() => setShowResetConfirm(true)}
                className="p-2 sm:p-2.5 rounded-full bg-[#0F172A] hover:bg-red-950/40 text-[#64748B] hover:text-[#EF4444] border border-[#334155] hover:border-[#EF4444]/40 transition-colors"
                title="Reset Game"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 bg-radial-glow">
        {currentPhase === 'SETUP' && (
          <SetupScreen onKickOff={handleKickOff} defaultTargetScore={targetScore} />
        )}

        {currentPhase === 'DASHBOARD' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
              {/* League Table (Columns 1-7 on desktop) */}
              <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7">
                <LeagueTable
                  players={players}
                  targetScore={targetScore}
                  onAdjustPoints={handleAdjustPoints}
                  onUpdateStars={handleUpdateStars}
                  onUpdateSeasonsWon={handleUpdateSeasonsWon}
                />
              </div>

              {/* Fixtures & Gameweek Manager (Columns 8-12 on desktop) */}
              <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5">
                <FixturesPanel
                  seasonCount={seasonCount}
                  currentRound={currentRound}
                  totalRounds={fixturesByRound.length}
                  fixtures={currentRoundFixtures}
                  players={players}
                  onRecordResult={handleRecordMatchResult}
                  onNextRound={handleNextRound}
                  onFinishSeason={handleFinishSeason}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar styled to match Vibrant Palette */}
      <footer className="bg-[#0F172A] border-t border-[#334155] px-6 sm:px-10 py-4 text-[11px] font-bold uppercase tracking-widest text-[#64748B] flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span>Live Companion Active</span>
          </div>
          <span className="hidden sm:inline text-[#475569]">•</span>
          <span className="hidden sm:inline">Target: {targetScore} VP</span>
          <span className="hidden md:inline text-[#475569]">•</span>
          <span className="hidden md:inline">5 Gameweeks / Season</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="hover:text-white transition-colors"
          >
            Game Rules
          </button>
          {currentPhase === 'DASHBOARD' && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="hover:text-[#EF4444] text-red-400/80 transition-colors"
            >
              Reset Session
            </button>
          )}
        </div>
      </footer>

      {/* Off-Season Full Overlay Modal */}
      {currentPhase === 'OFFSEASON' && (
        <OffSeasonModal
          seasonCount={seasonCount}
          players={players}
          onStartNextSeason={handleStartNextSeason}
        />
      )}

      {/* Supercup Modal */}
      {showSupercupModal && (
        <SupercupModal
          players={players}
          onClose={() => setShowSupercupModal(false)}
          onConfirmVictory={handleTriggerVictory}
        />
      )}

      {/* SuperDuper Cup Decider (Tied at target points) */}
      {currentPhase === 'SUPERDUPER' && (
        <SuperDuperScreen
          contenders={superDuperContenders}
          targetScore={targetScore}
          onSelectWinner={handleTriggerVictory}
        />
      )}

      {/* Victory Screen */}
      {currentPhase === 'VICTORY' && (
        <VictoryScreen
          winnerName={winnerName}
          winReason={winReason}
          players={players}
          seasonCount={seasonCount}
          onNewGame={handleResetGame}
        />
      )}

      {/* Auxiliary Dialogs */}
      {showRulesModal && <RulesQuickRefModal onClose={() => setShowRulesModal(false)} />}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3 text-red-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Reset Current Game?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This will permanently clear the current season standings and saved match data.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-reset-btn"
                onClick={handleResetGame}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20"
              >
                Yes, Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

