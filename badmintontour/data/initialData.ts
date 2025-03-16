import { Team, Group, Tournament, Match } from '../types/tournament';

export const initialTeams: { [key: string]: Team[] } = {
    'A': [
        { id: 'A1', name: 'Minh-P.Hiếu', club: 'ROLEX', players: ['Minh', 'P.Hiếu'] },
        { id: 'A2', name: 'Đạt-Tú', club: 'ROLEX', players: ['Đạt', 'Tú'] },
        { id: 'A3', name: 'Hoàng-Hiếu', club: 'TD', players: ['Hoàng', 'Hiếu'] },
    ],
    'B': [
        { id: 'B1', name: 'Hoàng Anh-Thành', club: 'ROLEX', players: ['Hoàng Anh', 'Thành'] },
        { id: 'B2', name: 'Bella-Hiệp', club: 'ROLEX', players: ['Bella', 'Hiệp'] },
        { id: 'B3', name: 'Tùng-Tiến', club: 'TD', players: ['Tùng', 'Tiến'] },
    ],
    'C': [
        { id: 'C1', name: 'Hồng-Đạt', club: 'ROLEX', players: ['Hồng', 'Đạt'] },
        { id: 'C2', name: 'Ngọc Hiếu-Quang', club: 'ROLEX', players: ['Ngọc Hiếu', 'Quang'] },
        { id: 'C3', name: 'Cung-Tuyên', club: 'Panda', players: ['Cung', 'Tuyên'] },
    ],
    'D': [
        { id: 'D1', name: 'Thương-Sơn', club: 'ROLEX', players: ['Thương', 'Sơn'] },
        { id: 'D2', name: 'Cường-Ninh', club: 'ROLEX', players: ['Cường', 'Ninh'] },
        { id: 'D3', name: 'Vũ-Thịnh', club: 'Panda', players: ['Vũ', 'Thịnh'] },
    ],
};

export function generateGroupMatches(teams: Team[], groupId: string): Match[] {
    const matches: Match[] = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                id: `${groupId}-${i}-${j}`,
                team1: teams[i],
                team2: teams[j],
                group: groupId,
                round: 'group' as const,
                completed: false,
            });
        }
    }
    return matches;
}

export function createInitialTournament(): Tournament {
    const groups: Group[] = Object.entries(initialTeams).map(([groupId, teams]) => ({
        id: groupId,
        name: `Bảng ${groupId}`,
        teams,
        matches: generateGroupMatches(teams, groupId),
    }));

    return {
        groups,
        quarterFinals: [],
        semiFinals: [],
        final: null,
        thirdPlace: null,
    };
}