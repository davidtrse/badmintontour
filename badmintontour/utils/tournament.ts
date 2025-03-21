import { Team, Match, Group, GroupStanding, Tournament } from '../types/tournament';

export function calculateGroupStandings(group: Group): GroupStanding[] {
    const standings: { [key: string]: GroupStanding } = {};

    // Initialize standings
    group.teams.forEach(team => {
        standings[team.id] = {
            team,
            points: 0,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            scoreDifference: 0,
        };
    });

    // Calculate standings from matches
    group.matches.forEach(match => {
        if (!match.completed) return;

        const team1Standing = standings[match.team1.id];
        const team2Standing = standings[match.team2.id];

        team1Standing.matchesPlayed++;
        team2Standing.matchesPlayed++;

        if (match.winner?.id === match.team1.id) {
            team1Standing.matchesWon++;
            team2Standing.matchesLost++;
            team1Standing.points += 1;
        } else if (match.winner?.id === match.team2.id) {
            team2Standing.matchesWon++;
            team1Standing.matchesLost++;
            team2Standing.points += 1;
        }

        if (match.score1 !== undefined && match.score2 !== undefined) {
            team1Standing.scoreDifference += match.score1 - match.score2;
            team2Standing.scoreDifference += match.score2 - match.score1;
        }
    });

    return Object.values(standings).sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.scoreDifference !== b.scoreDifference) return b.scoreDifference - a.scoreDifference;
        return b.matchesWon - a.matchesWon;
    });
}

export function generateQuarterFinals(tournament: Tournament): Match[] {
    const groupStandings = tournament.groups.map(group => calculateGroupStandings(group));

    // A1 vs B2
    const match1: Match = {
        id: 'QF1',
        team1: groupStandings[0][0].team, // A1
        team2: groupStandings[1][1].team, // B2
        round: 'quarter',
        group: 'QF',
        completed: false,
    };

    // B1 vs A2
    const match2: Match = {
        id: 'QF2',
        team1: groupStandings[1][0].team, // B1
        team2: groupStandings[0][1].team, // A2
        round: 'quarter',
        group: 'QF',
        completed: false,
    };

    // C1 vs D2
    const match3: Match = {
        id: 'QF3',
        team1: groupStandings[2][0].team, // C1
        team2: groupStandings[3][1].team, // D2
        round: 'quarter',
        group: 'QF',
        completed: false,
    };

    // D1 vs C2
    const match4: Match = {
        id: 'QF4',
        team1: groupStandings[3][0].team, // D1
        team2: groupStandings[2][1].team, // C2
        round: 'quarter',
        group: 'QF',
        completed: false,
    };

    return [match1, match2, match3, match4];
}

export function generateSemiFinals(quarterFinals: Match[]): Match[] {
    if (quarterFinals.length !== 4 || !quarterFinals.every(m => m.completed && m.winner)) {
        throw new Error('All quarter finals must be completed before generating semi finals');
    }

    // Winner QF1 vs Winner QF2
    const match1: Match = {
        id: 'SF1',
        team1: quarterFinals[0].winner!,
        team2: quarterFinals[1].winner!,
        round: 'semi',
        group: 'SF',
        completed: false,
    };

    // Winner QF3 vs Winner QF4
    const match2: Match = {
        id: 'SF2',
        team1: quarterFinals[2].winner!,
        team2: quarterFinals[3].winner!,
        round: 'semi',
        group: 'SF',
        completed: false,
    };

    return [match1, match2];
}

export function generateFinals(semiFinals: Match[]): { final: Match; thirdPlace: Match } {
    if (semiFinals.length !== 2 || !semiFinals.every(m => m.completed && m.winner)) {
        throw new Error('All semi finals must be completed before generating finals');
    }

    const final: Match = {
        id: 'F1',
        team1: semiFinals[0].winner!,
        team2: semiFinals[1].winner!,
        round: 'final',
        group: 'F',
        completed: false,
    };

    const thirdPlace: Match = {
        id: 'TP1',
        team1: semiFinals[0].team1.id === semiFinals[0].winner!.id ? semiFinals[0].team2 : semiFinals[0].team1,
        team2: semiFinals[1].team1.id === semiFinals[1].winner!.id ? semiFinals[1].team2 : semiFinals[1].team1,
        round: 'third',
        group: 'TP',
        completed: false,
    };

    return { final, thirdPlace };
} 