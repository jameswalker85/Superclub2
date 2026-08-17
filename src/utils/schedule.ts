import { GameweekSchedule, MatchFixture, MatchResult, Player } from '../types';

/**
 * Superclub Official Gameweek Schedule Blueprints
 * Player IDs 0 to count-1
 */
export function getScheduleBlueprints(playerCount: number): GameweekSchedule[] {
  if (playerCount === 2) {
    return [
      'ALL_SIM',
      [[0, 1]],
      'ALL_SIM',
      [[1, 0]],
      'ALL_SIM',
    ];
  } else if (playerCount === 3) {
    return [
      [[0, 1], 2],
      'ALL_SIM',
      [[0, 2], 1],
      'ALL_SIM',
      [[1, 2], 0],
    ];
  } else if (playerCount === 4) {
    return [
      [[0, 3], [1, 2]],
      'ALL_SIM',
      [[0, 2], [1, 3]],
      'ALL_SIM',
      [[0, 1], [2, 3]],
    ];
  } else if (playerCount === 5) {
    return [
      [[0, 1], [2, 3], 4],
      [[0, 2], [1, 4], 3],
      [[0, 4], [1, 3], 2],
      [[0, 3], [2, 4], 1],
      [[1, 2], [3, 4], 0],
    ];
  } else if (playerCount === 6) {
    return [
      [[0, 5], [1, 4], [2, 3]],
      [[0, 4], [1, 3], [2, 5]],
      [[0, 3], [1, 2], [4, 5]],
      [[0, 2], [1, 5], [3, 4]],
      [[0, 1], [2, 4], [3, 5]],
    ];
  }
  return [];
}

/**
 * Creates structured MatchFixture objects for all gameweeks in a season
 */
export function generateSeasonFixtures(players: Player[]): MatchFixture[][] {
  const count = players.length;
  const blueprints = getScheduleBlueprints(count);

  return blueprints.map((roundPlan, roundIndex) => {
    const fixtures: MatchFixture[] = [];

    if (roundPlan === 'ALL_SIM') {
      players.forEach((p, idx) => {
        fixtures.push({
          id: `r${roundIndex}-sim-${p.id}`,
          type: 'SIM',
          homePlayerId: p.id,
          result: null,
          recorded: false,
        });
      });
    } else if (Array.isArray(roundPlan)) {
      roundPlan.forEach((item, itemIdx) => {
        if (Array.isArray(item)) {
          // PvP match [homeId, awayId]
          fixtures.push({
            id: `r${roundIndex}-pvp-${itemIdx}-${item[0]}v${item[1]}`,
            type: 'PVP',
            homePlayerId: item[0],
            awayPlayerId: item[1],
            result: null,
            recorded: false,
          });
        } else if (typeof item === 'number') {
          // Bye player playing Sim match
          fixtures.push({
            id: `r${roundIndex}-sim-${item}`,
            type: 'SIM',
            homePlayerId: item,
            result: null,
            recorded: false,
          });
        }
      });
    }

    return fixtures;
  });
}

/**
 * Resolves or modifies a match fixture result and updates player records accurately
 */
export function applyMatchResult(
  players: Player[],
  fixture: MatchFixture,
  newResult: MatchResult
): { updatedPlayers: Player[]; updatedFixture: MatchFixture } {
  // Deep clone to ensure immutability
  const nextPlayers = players.map(p => ({ ...p }));
  const nextFixture = { ...fixture };

  const home = nextPlayers.find(p => p.id === fixture.homePlayerId);
  const away = fixture.awayPlayerId !== undefined ? nextPlayers.find(p => p.id === fixture.awayPlayerId) : undefined;

  if (!home) return { updatedPlayers: players, updatedFixture: fixture };

  // 1. Revert existing recorded result if any
  if (fixture.recorded && fixture.result) {
    if (fixture.type === 'PVP' && away) {
      if (fixture.result === 'HOME') {
        home.points -= 6;
        home.wins = Math.max(0, home.wins - 1);
        away.losses = Math.max(0, away.losses - 1);
      } else if (fixture.result === 'AWAY') {
        away.points -= 6;
        away.wins = Math.max(0, away.wins - 1);
        home.losses = Math.max(0, home.losses - 1);
      } else if (fixture.result === 'DRAW') {
        home.points -= 2;
        home.draws = Math.max(0, home.draws - 1);
        away.points -= 2;
        away.draws = Math.max(0, away.draws - 1);
      }
    } else if (fixture.type === 'SIM') {
      if (fixture.result === 'WIN') {
        home.points -= 6;
        home.wins = Math.max(0, home.wins - 1);
      } else if (fixture.result === 'DRAW') {
        home.points -= 2;
        home.draws = Math.max(0, home.draws - 1);
      } else if (fixture.result === 'LOSS') {
        home.losses = Math.max(0, home.losses - 1);
      }
    }
  }

  // 2. Apply new result if provided
  if (newResult) {
    if (fixture.type === 'PVP' && away) {
      if (newResult === 'HOME') {
        home.points += 6;
        home.wins += 1;
        away.losses += 1;
      } else if (newResult === 'AWAY') {
        away.points += 6;
        away.wins += 1;
        home.losses += 1;
      } else if (newResult === 'DRAW') {
        home.points += 2;
        home.draws += 1;
        away.points += 2;
        away.draws += 1;
      }
    } else if (fixture.type === 'SIM') {
      if (newResult === 'WIN') {
        home.points += 6;
        home.wins += 1;
      } else if (newResult === 'DRAW') {
        home.points += 2;
        home.draws += 1;
      } else if (newResult === 'LOSS') {
        home.losses += 1;
      }
    }
    nextFixture.result = newResult;
    nextFixture.recorded = true;
  } else {
    nextFixture.result = null;
    nextFixture.recorded = false;
  }

  return {
    updatedPlayers: nextPlayers,
    updatedFixture: nextFixture,
  };
}

/**
 * Sorts players according to Superclub tie-break rules:
 * 1. Points (descending)
 * 2. Squad Stars (descending)
 * 3. Total Wins (descending)
 */
export function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return b.wins - a.wins;
  });
}
