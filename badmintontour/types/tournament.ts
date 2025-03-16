export interface Team {
    id: string;
    name: string;
    club: string;
    players: string[];
}

export interface Match {
    id: string;
    team1: Team;
    team2: Team;
    score1?: number;
    score2?: number;
    winner?: Team;
    group: string;
    round: 'group' | 'quarter' | 'semi' | 'final' | 'third';
    completed: boolean;
}

export interface Group {
    id: string;
    name: string;
    teams: Team[];
    matches: Match[];
}

export interface GroupStanding {
    team: Team;
    points: number;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    scoreDifference: number;
}

export interface Tournament {
    groups: Group[];
    quarterFinals: Match[];
    semiFinals: Match[];
    final: Match | null;
    thirdPlace: Match | null;
} 